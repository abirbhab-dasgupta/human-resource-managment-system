"use client";

import { useEffect, useState } from "react";

type LeaveReq = { id: string; userId: string; type: string; startDate: string; endDate: string; reason: string | null; status: string; name?: string };

export default function LeaveView({ isAdmin }: { isAdmin: boolean }) {
  const [requests, setRequests] = useState<LeaveReq[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/leave").then((r) => r.json()).then((d) => setRequests(d.requests ?? [])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function act(id: string, status: "approved" | "rejected") {
    await fetch(`/api/leave/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="surface-card">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-lg font-semibold text-ink">Time Off {isAdmin ? "— Requests" : ""}</h1>
        {!isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-sm-primary">
            Apply for Leave
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-muted">No leave requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                {isAdmin && <th>Employee</th>}
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  {isAdmin && <td>{r.name}</td>}
                  <td>{r.type}</td>
                  <td>{r.startDate}</td>
                  <td>{r.endDate}</td>
                  <td>{r.reason || "—"}</td>
                  <td>
                    <span className={`pill ${r.status === "approved" ? "pill-approved" : r.status === "rejected" ? "pill-rejected" : "pill-pending"}`}>
                      {r.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      {r.status === "pending" ? (
                        <div className="flex gap-2">
                          <button onClick={() => act(r.id, "approved")} className="btn-sm-primary px-3 py-1.5 text-[10px]">Approve</button>
                          <button onClick={() => act(r.id, "rejected")} className="btn-secondary px-3 py-1.5 text-[10px]">Reject</button>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <ApplyLeaveModal onClose={() => setShowForm(false)} onCreated={load} />}
    </div>
  );
}

function ApplyLeaveModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [type, setType] = useState("Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, startDate, endDate, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit request");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 font-sans text-lg font-semibold text-ink">Apply for Leave</h2>
        {error && <div className="form-error mb-3">{error}</div>}
        <div className="space-y-3">
          <div>
            <label className="form-label">Type</label>
            <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option>Leave</option>
              <option>Sick Leave</option>
              <option>Casual Leave</option>
              <option>Unpaid Leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">From</label>
              <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="form-label">To</label>
              <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="form-label">Reason</label>
            <textarea className="form-input min-h-20" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={busy} className="btn-sm-primary flex-1">{busy ? "Submitting..." : "Submit"}</button>
        </div>
      </form>
    </div>
  );
}