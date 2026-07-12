"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

const MAX_LOGO_BYTES = 250 * 1024;

type Props = {
  base: "admin" | "employee";
  companyName: string;
  logoUrl: string | null;
  userName: string;
  userImage: string | null;
};

export default function TopNav({ base, companyName, logoUrl, userName, userImage }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [status, setStatus] = useState<"present" | "absent" | "leave">("absent");
  const [checkedIn, setCheckedIn] = useState(false);
  const [since, setSince] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/attendance")
      .then((r) => r.json())
      .then((d) => {
        if (d?.today?.checkIn && !d?.today?.checkOut) {
          setCheckedIn(true);
          setStatus("present");
          setSince(new Date(d.today.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        } else if (d?.today?.checkOut) {
          setCheckedIn(false);
          setStatus("present");
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target as Node)) setMobileNavOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  async function toggleAttendance() {
    setBusy(true);
    try {
      const action = checkedIn ? "check-out" : "check-in";
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        if (action === "check-in") {
          setCheckedIn(true);
          setStatus("present");
          setSince(new Date(data.record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        } else {
          setCheckedIn(false);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  const links = [
    { href: `/dashboard/${base}`, label: "Employees" },
    { href: `/dashboard/${base}/attendance`, label: "Attendance" },
    { href: `/dashboard/${base}/leave`, label: "Time Off" },
    ...(base === "admin" ? [{ href: `/dashboard/admin/requests`, label: "Requests" }] : []),
  ];

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="top-nav">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-background ${base === "admin" ? "cursor-pointer hover:border-primary" : ""}`}
        onClick={() => base === "admin" && setShowLogoModal(true)}
        title={base === "admin" ? "Update company logo" : undefined}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={companyName} className="h-full w-full object-cover" />
        ) : (
          <Image src="/logo.svg" alt={companyName} width={28} height={28} />
        )}
      </div>
      <span className="mr-4 hidden font-sans text-sm font-semibold text-ink sm:inline">{companyName}</span>

      <nav className="hidden items-center gap-1 sm:flex">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "top-nav-link-active" : "top-nav-link"}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="relative sm:hidden" ref={mobileNavRef}>
        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileNavOpen}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-ink"
        >
          <span className="flex flex-col items-center justify-center gap-[3px]">
            <span className={`h-[1.5px] w-4 bg-current transition-transform ${mobileNavOpen ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`h-[1.5px] w-4 bg-current transition-opacity ${mobileNavOpen ? "opacity-0" : ""}`} />
            <span className={`h-[1.5px] w-4 bg-current transition-transform ${mobileNavOpen ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
        </button>

        {mobileNavOpen && (
          <div className="absolute left-0 top-11 z-30 w-48 overflow-hidden rounded-md border border-border bg-surface shadow-lg">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider ${pathname === l.href ? "bg-primary/10 text-primary" : "text-ink hover:bg-background"
                  }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button onClick={toggleAttendance} disabled={busy} className="btn-secondary">
          <span className="hidden sm:inline">{checkedIn ? `Since ${since ?? ""} · Check Out` : "Check In"}</span>
          <span className="sm:hidden">{checkedIn ? "Check Out" : "Check In"}</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background font-mono text-xs font-semibold text-ink"
          >
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt={userName} className="h-full w-full rounded-full object-cover" />
            ) : (
              initials
            )}
            <span
              className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface status-dot-${status}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-md border border-border bg-surface shadow-lg">
              <Link
                href={`/dashboard/${base}/profile`}
                className="block px-4 py-2.5 text-sm text-ink hover:bg-background"
                onClick={() => setMenuOpen(false)}
              >
                My Profile
              </Link>
              {base === "admin" && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowLogoModal(true);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-background"
                >
                  Update Logo
                </button>
              )}
              <button
                onClick={async () => {
                  await signOut();
                  router.push("/auth/sign-in");
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-background"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {showLogoModal && <UpdateLogoModal currentLogo={logoUrl} onClose={() => setShowLogoModal(false)} />}
    </header>
  );
}

function UpdateLogoModal({ currentLogo, onClose }: { currentLogo: string | null; onClose: () => void }) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(currentLogo);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (file.size > MAX_LOGO_BYTES) {
      setError(`Image must be under ${Math.round(MAX_LOGO_BYTES / 1024)}KB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function save() {
    if (!preview) {
      setError("Choose an image first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/company/logo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update logo");
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 font-sans text-lg font-semibold text-ink">Update Company Logo</h2>
        {error && <div className="form-error mb-3">{error}</div>}
        <div className="mb-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Logo preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-muted">No logo</span>
            )}
          </div>
        </div>
        <input type="file" accept="image/*" onChange={onFile} className="field-input" />
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="button" onClick={save} disabled={busy} className="btn-sm-primary flex-1">{busy ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}