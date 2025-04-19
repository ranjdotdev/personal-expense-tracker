import type { UserPayload } from "@/constants/user-schemas";
import { publicRoutes } from "@/constants/vars";
import { getUserFromToken } from "@/modules/auth-tools";
import { NextResponse, type NextRequest } from "next/server";

export async function authMiddleware(r: NextRequest) {
  const path = r.nextUrl.pathname;
  const token = r.cookies.get("token")?.value;

  let user: UserPayload | undefined = undefined;

  if (token) {
    const { payload, error } = await getUserFromToken(token);
    if (!error && payload) {
      user = payload;
    }
  }

  const requestHeaders = new Headers(r.headers);
  if (user) {
    requestHeaders.set("user-id", user.id);
    requestHeaders.set("user-name", user.name || "");
  }

  if (publicRoutes.includes(path)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (!token || !user) {
    return NextResponse.redirect(new URL("/signin", r.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
