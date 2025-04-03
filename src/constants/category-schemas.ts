import { z } from "zod";
import { TransactionType } from "@prisma/client";

export type CategoryData = z.infer<typeof createCategorySchema>;

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required. Please enter a category name." })
    .max(50),
  type: z.nativeEnum(TransactionType, {
    message: "Category type is required. Choose either INCOME or EXPENSE.",
  }),
  order: z
    .number()
    .int()
    .min(1, { message: "Order must be a positive integer." }), // For sorting categories
  color: z
    .string()
    .min(1, { message: "Color is required. Please provide a color code." })
    .max(7), // e.g., "#FF5733"
  userId: z.string().uuid(),
});
