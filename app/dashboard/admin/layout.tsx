import { redirect } from "next/navigation";
import Image from "next/image";
import { getSessionAndCompany } from "@/lib/get-session-company";

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
      <header className="flex items-center gap-3 border-b border-border bg-surface px-6 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-background">
          {company?.logoUrl ? (
            <img src={company.logoUrl} alt={`${company.name} logo`} className="h-full w-full object-cover" />
          ) : (
            <Image src="/logo.svg" alt="WorkForce" width={28} height={28} />
          )}
        </div>
        <div>
          <p className="font-sans text-sm font-semibold text-ink">{company?.name ?? "WorkForce"}</p>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Admin</p>
        </div>
      </header>
      <main className="px-6 py-6">{children}</main>
    </div>
  );
}