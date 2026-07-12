import Link from "next/link";

export default function LandingIntro() {
  return (
    <section className="px-4 py-16 text-center sm:py-24">
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
        The dashboard
      </span>
      <h2 className="mx-auto mt-3.5 max-w-xl font-sans text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        One login. Everything HR needs.
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
        Admins and HR get the full picture across the company. Employees get exactly their own
        record — nothing more, nothing hidden.
      </p>

      <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-4">
        <div className="landing-module-card">
          <p className="font-mono text-[10px] uppercase tracking-wider text-primary">Attendance</p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <div className="emp-avatar h-7 w-7 text-[10px]">AS</div>
            <p className="flex-1 truncate text-left text-[12px] text-ink">Aditi Sharma</p>
            <span className="status-dot status-dot-present" />
          </div>
        </div>

        <div className="landing-module-card">
          <p className="font-mono text-[10px] uppercase tracking-wider text-amber">Leave</p>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <p className="truncate text-left text-[12px] text-ink">Rohan Kapoor</p>
            <span className="pill pill-pending">Pending</span>
          </div>
        </div>

        <div className="landing-module-card">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink">Payroll</p>
          <div className="mt-2.5 text-left">
            <p className="text-[11px] text-muted">Net Monthly</p>
            <p className="text-lg font-semibold text-primary">₹60,900.00</p>
          </div>
        </div>
      </div>

      <Link href="/auth/sign-up" className="landing-btn-lg-primary mt-10 inline-flex">
        Get Started
      </Link>
    </section>
  );
}