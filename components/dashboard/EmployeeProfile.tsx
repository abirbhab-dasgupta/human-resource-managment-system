"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

const MAX_PHOTO_BYTES = 250 * 1024;

type Details = Record<string, string | null>;
type Salary = {
  monthlyWage: number;
  workingDaysPerWeek: number;
  breakTimeHours: number;
  pfEmployeePct: number;
  pfEmployerPct: number;
  professionalTax: number;
  breakdown: {
    basic: number; hra: number; standardAllowance: number; performanceBonus: number;
    leaveTravelAllowance: number; fixedAllowance: number; pfEmployee: number; pfEmployer: number;
    professionalTax: number; netMonthly: number;
  };
};

export default function EmployeeProfile({ userId }: { userId: string }) {
  const [data, setData] = useState<{
    employee: { id: string; name: string; email: string; image: string | null; role: string; employeeCode: string | null; phone: string | null; companyName: string | null; active: boolean };
    details: Details | null;
    salary: Salary | null;
    canEdit: boolean;
    canViewSalary: boolean;
    canViewBank: boolean;
    canManageStatus: boolean;
    isSelf: boolean;
    viewerRole: string;
  } | null>(null);
  const [tab, setTab] = useState<"resume" | "private" | "salary" | "security">("resume");
  const [editing, setEditing] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    fetch(`/api/employees/${userId}`).then((r) => r.json()).then(setData);
  }
  useEffect(load, [userId]);

  if (!data) return <p className="text-sm text-muted">Loading profile...</p>;
  const { employee, details, salary, canEdit, canViewSalary, canViewBank, canManageStatus, isSelf, viewerRole } = data;

  async function toggleStatus() {
    setStatusBusy(true);
    await fetch(`/api/employees/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: employee.active ? "deactivate" : "reactivate" }),
    });
    setStatusBusy(false);
    load();
  }

  function onPhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError("");
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError(`Image must be under ${Math.round(MAX_PHOTO_BYTES / 1024)}KB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setPhotoBusy(true);
      await fetch(`/api/employees/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: reader.result as string }),
      });
      setPhotoBusy(false);
      load();
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="surface-card">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
        <div
          className={`emp-avatar group relative h-20 w-20 shrink-0 text-2xl ${canEdit ? "cursor-pointer" : ""}`}
          onClick={() => canEdit && fileInputRef.current?.click()}
          title={canEdit ? "Update profile photo" : undefined}
        >
          {employee.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={employee.image} alt={employee.name} className="h-full w-full object-cover" />
          ) : (
            employee.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
          )}
          {canEdit && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 font-mono text-[9px] uppercase tracking-wider text-white opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
              {photoBusy ? "Saving..." : "Change"}
            </div>
          )}
          {canEdit && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onPhotoFile}
              className="hidden"
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-sans text-xl font-semibold text-ink">{employee.name}</h1>
            {!employee.active && <span className="pill pill-rejected">Inactive</span>}
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted">{employee.employeeCode} · {employee.role}</p>
          <p className="mt-1 text-sm text-muted">{employee.email}</p>
          {photoError && <p className="mt-1 text-xs text-destructive">{photoError}</p>}
          {canManageStatus && (
            <button
              onClick={toggleStatus}
              disabled={statusBusy}
              className={employee.active ? "btn-secondary mt-2 text-destructive" : "btn-sm-primary mt-2"}
            >
              {statusBusy ? "Working..." : employee.active ? "Deactivate Employee" : "Reactivate Employee"}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:text-right">
          <span className="text-muted">Company</span><span className="text-ink">{employee.companyName}</span>
          <span className="text-muted">Department</span><span className="text-ink">{details?.department ?? "—"}</span>
          <span className="text-muted">Manager</span><span className="text-ink">{details?.manager ?? "—"}</span>
          <span className="text-muted">Location</span><span className="text-ink">{details?.location ?? "—"}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-1 border-b border-border">
        <button className={tab === "resume" ? "tab-btn-active" : "tab-btn"} onClick={() => setTab("resume")}>Resume</button>
        <button className={tab === "private" ? "tab-btn-active" : "tab-btn"} onClick={() => setTab("private")}>Private Info</button>
        {canViewSalary && (
          <button className={tab === "salary" ? "tab-btn-active" : "tab-btn"} onClick={() => setTab("salary")}>Salary Info</button>
        )}
        {isSelf && (
          <button className={tab === "security" ? "tab-btn-active" : "tab-btn"} onClick={() => setTab("security")}>Security</button>
        )}
      </div>

      <div className="pt-5">
        {tab === "resume" && (
          <ResumeTab details={details} canEdit={canEdit} userId={userId} editing={editing} setEditing={setEditing} onSaved={load} />
        )}
        {tab === "private" && (
          <PrivateInfoTab details={details} canEdit={canEdit} canViewBank={canViewBank} userId={userId} editing={editing} setEditing={setEditing} onSaved={load} />
        )}
        {tab === "salary" && canViewSalary && (
          <SalaryTab userId={userId} salary={salary} onSaved={load} />
        )}
        {tab === "security" && isSelf && (
          <SecurityTab viewerRole={viewerRole} userId={userId} />
        )}
      </div>
    </div>
  );
}

function EditBar({ canEdit, editing, setEditing, onSave, saving }: { canEdit: boolean; editing: boolean; setEditing: (v: boolean) => void; onSave: () => void; saving: boolean }) {
  if (!canEdit) return null;
  return (
    <div className="mb-3 flex justify-end gap-2">
      {editing ? (
        <>
          <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
          <button onClick={onSave} disabled={saving} className="btn-sm-primary">{saving ? "Saving..." : "Save"}</button>
        </>
      ) : (
        <button onClick={() => setEditing(true)} className="btn-secondary">Edit</button>
      )}
    </div>
  );
}

function ResumeTab({ details, canEdit, userId, editing, setEditing, onSaved }: { details: Details | null; canEdit: boolean; userId: string; editing: boolean; setEditing: (v: boolean) => void; onSaved: () => void }) {
  const [about, setAbout] = useState(details?.about ?? "");
  const [hobbies, setHobbies] = useState(details?.hobbies ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setAbout(details?.about ?? ""); setHobbies(details?.hobbies ?? ""); }, [details]);

  async function save() {
    setSaving(true);
    await fetch(`/api/employees/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ details: { about, hobbies } }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  return (
    <div>
      <EditBar canEdit={canEdit} editing={editing} setEditing={setEditing} onSave={save} saving={saving} />
      <div>
        <label className="field-label">About</label>
        {editing ? (
          <textarea className="field-input min-h-24" value={about ?? ""} onChange={(e) => setAbout(e.target.value)} />
        ) : (
          <p className="field-value min-h-14 whitespace-pre-wrap">{about || "—"}</p>
        )}
      </div>
      <div className="mt-4">
        <label className="field-label">Interests &amp; Hobbies</label>
        {editing ? (
          <textarea className="field-input min-h-24" value={hobbies ?? ""} onChange={(e) => setHobbies(e.target.value)} />
        ) : (
          <p className="field-value min-h-14 whitespace-pre-wrap">{hobbies || "—"}</p>
        )}
      </div>
    </div>
  );
}

const PRIVATE_FIELDS: [string, string][] = [
  ["dob", "Date of Birth"],
  ["residingAddress", "Residing Address"],
  ["nationality", "Nationality"],
  ["personalEmail", "Personal Email"],
  ["gender", "Gender"],
  ["maritalStatus", "Marital Status"],
];
const BANK_FIELDS: [string, string][] = [
  ["bankAccountNumber", "Account Number"],
  ["bankName", "Bank Name"],
  ["ifscCode", "IFSC Code"],
  ["panNo", "PAN No"],
  ["uanNo", "UAN No"],
];

function PrivateInfoTab({ details, canEdit, canViewBank, userId, editing, setEditing, onSaved }: { details: Details | null; canEdit: boolean; canViewBank: boolean; userId: string; editing: boolean; setEditing: (v: boolean) => void; onSaved: () => void }) {
  const [form, setForm] = useState<Details>(details ?? {});
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(details ?? {}), [details]);

  async function save() {
    setSaving(true);
    await fetch(`/api/employees/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ details: form }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  return (
    <div>
      <EditBar canEdit={canEdit} editing={editing} setEditing={setEditing} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          {PRIVATE_FIELDS.map(([key, label]) => (
            <div key={key} className="mb-3">
              <label className="field-label">{label}</label>
              {editing ? (
                <input className="field-input" value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              ) : (
                <p className="field-value">{form[key] || "—"}</p>
              )}
            </div>
          ))}
        </div>
        {canViewBank ? (
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">Bank Details</p>
            {BANK_FIELDS.map(([key, label]) => (
              <div key={key} className="mb-3">
                <label className="field-label">{label}</label>
                {editing ? (
                  <input className="field-input" value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                ) : (
                  <p className="field-value">{form[key] || "—"}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">Bank Details</p>
            <p className="field-value text-muted">Only visible to admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SalaryTab({ userId, salary, onSaved }: { userId: string; salary: Salary | null; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [wage, setWage] = useState(salary?.monthlyWage ?? 0);
  const [workingDays, setWorkingDays] = useState(salary?.workingDaysPerWeek ?? 5);
  const [breakTime, setBreakTime] = useState(salary?.breakTimeHours ?? 1);
  const [pfEmp, setPfEmp] = useState(salary?.pfEmployeePct ?? 12);
  const [pfEmployer, setPfEmployer] = useState(salary?.pfEmployerPct ?? 12);
  const [tax, setTax] = useState(salary?.professionalTax ?? 200);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWage(salary?.monthlyWage ?? 0);
    setWorkingDays(salary?.workingDaysPerWeek ?? 5);
    setBreakTime(salary?.breakTimeHours ?? 1);
    setPfEmp(salary?.pfEmployeePct ?? 12);
    setPfEmployer(salary?.pfEmployerPct ?? 12);
    setTax(salary?.professionalTax ?? 200);
  }, [salary]);

  async function save() {
    setSaving(true);
    await fetch(`/api/salary/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyWage: wage, workingDaysPerWeek: workingDays, breakTimeHours: breakTime, pfEmployeePct: pfEmp, pfEmployerPct: pfEmployer, professionalTax: tax }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  const b = salary?.breakdown;

  return (
    <div>
      <EditBar canEdit editing={editing} setEditing={setEditing} onSave={save} saving={saving} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="field-label mb-0">Month Wage</label>
            {editing ? <input type="number" className="field-input w-40" value={wage} onChange={(e) => setWage(Number(e.target.value))} /> : <span className="font-mono text-ink">₹{wage.toLocaleString()} / month</span>}
          </div>
          <div className="mb-3 flex items-center justify-between">
            <label className="field-label mb-0">Yearly Wage</label>
            <span className="font-mono text-ink">₹{(wage * 12).toLocaleString()} / year</span>
          </div>

          <p className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-wider text-muted">Salary Components</p>
          {b && (
            <div className="space-y-2 text-sm">
              <Row label="Basic Salary" value={b.basic} note="50% of monthly wage" />
              <Row label="House Rent Allowance" value={b.hra} note="50% of Basic" />
              <Row label="Standard Allowance" value={b.standardAllowance} note="~8.33% of wage" />
              <Row label="Performance Bonus" value={b.performanceBonus} note="8.33% of wage" />
              <Row label="Leave Travel Allowance" value={b.leaveTravelAllowance} note="8.33% of wage" />
              <Row label="Fixed Allowance" value={b.fixedAllowance} note="Remainder of wage" />
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="field-label mb-0">No. of working days / week</label>
            {editing ? <input type="number" className="field-input w-24" value={workingDays} onChange={(e) => setWorkingDays(Number(e.target.value))} /> : <span className="text-ink">{workingDays}</span>}
          </div>
          <div className="mb-4 flex items-center justify-between">
            <label className="field-label mb-0">Break Time (hrs)</label>
            {editing ? <input type="number" className="field-input w-24" value={breakTime} onChange={(e) => setBreakTime(Number(e.target.value))} /> : <span className="text-ink">{breakTime}</span>}
          </div>

          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">Provident Fund (PF) Contribution</p>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">Employee</span>
            {editing ? <input type="number" className="field-input w-20" value={pfEmp} onChange={(e) => setPfEmp(Number(e.target.value))} /> : <span className="text-ink">{pfEmp}%</span>}
            {b && <span className="font-mono text-ink">₹{b.pfEmployee}</span>}
          </div>
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-muted">Employer</span>
            {editing ? <input type="number" className="field-input w-20" value={pfEmployer} onChange={(e) => setPfEmployer(Number(e.target.value))} /> : <span className="text-ink">{pfEmployer}%</span>}
            {b && <span className="font-mono text-ink">₹{b.pfEmployer}</span>}
          </div>

          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">Tax Deductions</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Professional Tax</span>
            {editing ? <input type="number" className="field-input w-20" value={tax} onChange={(e) => setTax(Number(e.target.value))} /> : <span className="font-mono text-ink">₹{tax}/month</span>}
          </div>

          {b && (
            <div className="mt-5 rounded-md border border-primary/30 bg-primary/5 p-3">
              <div className="flex justify-between text-sm font-medium text-ink">
                <span>Net Monthly Pay</span><span className="font-mono">₹{b.netMonthly.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SecurityTab({ viewerRole, userId }: { viewerRole: string; userId: string }) {
  const isAdmin = viewerRole === "admin";

  // Change password (available to every role)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New password and confirmation do not match.");
      return;
    }
    setPwSaving(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPwSaving(false);
    if (error) {
      setPwError(error.message || "Failed to change password.");
      return;
    }
    setPwSuccess("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  // Change email (admin only)
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  async function handleChangeEmail(e: FormEvent) {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailSaving(true);
    const { error } = await authClient.admin.updateUser({
      userId,
      data: { email: trimmed },
    });
    setEmailSaving(false);
    if (error) {
      setEmailError(error.message || "Failed to update email.");
      return;
    }
    setEmailSuccess("Email updated successfully. You may need to sign in again.");
    setNewEmail("");
  }

  return (
    <div className="max-w-md space-y-8">
      {isAdmin && (
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted">Change Email</p>
          <form onSubmit={handleChangeEmail} className="space-y-3">
            <div>
              <label className="field-label">New Email</label>
              <input
                type="email"
                className="field-input"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@company.com"
                required
              />
            </div>
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            {emailSuccess && <p className="text-sm text-emerald-600">{emailSuccess}</p>}
            <button type="submit" disabled={emailSaving} className="btn-sm-primary">
              {emailSaving ? "Updating..." : "Update Email"}
            </button>
          </form>
        </div>
      )}

      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted">Change Password</p>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="field-label">Current Password</label>
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
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="field-label">Confirm New Password</label>
            <input
              type="password"
              className="field-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-emerald-600">{pwSuccess}</p>}
          <button type="submit" disabled={pwSaving} className="btn-sm-primary">
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2">
      <div>
        <p className="text-ink">{label}</p>
        <p className="text-xs text-muted">{note}</p>
      </div>
      <span className="font-mono text-ink">₹{value.toLocaleString()}</span>
    </div>
  );
}