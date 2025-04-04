import jwt from "jsonwebtoken";
import { type User, type UserPayload } from "@/constants/user-schemas";

export function createJWT(user: Pick<User, "id" | "name">): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined!");
  }

  return jwt.sign(
    {
      id: user.id,
      name: user.name ?? undefined,
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
    if (!token.startsWith("Bearer ")) {
      return { error: "Invalid token" };
    }

    const jwtToken = token.split(" ")[1];
    if (!jwtToken) {
      return { error: "Token missing" };
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is missing!");
      return { error: "Internal server error" };
    }

    const payload = jwt.verify(jwtToken, secret) as UserPayload;
    return { payload };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return { error: "Invalid token" };
  }
}
