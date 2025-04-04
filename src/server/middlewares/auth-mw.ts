import { type NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/modules/auth-tools";
import { publicRoutes } from "@/constants/vars";

export function authMiddleware(r: NextRequest) {
  const path = r.nextUrl.pathname;

  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  const token = r.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/signin", r.url));
  }

  const { payload, error } = getUserFromToken(token);

  if (error) {
    console.error("Token verification failed:", error);
    return NextResponse.redirect(new URL("/signin", r.url));
  }

  const requestHeaders = new Headers(r.headers);
  requestHeaders.set("user-id", payload!.id);
  requestHeaders.set("user-name", payload?.name ?? "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
