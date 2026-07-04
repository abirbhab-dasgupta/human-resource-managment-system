import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendance, user } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestedUserId = req.nextUrl.searchParams.get("userId");
  const isAdmin = session.user.role === "admin" || session.user.role === "hr";
  const userId = requestedUserId && isAdmin ? requestedUserId : session.user.id;

  const [todayRow] = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.userId, userId), eq(attendance.date, todayStr())))
    .limit(1);

  if (isAdmin && !requestedUserId) {
    const companyId = session.user.companyId as string;
    const rows = await db
      .select({ id: attendance.id, userId: attendance.userId, date: attendance.date, checkIn: attendance.checkIn, checkOut: attendance.checkOut, status: attendance.status, name: user.name })
      .from(attendance)
      .innerJoin(user, eq(user.id, attendance.userId))
      .where(eq(attendance.companyId, companyId))
      .orderBy(desc(attendance.date))
      .limit(200);
    return NextResponse.json({ records: rows, today: todayRow ?? null });
  }

  const records = await db
    .select()
    .from(attendance)
    .where(eq(attendance.userId, userId))
    .orderBy(desc(attendance.date))
    .limit(60);

  return NextResponse.json({ records, today: todayRow ?? null });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companyId = session.user.companyId as string | null;
  if (!companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

  const { action } = await req.json();
  const date = todayStr();
  const userId = session.user.id;

  const [existing] = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.userId, userId), eq(attendance.date, date)))
    .limit(1);

  if (action === "check-in") {
    if (existing) return NextResponse.json({ error: "Already checked in" }, { status: 400 });
    const [row] = await db
      .insert(attendance)
      .values({ id: randomUUID(), userId, companyId, date, checkIn: new Date(), status: "present" })
      .returning();
    return NextResponse.json({ ok: true, record: row });
  }

  if (action === "check-out") {
    if (!existing) return NextResponse.json({ error: "Not checked in" }, { status: 400 });
    const [row] = await db
      .update(attendance)
      .set({ checkOut: new Date() })
      .where(eq(attendance.id, existing.id))
      .returning();
    return NextResponse.json({ ok: true, record: row });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}