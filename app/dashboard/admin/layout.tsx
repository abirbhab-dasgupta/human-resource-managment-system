import { redirect } from "next/navigation";
import { getSessionAndCompany } from "@/lib/get-session-company";
import TopNav from "@/components/dashboard/TopNav";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { session, company } = await getSessionAndCompany();

  if (!session) redirect("/auth/sign-in");
  if (session.user.role !== "admin" && session.user.role !== "hr") {
    redirect("/dashboard/employee");
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        base="admin"
        companyName={company?.name ?? "WorkForce"}
        logoUrl={company?.logoUrl ?? null}
        userName={session.user.name}
        userImage={session.user.image ?? null}
      />
      <main className="px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}