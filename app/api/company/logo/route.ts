import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { company, user } from "@/lib/db/schema";
import { deriveCompanyCode } from "@/lib/employee-id";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companyName, logoUrl } = await req.json();

  if (logoUrl && (typeof logoUrl !== "string" || logoUrl.length > 400_000)) {
    return NextResponse.json({ error: "Logo is too large. Please use an image under ~250KB." }, { status: 413 });
  }

  const code = deriveCompanyCode(companyName);
  const companyId = randomUUID();

  await db.insert(company).values({ id: companyId, name: companyName, code, logoUrl: logoUrl || null });
  await db.update(user)
    .set({ role: "admin", companyId })
    .where(eq(user.id, session.user.id));

  return NextResponse.json({ ok: true, companyId, code });
}