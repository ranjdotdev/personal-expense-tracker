// middleware.ts
import type { NextRequest } from "next/server";
import { authMiddleware } from "@/server/middlewares/auth-mw";
import { normalizePathMiddleware } from "@/server/middlewares/normalize-path-mw";

export async function middleware(r: NextRequest) {
  const normalizationResponse = normalizePathMiddleware(r);
  if (normalizationResponse) {
    return normalizationResponse;
  }

  return await authMiddleware(r);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
