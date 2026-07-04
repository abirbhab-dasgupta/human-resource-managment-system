"use client";

import { useEffect, useState } from "react";

type Row = { id: string; name: string; employeeCode: string | null };

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Row[]>([]);

  useEffect(() => {
    fetch("/api/employees").then((r) => r.json()).then((d) => setEmployees(d.employees ?? []));
  }, []);

  return (
    <div className="surface-card">
      <h1 className="mb-4 font-sans text-lg font-semibold text-ink">Payroll</h1>
      <p className="mb-4 text-sm text-muted">Open an employee&apos;s profile and use the Salary Info tab to manage pay components.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {employees.map((e) => (
          <a key={e.id} href={`/dashboard/admin/employees/${e.id}`} className="rounded-md border border-border p-3 text-sm text-ink transition-colors hover:border-primary">
            <p className="font-medium">{e.name}</p>
            <p className="font-mono text-xs text-muted">{e.employeeCode}</p>
          </a>
        ))}
      </div>
    </div>
  );
}