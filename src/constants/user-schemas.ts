import { z } from "zod";

export interface User {
  id: string;
  name?: string;
  email: string;
  password: string;
}

export type UserPayload = {
  id: string;
  name: string;
};

export type SignupData = z.infer<typeof signupSchema>;
export type SigninData = z.infer<typeof signinSchema>;
export type updateUserData = z.infer<typeof updateUserSchema>;

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be 50 characters or less" })
    .trim()
    .optional(),
  email: z
    .string()
    .email({ message: "A valid email is required" })
    .trim()
    .max(255, { message: "Email must be 255 characters or less" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password must be 100 characters or less" }),
});

export const signinSchema = z.object({
  email: z
    .string()
    .email({ message: "A valid email is required" })
    .trim()
    .max(255, { message: "Email must be 255 characters or less" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password must be 100 characters or less" }),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be 50 characters or less" })
    .trim()
    .optional(),
  email: z
    .string()
    .email({ message: "A valid email is required" })
    .max(255, { message: "Email must be 255 characters or less" })
    .trim()
    .optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password must be 100 characters or less" })
    .optional(),
});
