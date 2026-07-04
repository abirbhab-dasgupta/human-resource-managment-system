import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leaveRequest, user } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "admin" || session.user.role === "hr";

  if (isAdmin) {
    const companyId = session.user.companyId as string;
    const rows = await db
      .select({
        id: leaveRequest.id,
        userId: leaveRequest.userId,
        type: leaveRequest.type,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason,
        status: leaveRequest.status,
        createdAt: leaveRequest.createdAt,
        name: user.name,
      })
      .from(leaveRequest)
      .innerJoin(user, eq(user.id, leaveRequest.userId))
      .where(eq(leaveRequest.companyId, companyId))
      .orderBy(desc(leaveRequest.createdAt));
    return NextResponse.json({ requests: rows });
  }

  const rows = await db
    .select()
    .from(leaveRequest)
    .where(eq(leaveRequest.userId, session.user.id))
    .orderBy(desc(leaveRequest.createdAt));
  return NextResponse.json({ requests: rows });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companyId = session.user.companyId as string | null;
  if (!companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

  const { type, startDate, endDate, reason } = await req.json();
  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Start and end date required" }, { status: 400 });
  }

  const [row] = await db
    .insert(leaveRequest)
    .values({
      id: randomUUID(),
      userId: session.user.id,
      companyId,
      type: type || "Leave",
      startDate,
      endDate,
      reason,
      status: "pending",
    })
    .returning();

  return NextResponse.json({ ok: true, request: row });
}