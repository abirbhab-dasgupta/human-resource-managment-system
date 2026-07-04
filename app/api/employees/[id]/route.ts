import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, profileDetails, salaryInfo, company } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { computeSalary } from "@/lib/salary";
import { BANK_DETAIL_FIELDS } from "@/lib/profile-fields";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [emp] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  if (!emp || emp.companyId !== session.user.companyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [details] = await db.select().from(profileDetails).where(eq(profileDetails.userId, id)).limit(1);
  const [compRow] = emp.companyId
    ? await db.select().from(company).where(eq(company.id, emp.companyId)).limit(1)
    : [null];

  const isAdmin = session.user.role === "admin" || session.user.role === "hr";
  const isSelf = session.user.id === id;
  // Bank/financial fields are more sensitive than the rest of the profile:
  // only a true admin (not hr) or the employee themself may view them.
  const canViewBank = session.user.role === "admin" || isSelf;

  let salary = null;
  if (isAdmin) {
    const [salRow] = await db.select().from(salaryInfo).where(eq(salaryInfo.userId, id)).limit(1);
    const wage = salRow?.monthlyWage ?? 0;
    salary = {
      wageType: salRow?.wageType ?? "fixed",
      monthlyWage: wage,
      workingDaysPerWeek: salRow?.workingDaysPerWeek ?? 5,
      breakTimeHours: salRow?.breakTimeHours ?? 1,
      pfEmployeePct: salRow?.pfEmployeePct ?? 12,
      pfEmployerPct: salRow?.pfEmployerPct ?? 12,
      professionalTax: salRow?.professionalTax ?? 200,
      breakdown: computeSalary(wage, salRow?.pfEmployeePct ?? 12, salRow?.pfEmployerPct ?? 12, salRow?.professionalTax ?? 200),
    };
  }

  let safeDetails = details ?? null;
  if (safeDetails && !canViewBank) {
    safeDetails = { ...safeDetails };
    for (const field of BANK_DETAIL_FIELDS) {
      delete (safeDetails as Record<string, unknown>)[field];
    }
  }

  return NextResponse.json({
    employee: {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      image: emp.image,
      role: emp.role,
      employeeCode: emp.employeeCode,
      phone: emp.phone,
      companyName: compRow?.name ?? null,
    },
    details: safeDetails,
    salary,
    canEdit: isAdmin || isSelf,
    canViewSalary: isAdmin,
    canViewBank,
    isSelf,
    viewerRole: session.user.role,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "admin" || session.user.role === "hr";
  const isSelf = session.user.id === id;
  if (!isAdmin && !isSelf) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const canViewBank = session.user.role === "admin" || isSelf;

  const body = await req.json();
  const { details, phone, image } = body;

  if (phone !== undefined || image !== undefined) {
    await db
      .update(user)
      .set({ ...(phone !== undefined ? { phone } : {}), ...(image !== undefined ? { image } : {}) })
      .where(eq(user.id, id));
  }

  if (details) {
    // Never let someone write bank fields for another employee unless
    // they're an admin (or it's their own profile).
    const safeDetails = { ...details };
    if (!canViewBank) {
      for (const field of BANK_DETAIL_FIELDS) {
        delete (safeDetails as Record<string, unknown>)[field];
      }
    }

    const [existing] = await db.select().from(profileDetails).where(eq(profileDetails.userId, id)).limit(1);
    if (existing) {
      await db.update(profileDetails).set(safeDetails).where(eq(profileDetails.userId, id));
    } else {
      await db.insert(profileDetails).values({ userId: id, ...safeDetails });
    }
  }

  return NextResponse.json({ ok: true });
}