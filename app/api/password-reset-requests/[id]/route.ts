import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, passwordResetRequest } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { generateTempPassword } from "@/lib/employee-id";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin" && session.user.role !== "hr") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [reqRow] = await db.select().from(passwordResetRequest).where(eq(passwordResetRequest.id, id)).limit(1);
    if (!reqRow || reqRow.companyId !== session.user.companyId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const tempPassword = generateTempPassword();

    await auth.api.setUserPassword({
        body: { userId: reqRow.userId, newPassword: tempPassword },
        headers: hdrs,
    });

    await db.update(user).set({ mustResetPassword: true }).where(eq(user.id, reqRow.userId));
    await db
        .update(passwordResetRequest)
        .set({ status: "resolved", resolvedAt: new Date() })
        .where(eq(passwordResetRequest.id, id));

    return NextResponse.json({ ok: true, tempPassword });
}