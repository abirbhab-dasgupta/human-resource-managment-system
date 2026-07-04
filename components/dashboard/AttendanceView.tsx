"use client";

import { useEffect, useState } from "react";

type Record = { id: string; date: string; checkIn: string | null; checkOut: string | null; status: string; name?: string };

export default function AttendanceView({ isAdmin }: { isAdmin: boolean }) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/attendance")
      .then((r) => r.json())
      .then((d) => setRecords(d.records ?? []))
      .finally(() => setLoading(false));
  }, []);

  function fmtTime(v: string | null) {
    if (!v) return "—";
    return new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="surface-card">
      <h1 className="mb-4 font-sans text-lg font-semibold text-ink">Attendance {isAdmin ? "— All Employees" : ""}</h1>
      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-sm text-muted">No attendance records yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                {isAdmin && <th>Employee</th>}
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  {isAdmin && <td>{r.name}</td>}
                  <td>{r.date}</td>
                  <td>{fmtTime(r.checkIn)}</td>
                  <td>{fmtTime(r.checkOut)}</td>
                  <td>
                    <span className={`pill ${r.status === "present" ? "pill-approved" : r.status === "leave" ? "pill-pending" : "pill-rejected"}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}