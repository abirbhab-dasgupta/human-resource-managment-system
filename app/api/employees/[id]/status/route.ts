import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin" && session.user.role !== "hr") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (session.user.id === id) {
        return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
    }

    const [emp] = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (!emp || emp.companyId !== session.user.companyId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { action } = await req.json();

    if (action === "deactivate") {
        await auth.api.banUser({
            body: { userId: id, banReason: "Offboarded by admin" },
            headers: hdrs,
        });
        return NextResponse.json({ ok: true, active: false });
    }

    if (action === "reactivate") {
        await auth.api.unbanUser({ body: { userId: id }, headers: hdrs });
        return NextResponse.json({ ok: true, active: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}