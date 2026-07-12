"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function submit(e: FormEvent) {
        e.preventDefault();
        setError("");
        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }
        setBusy(true);
        const { error: changeError } = await authClient.changePassword({
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
        });
        if (changeError) {
            setBusy(false);
            setError(changeError.message || "Could not update password.");
            return;
        }

        await fetch("/api/account/clear-reset-flag", { method: "PATCH" });
        setBusy(false);
        router.push("/");
        router.refresh();
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8">
                <h1 className="mb-2 font-sans text-lg font-semibold text-ink">Set a new password</h1>
                <p className="mb-6 text-sm text-muted">
                    You&apos;re signed in with a temporary password. Choose a new one to continue.
                </p>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="field-label">Temporary Password</label>
                        <input
                            type="password"
                            className="field-input"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="field-label">New Password</label>
                        <input
                            type="password"
                            className="field-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    <div>
                        <label className="field-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="field-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <button type="submit" disabled={busy} className="btn-sm-primary w-full">
                        {busy ? "Saving..." : "Set Password & Continue"}
                    </button>
                </form>
            </div>
        </div>
    );
}