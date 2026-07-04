"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

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
  const [status, setStatus] = useState<"present" | "absent" | "leave">("absent");
  const [checkedIn, setCheckedIn] = useState(false);
  const [since, setSince] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

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
  ];

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="top-nav">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-background">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={companyName} className="h-full w-full object-cover" />
        ) : (
          <Image src="/logo.svg" alt={companyName} width={28} height={28} />
        )}
      </div>
      <span className="mr-4 hidden font-sans text-sm font-semibold text-ink sm:inline">{companyName}</span>

      <nav className="flex items-center gap-1">
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
    </header>
  );
}