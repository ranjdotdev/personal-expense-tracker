import jwt from "jsonwebtoken";
import { type UserPayload } from "@/constants/user-schemas";
import { headers } from "next/headers";

export async function getUserId(): Promise<string> {
  const h = await headers();
  return h.get("user-id")!;
}

export function createJWT(user: { id: string; name?: string }): string {
  const secret = process.env.JWT_SECRET!;

  return jwt.sign(
    {
      id: user.id,
      name: user.name ?? "",
    },
    secret,
    { expiresIn: "7d" },
  );
}

export function getUserFromToken(token: string): {
  payload?: UserPayload;
  error?: string;
} {
  try {
    const secret = process.env.JWT_SECRET!;

    const payload = jwt.verify(token, secret) as UserPayload;
    return { payload };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return { error: "Invalid token" };
  }
}
