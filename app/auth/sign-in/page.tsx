'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, authClient } from '@/lib/auth-client';

export default function SignInPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const email = identifier.includes('@')
        ? identifier
        : await resolveEmailFromEmployeeCode(identifier);

      await signIn.email(
        { email, password },
        {
          onSuccess: async () => {
            const { data } = await authClient.getSession();
            const role = data?.user.role;
            router.push(role === 'admin' || role === 'hr' ? '/dashboard/admin' : '/dashboard/employee');
          },
          onError: (ctx) => setError(ctx.error.message || 'Invalid credentials'),
        }
      );
    } catch {
      setError('Invalid Login ID/Email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-background flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <Image src="/logo.svg" alt="WorkForcee" width={36} height={36} />
          </div>
          <span className="auth-brand-name">WorkForce</span>
        </div>

        <div className="mb-6 sm:mb-7">
          <h1 className="font-sans text-xl font-semibold text-ink sm:text-2xl">Sign In</h1>
          <p className="mt-1.5 text-sm text-muted">Every workday, perfectly aligned.</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-5">
          {error && <div className="form-error">{error}</div>}

          <div>
            <label htmlFor="identifier" className="form-label">Login Id / Email</label>
            <input
              id="identifier"
              type="text"
              placeholder="OIJODO20220001 or you@company.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-[38px] text-muted hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link href="/auth/sign-up">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

async function resolveEmailFromEmployeeCode(code: string): Promise<string> {
  const res = await fetch(`/api/employees/resolve?code=${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error('Not found');
  const { email } = await res.json();
  return email;
}