import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { company } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSessionAndCompany() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { session: null, company: null };

  const companyId = session.user.companyId as string | null;
  if (!companyId) return { session, company: null };

  const [row] = await db.select().from(company).where(eq(company.id, companyId)).limit(1);
  return { session, company: row ?? null };
}