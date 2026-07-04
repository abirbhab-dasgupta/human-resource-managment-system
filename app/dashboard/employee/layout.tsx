import { redirect } from "next/navigation";
import { getSessionAndCompany } from "@/lib/get-session-company";
import TopNav from "@/components/dashboard/TopNav";

export default async function EmployeeDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { session, company } = await getSessionAndCompany();

  if (!session) redirect("/auth/sign-in");

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        base="employee"
        companyName={company?.name ?? "WorkForce"}
        logoUrl={company?.logoUrl ?? null}
        userName={session.user.name}
        userImage={session.user.image ?? null}
      />
      <main className="px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
