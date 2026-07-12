import Link from "next/link";
import AppChrome from "./AppChrome";

const team = [
  { initials: "AS", name: "Aditi Sharma", role: "Frontend Engineer", status: "present" as const },
  { initials: "RK", name: "Rohan Kapoor", role: "HR Associate", status: "leave" as const },
  { initials: "MI", name: "Meera Iyer", role: "Backend Engineer", status: "present" as const },
  { initials: "SV", name: "Sahil Verma", role: "Designer", status: "absent" as const },
];

const statusLabel: Record<string, string> = {
  present: "Present",
  leave: "On Leave",
  absent: "Absent",
};

export default function LandingHero() {
  return (
    <section className="grid-background px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
            Attendance · Leave · Payroll — one dashboard
          </span>
          <h1 className="mt-4 font-sans text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[52px]">
            Every workday,
            <br />
            perfectly aligned.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            WorkForcee is the internal HR system for small teams — log attendance, manage leave
            requests, and see clean salary breakdowns, without a single spreadsheet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/sign-up" className="landing-btn-lg-primary">
              Get Started →
            </Link>
            <Link href="/auth/sign-in" className="landing-btn-lg-ghost">
              Sign in to your account
            </Link>
          </div>
        </div>

        <AppChrome>
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Team — Today
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                {team.length} employees
              </span>
            </div>
            {team.map((member) => (
              <div
                key={member.initials}
                className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0"
              >
                <div className="emp-avatar h-[34px] w-[34px] text-xs">{member.initials}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{member.name}</p>
                  <p className="truncate text-[11px] text-muted">{member.role}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                  <span className={`status-dot status-dot-${member.status}`} />
                  {statusLabel[member.status]}
                </span>
              </div>
            ))}
          </div>
        </AppChrome>
      </div>
    </section>
  );
}