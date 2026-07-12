"use client";

import { useEffect, useState } from "react";

type Req = { id: string; userId: string; name: string; email: string; employeeCode: string | null; createdAt: string };

export default function PasswordResetRequests() {
    const [requests, setRequests] = useState<Req[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [result, setResult] = useState<{ name: string; tempPassword: string } | null>(null);

    function load() {
        setLoading(true);
        fetch("/api/password-reset-requests")
            .then((r) => r.json())
            .then((d) => setRequests(d.requests ?? []))
            .finally(() => setLoading(false));
    }
    useEffect(load, []);

    async function resolve(req: Req) {
        setBusyId(req.id);
        const res = await fetch(`/api/password-reset-requests/${req.id}`, { method: "PATCH" });
        const data = await res.json();
        setBusyId(null);
        if (res.ok) {
            setResult({ name: req.name, tempPassword: data.tempPassword });
            load();
        }
    }

    return (
        <div className="surface-card">
            <h1 className="mb-1 font-sans text-lg font-semibold text-ink">Password Reset Requests</h1>
            <p className="mb-5 text-sm text-muted">
                Employees who forgot their password show up here. Generate a new temporary password and share it with them
                directly — they&apos;ll be required to set their own password on next sign-in.
            </p>

            {loading ? (
                <p className="text-sm text-muted">Loading...</p>
            ) : requests.length === 0 ? (
                <p className="text-sm text-muted">No pending requests.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table-base">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Login ID</th>
                                <th>Email</th>
                                <th>Requested</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.name}</td>
                                    <td className="font-mono text-xs">{r.employeeCode}</td>
                                    <td>{r.email}</td>
                                    <td className="text-xs text-muted">{new Date(r.createdAt).toLocaleString()}</td>
                                    <td>
                                        <button
                                            onClick={() => resolve(r)}
                                            disabled={busyId === r.id}
                                            className="btn-sm-primary px-3 py-1.5 text-[10px]"
                                        >
                                            {busyId === r.id ? "Working..." : "Reset & Generate Password"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {result && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6">
                        <h2 className="mb-3 font-sans text-lg font-semibold text-ink">Password Reset</h2>
                        <p className="mb-3 text-sm text-muted">
                            Share this temporary password with <strong className="text-ink">{result.name}</strong>. They&apos;ll be
                            asked to set a new one the next time they sign in.
                        </p>
                        <div className="rounded-md border border-border bg-background p-3 font-mono text-sm text-ink">
                            {result.tempPassword}
                        </div>
                        <button onClick={() => setResult(null)} className="btn-sm-primary mt-4 w-full">
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}