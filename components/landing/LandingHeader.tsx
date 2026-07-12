import Image from "next/image";
import Link from "next/link";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="WorkForcee" width={32} height={32} />
          <span className="font-sans text-[15px] font-semibold tracking-tight text-ink">
            WorkForcee
          </span>
        </div>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="#attendance" className="text-[13px] text-muted transition-colors hover:text-ink">
            Attendance
          </Link>
          <Link href="#payroll" className="text-[13px] text-muted transition-colors hover:text-ink">
            Payroll
          </Link>
          <Link href="#leave" className="text-[13px] text-muted transition-colors hover:text-ink">
            Leave
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/auth/sign-in"
            className="font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:text-ink sm:text-[12px]"
          >
            Sign In
          </Link>
          <Link href="/auth/sign-up" className="btn-sm-primary">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}