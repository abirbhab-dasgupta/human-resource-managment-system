import Link from "next/link";

export default function LandingCTA() {
  return (
    <section className="landing-cta-band px-4 py-16 text-center sm:py-20">
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#bdf0e5]">
        Get started
      </span>
      <h2 className="mx-auto mt-3.5 max-w-lg font-sans text-[28px] font-semibold tracking-tight text-white sm:text-[34px]">
        Every workday, perfectly aligned.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#dff5f0]">
        Sign in with your company email or employee login ID to get started.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/auth/sign-up" className="landing-btn-lg-on-primary">
          Get Started
        </Link>
        <Link href="/auth/sign-in" className="landing-btn-lg-ghost-on-primary">
          Sign In
        </Link>
      </div>
    </section>
  );
}