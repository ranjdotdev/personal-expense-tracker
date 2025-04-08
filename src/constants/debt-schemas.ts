import { z } from "zod";

export type DebtData = z.infer<typeof createDebtSchema>;

export const createDebtSchema = z.object({
  amount: z.number().positive({
    message: "Amount must be positive. Please enter a valid amount.",
  }),
  description: z
    .string()
    .min(1, {
      message: "Description is required. Please add a brief description.",
    })
    .max(255)
    .trim(),
  isOwed: z.boolean().default(true), // True if you owe, false if owed to you
  date: z.date().default(() => new Date()),
  userId: z.string().uuid(),
});

export const updateDebtSchema = z.object({
  amount: z
    .number()
    .positive({
      message: "Amount must be positive. Please enter a valid amount.",
    })
    .optional(),
  description: z
    .string()
    .min(1, {
      message: "Description is required. Please add a brief description.",
    })
    .max(255)
    .trim()
    .optional(),
  isOwed: z.boolean().optional(),
  date: z.date().optional(),
});
