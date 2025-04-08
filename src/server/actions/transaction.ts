"use server";

import { z } from "zod";
import { db } from "@/server/db";
import {
  createTransactionSchema,
  updateTransactionSchema,
  type TransactionData,
} from "@/constants/transaction-schemas";
import { getUserId } from "@/modules/auth-tools";

export async function getTransactions() {
  const userID = await getUserId();
  try {
    const transactions = await db.transaction.findMany({
      where: { userId: userID },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    return {
      success: true,
      message: "Transactions fetched successfully",
      data: transactions,
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      success: false,
      message: "An error occurred while fetching transactions",
      data: null,
    };
  }
}

export async function createTransaction(data: TransactionData) {
  const userID = await getUserId();
  try {
    const validatedData = createTransactionSchema.parse({
      ...data,
      userId: userID,
    });

    if (validatedData.categoryId) {
      const category = await db.category.findUnique({
        where: {
          id: validatedData.categoryId,
        },
      });

      if (!category || category.userId !== userID) {
        return {
          success: false,
          message: "Selected category does not exist or doesn't belong to you",
          data: null,
        };
      }

      if (category.type !== validatedData.type) {
        return {
          success: false,
          message: "Transaction type must match category type",
          data: null,
        };
      }
    }

    const transaction = await db.transaction.create({
      data: {
        amount: validatedData.amount,
        description: validatedData.description,
        type: validatedData.type,
        categoryId: validatedData.categoryId ?? null,
        date: validatedData.date,
        userId: userID,
      },
      include: {
        category: true,
      },
    });

    return {
      success: true,
      message: "Transaction added successfully",
      data: transaction,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid input",
        errors: error.errors,
        data: null,
      };
    }
    console.error("Transaction creation error:", error);
    return {
      success: false,
      message: "An error occurred while creating the transaction",
      data: null,
    };
  }
}

export async function updateTransaction(
  id: string,
  data: Partial<TransactionData>,
) {
  const userID = await getUserId();
  try {
    const existingTransaction = await db.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return {
        success: false,
        message: "Transaction not found",
        data: null,
      };
    }

    if (existingTransaction.userId !== userID) {
      return {
        success: false,
        message: "You don't have permission to update this transaction",
        data: null,
      };
    }

    const validatedData = updateTransactionSchema.parse(data);

    if (validatedData.categoryId) {
      const category = await db.category.findUnique({
        where: {
          id: validatedData.categoryId,
        },
      });

      if (!category || category.userId !== userID) {
        return {
          success: false,
          message: "Selected category does not exist or doesn't belong to you",
          data: null,
        };
      }

      const transactionType = validatedData.type ?? existingTransaction.type;

      if (category.type !== transactionType) {
        return {
          success: false,
          message: "Transaction type must match category type",
          data: null,
        };
      }
    }

    const updatedTransaction = await db.transaction.update({
      where: { id },
      data: validatedData,
      include: {
        category: true,
      },
    });

    return {
      success: true,
      message: "Transaction updated successfully",
      data: updatedTransaction,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid input",
        errors: error.errors,
        data: null,
      };
    }
    console.error("Transaction update error:", error);
    return {
      success: false,
      message: "An error occurred while updating the transaction",
      data: null,
    };
  }
}

export async function deleteTransaction(id: string) {
  const userID = await getUserId();
  try {
    const existingTransaction = await db.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return {
        success: false,
        message: "Transaction not found",
        data: null,
      };
    }

    if (existingTransaction.userId !== userID) {
      return {
        success: false,
        message: "You don't have permission to delete this transaction",
        data: null,
      };
    }

    const deletedTransaction = await db.transaction.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Transaction deleted successfully",
      data: deletedTransaction,
    };
  } catch (error) {
    console.error("Transaction deletion error:", error);
    return {
      success: false,
      message: "An error occurred while deleting the transaction",
      data: null,
    };
  }
}

export async function getTransactionsByDateRange(
  startDate: Date,
  endDate: Date,
) {
  const userID = await getUserId();
  try {
    const transactions = await db.transaction.findMany({
      where: {
        userId: userID,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    return {
      success: true,
      message: "Transactions fetched successfully",
      data: transactions,
    };
  } catch (error) {
    console.error("Error fetching transactions by date range:", error);
    return {
      success: false,
      message: "An error occurred while fetching transactions",
      data: null,
    };
  }
}

export async function getTransactionsByCategory(categoryId: string) {
  const userID = await getUserId();
  try {
    const category = await db.category.findUnique({
      where: {
        id: categoryId,
        userId: userID,
      },
    });

    if (!category) {
      return {
        success: false,
        message: "Category not found or doesn't belong to you",
        data: null,
      };
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: userID,
        categoryId: categoryId,
      },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    return {
      success: true,
      message: "Transactions fetched successfully",
      data: transactions,
    };
  } catch (error) {
    console.error("Error fetching transactions by category:", error);
    return {
      success: false,
      message: "An error occurred while fetching transactions",
      data: null,
    };
  }
}
