'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth-client';

export default function SignUpPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
              body: JSON.stringify({ companyName }),
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
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="auth-brand-name">HRFlow</span>
        </div>

        <div className="mb-6 sm:mb-7">
          <h1 className="font-mono text-lg font-bold text-white sm:text-xl">Set up your company</h1>
          <p className="mt-1.5 text-sm text-muted">Create the HR/Admin account for your organization</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5">
          {error && <div className="form-error">{error}</div>}

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="companyName" className="form-label">Company Name</label>
              <input id="companyName" type="text" placeholder="Odoo India" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="form-input" required />
            </div>
            <button
              type="button"
              aria-label="Upload company logo"
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-sm"
              style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-end))' }}
            >
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
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
            <p className="-mt-2 text-xs text-amber-400">
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