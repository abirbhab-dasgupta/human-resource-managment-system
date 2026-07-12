import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leaveRequest, user, profileDetails } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { computeLeaveBalance } from "@/lib/leave-balance";

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

    const balanceByUser = new Map<string, { entitlement: number; used: number; remaining: number }>();
    for (const userId of new Set(rows.map((r) => r.userId))) {
      const [entRow] = await db.select().from(profileDetails).where(eq(profileDetails.userId, userId)).limit(1);
      const approved = await db
        .select({ startDate: leaveRequest.startDate, endDate: leaveRequest.endDate })
        .from(leaveRequest)
        .where(and(eq(leaveRequest.userId, userId), eq(leaveRequest.status, "approved")));
      balanceByUser.set(userId, computeLeaveBalance(entRow?.leaveEntitlement ?? 18, approved));
    }

    const withBalance = rows.map((r) => ({ ...r, balance: balanceByUser.get(r.userId) }));
    return NextResponse.json({ requests: withBalance });
  }

  const rows = await db
    .select()
    .from(leaveRequest)
    .where(eq(leaveRequest.userId, session.user.id))
    .orderBy(desc(leaveRequest.createdAt));

  const [entRow] = await db.select().from(profileDetails).where(eq(profileDetails.userId, session.user.id)).limit(1);
  const approved = rows.filter((r) => r.status === "approved");
  const balance = computeLeaveBalance(entRow?.leaveEntitlement ?? 18, approved);

  return NextResponse.json({ requests: rows, balance });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "admin" || session.user.role === "hr") {
    return NextResponse.json({ error: "Admins are not eligible to apply for leave" }, { status: 403 });
  }
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