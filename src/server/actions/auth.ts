"use server";
import { cookies } from "next/headers";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "@/server/db";
import {
  signinSchema,
  signupSchema,
  type SignupData,
  type SigninData,
} from "@/constants/user-schemas";
import { createJWT } from "@/modules/auth-tools";

export async function signup(data: SignupData) {
  try {
    const validatedData = signupSchema.parse(data);
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return { success: false, message: "User with this email already exists" };
    }
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: validatedData.name ?? "",
          email: validatedData.email,
          password: hashedPassword,
        },
      });
      await tx.category.createMany({
        data: [
          {
            name: "Food",
            type: "EXPENSE",
            order: 1,
            color: "#FF5733",
            userId: newUser.id,
          },
          {
            name: "Salary",
            type: "INCOME",
            order: 1,
            color: "#33FF57",
            userId: newUser.id,
          },
        ],
      });
      return newUser;
    });

    const token = await createJWT({
      id: user.id,
      name: user.name ?? undefined,
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return { success: true, message: "User registered successfully", user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid input", errors: error.errors };
    }
    console.error("Signup error:", error);
    return { success: false, message: "An error occurred during signup." };
  }
}

export async function signin(data: SigninData) {
  try {
    const validatedData = signinSchema.parse(data);
    const user = await db.user.findUnique({
      where: { email: validatedData.email },
    });
    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }
    if (!(await bcrypt.compare(validatedData.password, user.password))) {
      return { success: false, message: "Invalid password or password" };
    }

    const token = await createJWT({
      id: user.id,
      name: user.name ?? undefined,
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return { success: true, message: "Logged in successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid input", errors: error.errors };
    }
    console.error("Signin error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function signout() {
  try {
    (await cookies()).set("token", "", { expires: new Date(0), path: "/" });
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Signout error:", error);
    return { success: false, message: "Internal server error" };
  }
}
