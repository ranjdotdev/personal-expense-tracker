import { jwtVerify, SignJWT } from "jose";
import { type UserPayload } from "@/constants/user-schemas";
import { headers } from "next/headers";
import { env } from "@/env";

export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function getUserId(): Promise<string> {
  const h = await headers();
  const userId = h.get("user-id");
  if (!userId) {
    throw new AuthenticationError();
  }
  return userId;
}

export async function getUserName(): Promise<string> {
  const h = await headers();
  const userName = h.get("user-name");
  return userName ?? "";
}

export async function getUser(): Promise<UserPayload | undefined> {
  try {
    const userId = await getUserId();
    const userName = await getUserName();

    return {
      id: userId,
      name: userName,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return undefined;
    }
    throw error;
  }
}
export async function createJWT(user: {
  id: string;
  name?: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET);

  return await new SignJWT({
    id: user.id,
    name: user.name ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getUserFromToken(token: string): Promise<{
  payload?: UserPayload;
  error?: string;
}> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return { payload: payload as unknown as UserPayload };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return { error: "Invalid token" };
  }
}
