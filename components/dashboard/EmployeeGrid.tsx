"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Employee = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  employeeCode: string | null;
  status: "present" | "leave" | "absent";
};

export default function EmployeeGrid({ base, isAdmin }: { base: "admin" | "employee"; isAdmin: boolean }) {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/employees")
      .then((r) => r.json())
      .then((d) => setEmployees(d.employees ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filtered = employees.filter((e) =>
    (e.name + e.email + (e.employeeCode ?? "")).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isAdmin && (
          <button onClick={() => setShowNew(true)} className="btn-sm-primary self-start">
            + New
          </button>
        )}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search employees..."
          className="field-input sm:max-w-xs"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading employees...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">No employees found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((emp) => (
            <div key={emp.id} className="emp-card" onClick={() => router.push(`/dashboard/${base}/employees/${emp.id}`)}>
              <span className={`absolute right-3 top-3 status-dot status-dot-${emp.status}`} />
              <div className="emp-avatar">
                {emp.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={emp.image} alt={emp.name} className="h-full w-full object-cover" />
                ) : (
                  emp.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                )}
              </div>
              <p className="font-sans text-sm font-medium text-ink">{emp.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">{emp.role}</p>
            </div>
          ))}
        </div>
      )}

      {showNew && <NewEmployeeModal onClose={() => setShowNew(false)} onCreated={load} />}
    </div>
  );
}

function NewEmployeeModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ employeeCode: string; tempPassword: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, jobPosition, department }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create employee");
      setResult(data);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6">
        {result ? (
          <div>
            <h2 className="mb-3 font-sans text-lg font-semibold text-ink">Employee Created</h2>
            <p className="text-sm text-muted">Share these credentials with the employee:</p>
            <div className="mt-3 space-y-2 rounded-md border border-border bg-background p-3 font-mono text-sm">
              <p>Login ID: {result.employeeCode}</p>
              <p>Temp Password: {result.tempPassword}</p>
            </div>
            <button onClick={onClose} className="btn-sm-primary mt-4 w-full">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 className="mb-4 font-sans text-lg font-semibold text-ink">New Employee</h2>
            {error && <div className="form-error mb-3">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Job Position</label>
                <input className="form-input" value={jobPosition} onChange={(e) => setJobPosition(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Department</label>
                <input className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={busy} className="btn-sm-primary flex-1">
                {busy ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}