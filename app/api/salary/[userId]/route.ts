import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { salaryInfo, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { computeSalary } from "@/lib/salary";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.user.role !== "admin" && session.user.role !== "hr") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { error, session } = await requireAdmin();
  if (error) return error;

  const [emp] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  if (!emp || emp.companyId !== session!.user.companyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const values = {
    monthlyWage: Number(body.monthlyWage) || 0,
    workingDaysPerWeek: Number(body.workingDaysPerWeek) || 5,
    breakTimeHours: Number(body.breakTimeHours) || 1,
    pfEmployeePct: Number(body.pfEmployeePct) || 12,
    pfEmployerPct: Number(body.pfEmployerPct) || 12,
    professionalTax: Number(body.professionalTax) || 200,
  };

  const [existing] = await db.select().from(salaryInfo).where(eq(salaryInfo.userId, userId)).limit(1);
  if (existing) {
    await db.update(salaryInfo).set(values).where(eq(salaryInfo.userId, userId));
  } else {
    await db.insert(salaryInfo).values({ userId, ...values });
  }

  const breakdown = computeSalary(values.monthlyWage, values.pfEmployeePct, values.pfEmployerPct, values.professionalTax);
  return NextResponse.json({ ok: true, breakdown });
}