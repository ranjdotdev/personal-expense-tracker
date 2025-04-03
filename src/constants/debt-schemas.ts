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
    .max(255),
  isOwed: z.boolean().default(true), // True if you owe, false if owed to you
  date: z.date().default(() => new Date()),
  userId: z.string().uuid(),
});
