import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const path = req.nextUrl.pathname;

  if (path === "/") {
    if (!session) return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    const isAdmin = session.user.role === "admin" || session.user.role === "hr";
    return NextResponse.redirect(
      new URL(isAdmin ? "/dashboard/admin" : "/dashboard/employee", req.url)
    );
  }

  if (!session) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  const isAdmin = session.user.role === "admin" || session.user.role === "hr";

  if (path.startsWith("/dashboard/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard/employee", req.url));
  }
  if (path.startsWith("/dashboard/employee") && isAdmin) {
    return NextResponse.redirect(new URL("/dashboard/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};