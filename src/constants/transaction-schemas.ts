import { z } from "zod";
import { TransactionType } from "@prisma/client";

export type TransactionData = z.infer<typeof createTransactionSchema>;

export const createTransactionSchema = z.object({
  amount: z.number().positive({
    message: "Amount must be positive. Please enter a valid amount.",
  }),
  description: z
    .string()
    .min(1, {
      message: "Description is required. Please provide a brief description.",
    })
    .max(255),
  type: z.nativeEnum(TransactionType, {
    message: "Transaction type is required. Choose either INCOME or EXPENSE.",
  }),
  categoryId: z.string().uuid().optional(),
  date: z.date().default(() => new Date()),
  userId: z.string().uuid(),
});

export const updateTransactionSchema = z.object({
  amount: z
    .number()
    .positive({
      message: "Amount must be positive. Please enter a valid amount.",
    })
    .optional(),
  description: z
    .string()
    .min(1, {
      message: "Description is required. Please provide a brief description.",
    })
    .max(255)
    .optional(),
  type: z.nativeEnum(TransactionType).optional(),
  categoryId: z.string().uuid().optional(),
  date: z.date().optional(),
});
