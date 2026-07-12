import Image from "next/image";
import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t border-border px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="WorkForcee" width={26} height={26} />
          <span className="font-sans text-sm font-semibold tracking-tight text-ink">
            WorkForcee
          </span>
        </div>

        <div className="flex gap-5">
          <Link href="/auth/sign-in" className="text-[13px] text-muted transition-colors hover:text-ink">
            Sign In
          </Link>
          <Link href="/auth/sign-up" className="text-[13px] text-muted transition-colors hover:text-ink">
            Sign Up
          </Link>
        </div>

        <p className="text-xs text-muted">
          © 2026{" "}
          <a
            href="https://abirbhabdasgupta.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Abirbhab Dasgupta
          </a>
        </p>
      </div>
    </footer>
  );
}