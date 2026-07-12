"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState("");
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);

    async function submit(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        await fetch("/api/password-reset-requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier }),
        });
        setBusy(false);
        setDone(true);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8">
                {done ? (
                    <div>
                        <h1 className="mb-2 font-sans text-lg font-semibold text-ink">Request sent</h1>
                        <p className="text-sm text-muted">
                            If that account exists, your admin has been notified and will reset your password for you. They&apos;ll share
                            a new temporary password with you directly.
                        </p>
                        <Link href="/auth/sign-in" className="btn-secondary mt-6 inline-block">
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        <h1 className="mb-2 font-sans text-lg font-semibold text-ink">Forgot your password?</h1>
                        <p className="mb-6 text-sm text-muted">
                            Enter your login ID or email. Your admin will be notified and can reset your password for you.
                        </p>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="field-label">Login ID / Email</label>
                                <input
                                    className="field-input"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="0IJ00D20220001 or you@company.com"
                                    required
                                />
                            </div>
                            <button type="submit" disabled={busy} className="btn-sm-primary w-full">
                                {busy ? "Sending..." : "Notify My Admin"}
                            </button>
                        </form>
                        <Link href="/auth/sign-in" className="mt-4 inline-block text-sm text-muted hover:text-ink">
                            Back to Sign In
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}