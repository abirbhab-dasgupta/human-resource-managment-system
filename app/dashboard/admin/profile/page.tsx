import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import EmployeeProfile from "@/components/dashboard/EmployeeProfile";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");
  return <EmployeeProfile userId={session.user.id} />;
}