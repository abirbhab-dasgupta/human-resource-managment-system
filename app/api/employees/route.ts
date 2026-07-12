import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, attendance, leaveRequest, company, profileDetails } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { generateEmployeeCode, generateTempPassword } from "@/lib/employee-id";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companyId = session.user.companyId as string | null;
  if (!companyId) return NextResponse.json({ employees: [] });

  const employees = await db.select().from(user).where(eq(user.companyId, companyId));
  const today = todayStr();

  const result = await Promise.all(
    employees.map(async (emp) => {
      const [att] = await db
        .select()
        .from(attendance)
        .where(and(eq(attendance.userId, emp.id), eq(attendance.date, today)))
        .limit(1);

      const [onLeave] = await db
        .select()
        .from(leaveRequest)
        .where(and(eq(leaveRequest.userId, emp.id), eq(leaveRequest.status, "approved")))
        .limit(1);

      let status: "present" | "leave" | "absent" | "inactive" = "absent";
      if (emp.banned) status = "inactive";
      else if (onLeave && onLeave.startDate <= today && onLeave.endDate >= today) status = "leave";
      else if (att?.checkIn) status = "present";

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        image: emp.image,
        role: emp.role,
        employeeCode: emp.employeeCode,
        status,
        active: !emp.banned,
        checkedIn: !!att?.checkIn && !att?.checkOut,
      };
    })
  );

  return NextResponse.json({ employees: result });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "hr") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const companyId = session.user.companyId as string | null;
  if (!companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

  const { name, email, jobPosition, department } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const [companyRow] = await db.select().from(company).where(eq(company.id, companyId)).limit(1);
  const companyCode = companyRow?.code || "EMP";

  const joinYear = new Date().getFullYear();
  const serial = (await db.select().from(user).where(eq(user.companyId, companyId))).length + 1;
  const code = generateEmployeeCode(companyCode, name, joinYear, serial);
  const tempPassword = generateTempPassword();

  const signUpResult = await auth.api.signUpEmail({
    body: { name, email, password: tempPassword },
  });

  if (!signUpResult?.user) {
    return NextResponse.json({ error: "Could not create user" }, { status: 500 });
  }

  await db
    .update(user)
    .set({ role: "employee", companyId, employeeCode: code, joinYear, mustResetPassword: true })
    .where(eq(user.id, signUpResult.user.id));

  await db.insert(profileDetails).values({ userId: signUpResult.user.id, jobPosition, department });

  return NextResponse.json({ ok: true, employeeCode: code, tempPassword, userId: signUpResult.user.id });
}