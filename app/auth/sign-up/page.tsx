'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signUp } from '@/lib/auth-client';

const MAX_LOGO_BYTES = 250 * 1024; // 250KB, stored as a data URL on the company row

export default function SignUpPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError('');

    if (!file.type.startsWith('image/')) {
      setLogoError('Please choose an image file');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError(`Image must be under ${Math.round(MAX_LOGO_BYTES / 1024)}KB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.onerror = () => setLogoError('Could not read that file');
    reader.readAsDataURL(file);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 8) return setError('Password must be at least 8 characters');

    setLoading(true);
    try {
      await signUp.email(
        { email, password, name, phone } as Parameters<typeof signUp.email>[0],
        {
          onSuccess: async () => {
            await fetch('/api/company/bootstrap', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyName, logoUrl: logoDataUrl }),
            });
            router.push('/dashboard/admin');
          },
          onError: (ctx) => setError(ctx.error.message || 'Failed to create account'),
        }
      );
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-background flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="auth-card sm:max-w-lg">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <Image src="/logo.svg" alt="WorkForce" width={36} height={36} />
          </div>
          <span className="auth-brand-name">WorkForce</span>
        </div>

        <div className="mb-6 sm:mb-7">
          <h1 className="font-sans text-lg font-semibold text-ink sm:text-xl">Set up your company</h1>
          <p className="mt-1.5 text-sm text-muted">Create the HR/Admin account for your organization</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5">
          {error && <div className="form-error">{error}</div>}

          <div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label htmlFor="companyName" className="form-label">Company Name</label>
                <input id="companyName" type="text" placeholder="Odoo India" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="form-input" required />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <button
                type="button"
                aria-label={logoDataUrl ? 'Change company logo' : 'Upload company logo'}
                onClick={() => fileInputRef.current?.click()}
                className="logo-upload-btn overflow-hidden"
              >
                {logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoDataUrl} alt="Company logo preview" className="h-full w-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
            {logoError && <p className="mt-1.5 text-xs text-destructive">{logoError}</p>}
          </div>

          <div>
            <label htmlFor="name" className="form-label">Your Name</label>
            <input id="name" type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
            </div>
            <div>
              <label htmlFor="phone" className="form-label">Phone</label>
              <input id="phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input" required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required minLength={8} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input" required />
            </div>
          </div>

          {password.length > 0 && password.length < 8 && (
            <p className="form-hint-amber -mt-2">
              Password must be at least 8 characters ({8 - password.length} more needed)
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link href="/auth/sign-in">Sign In</Link>
        </p>
      </div>
    </div>
  );
}