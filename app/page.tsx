import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const isAdmin = session.user.role === "admin" || session.user.role === "hr";
  redirect(isAdmin ? "/dashboard/admin" : "/dashboard/employee");
}