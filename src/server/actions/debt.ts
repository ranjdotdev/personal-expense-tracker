"use server";

import { z } from "zod";
import { db } from "@/server/db";
import {
  createDebtSchema,
  updateDebtSchema,
  type DebtData,
} from "@/constants/debt-schemas";
import { getUserId } from "@/modules/auth-tools";

export async function getDebts() {
  const userID = await getUserId();
  try {
    const debts = await db.debt.findMany({
      where: { userId: userID },
      orderBy: { date: "desc" },
    });

    return {
      success: true,
      message: "Debts fetched successfully",
      data: debts,
    };
  } catch (error) {
    console.error("Error fetching debts:", error);
    return {
      success: false,
      message: "An error occurred while fetching debts",
      data: null,
    };
  }
}

export async function createDebt(data: DebtData) {
  const userID = await getUserId();
  try {
    const validatedData = createDebtSchema.parse({
      ...data,
      userId: userID,
    });

    const debt = await db.debt.create({
      data: {
        amount: validatedData.amount,
        description: validatedData.description,
        isOwed: validatedData.isOwed,
        date: validatedData.date,
        userId: userID,
      },
    });

    return {
      success: true,
      message: "Debt recorded successfully",
      data: debt,
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
    console.error("Debt creation error:", error);
    return {
      success: false,
      message: "An error occurred while recording the debt",
      data: null,
    };
  }
}

export async function updateDebt(id: string, data: Partial<DebtData>) {
  const userID = await getUserId();
  try {
    const existingDebt = await db.debt.findUnique({
      where: { id },
    });

    if (!existingDebt) {
      return {
        success: false,
        message: "Debt not found",
        data: null,
      };
    }

    if (existingDebt.userId !== userID) {
      return {
        success: false,
        message: "You don't have permission to update this debt",
        data: null,
      };
    }

    const validatedData = updateDebtSchema.parse(data);

    const updatedDebt = await db.debt.update({
      where: { id },
      data: validatedData,
    });

    return {
      success: true,
      message: "Debt updated successfully",
      data: updatedDebt,
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
    console.error("Debt update error:", error);
    return {
      success: false,
      message: "An error occurred while updating the debt",
      data: null,
    };
  }
}

export async function deleteDebt(id: string) {
  const userID = await getUserId();
  try {
    const existingDebt = await db.debt.findUnique({
      where: { id },
    });

    if (!existingDebt) {
      return {
        success: false,
        message: "Debt not found",
        data: null,
      };
    }

    if (existingDebt.userId !== userID) {
      return {
        success: false,
        message: "You don't have permission to delete this debt",
        data: null,
      };
    }

    const deletedDebt = await db.debt.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Debt deleted successfully",
      data: deletedDebt,
    };
  } catch (error) {
    console.error("Debt deletion error:", error);
    return {
      success: false,
      message: "An error occurred while deleting the debt",
      data: null,
    };
  }
}

export async function getDebtsByDateRange(startDate: Date, endDate: Date) {
  const userID = await getUserId();
  try {
    const debts = await db.debt.findMany({
      where: {
        userId: userID,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "desc" },
    });

    return {
      success: true,
      message: "Debts fetched successfully",
      data: debts,
    };
  } catch (error) {
    console.error("Error fetching debts by date range:", error);
    return {
      success: false,
      message: "An error occurred while fetching debts",
      data: null,
    };
  }
}

export async function getDebtSummary() {
  const userID = await getUserId();
  try {
    const debts = await db.debt.findMany({
      where: { userId: userID },
    });

    let totalOwed = 0;
    let totalOwing = 0;

    debts.forEach((debt) => {
      if (debt.isOwed) {
        totalOwed += debt.amount;
      } else {
        totalOwing += debt.amount;
      }
    });

    return {
      success: true,
      message: "Debt summary calculated successfully",
      data: {
        totalOwed,
        totalOwing,
        netBalance: totalOwed - totalOwing,
        debtCount: debts.length,
      },
    };
  } catch (error) {
    console.error("Error calculating debt summary:", error);
    return {
      success: false,
      message: "An error occurred while calculating debt summary",
      data: null,
    };
  }
}
