import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, passwordResetRequest } from "@/lib/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    const { identifier } = await req.json();
    const generic = NextResponse.json({
        ok: true,
        message: "If that account exists, your admin has been notified.",
    });

    if (!identifier || typeof identifier !== "string") return generic;
    const value = identifier.trim();
    if (!value) return generic;

    const [match] = await db
        .select()
        .from(user)
        .where(or(eq(user.email, value), eq(user.employeeCode, value)))
        .limit(1);

    if (!match || !match.companyId) return generic;

    const [existingPending] = await db
        .select()
        .from(passwordResetRequest)
        .where(and(eq(passwordResetRequest.userId, match.id), eq(passwordResetRequest.status, "pending")))
        .limit(1);

    if (!existingPending) {
        await db.insert(passwordResetRequest).values({
            id: randomUUID(),
            userId: match.id,
            companyId: match.companyId,
            status: "pending",
        });
    }

    return generic;
}


export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin" && session.user.role !== "hr") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const companyId = session.user.companyId as string;

    const rows = await db
        .select({
            id: passwordResetRequest.id,
            userId: passwordResetRequest.userId,
            status: passwordResetRequest.status,
            createdAt: passwordResetRequest.createdAt,
            name: user.name,
            email: user.email,
            employeeCode: user.employeeCode,
        })
        .from(passwordResetRequest)
        .innerJoin(user, eq(user.id, passwordResetRequest.userId))
        .where(and(eq(passwordResetRequest.companyId, companyId), eq(passwordResetRequest.status, "pending")))
        .orderBy(desc(passwordResetRequest.createdAt));

    return NextResponse.json({ requests: rows });
}