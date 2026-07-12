import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingIntro from "@/components/landing/LandingIntro";
import LandingAttendanceSection from "@/components/landing/LandingAttendanceSection";
import LandingPayrollSection from "@/components/landing/LandingPayrollSection";
import LandingLeaveSection from "@/components/landing/LandingLeaveSection";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    const isAdmin = session.user.role === "admin" || session.user.role === "hr";
    redirect(isAdmin ? "/dashboard/admin" : "/dashboard/employee");
  }

  return (
    <main>
      <LandingHeader />
      <LandingHero />
      <LandingIntro />
      <LandingAttendanceSection />
      <LandingPayrollSection />
      <LandingLeaveSection />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}