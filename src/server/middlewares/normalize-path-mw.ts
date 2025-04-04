import { publicRoutes } from "@/constants/vars";
import { type NextRequest, NextResponse } from "next/server";

export function normalizePathMiddleware(r: NextRequest) {
  const path = r.nextUrl.pathname;

  for (const route of publicRoutes) {
    if (route !== "/" && path.startsWith(route + "/")) {
      return NextResponse.redirect(new URL(route, r.url));
    }
  }

  return null;
}
