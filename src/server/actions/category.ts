"use server";

import { z } from "zod";
import { db } from "@/server/db";
import {
  categorySchema,
  type Category,
  type CategoryData,
} from "@/constants/category-schemas";
import { getUserId, AuthenticationError } from "@/modules/auth-tools";

export async function getCategories() {
  try {
    const userID = await getUserId();
    const categories = await db.category.findMany({
      where: { userId: userID },
      orderBy: { order: "asc" },
    });

    return {
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        message: "Authentication required",
        data: null,
      };
    }
    console.error("Error fetching categories:", error);
    return {
      success: false,
      message: "An error occurred while fetching categories",
      data: null,
    };
  }
}

export async function createCategory(data: CategoryData) {
  try {
    const userID = await getUserId();
    const validatedData = categorySchema.parse(data);

    const existingCategory = await db.category.findUnique({
      where: {
        userId_name: {
          userId: userID,
          name: validatedData.name,
        },
      },
    });

    if (existingCategory) {
      return {
        success: false,
        message: "Category with this name already exists",
      };
    }

    const category = await db.$transaction(async (tx) => {
      const count = await tx.category.count({
        where: { userId: userID },
      });
      return tx.category.create({
        data: {
          userId: userID,
          name: validatedData.name,
          color: validatedData.color ?? null,
          type: validatedData.type ?? "INCOME",
          order: count + 1,
        },
      });
    });

    return {
      success: true,
      message: "Category added successfully",
      data: category,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        message: "Authentication required",
        data: null,
      };
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid input",
        errors: error.errors,
        data: null,
      };
    }
    console.error("Category creation error:", error);
    return {
      success: false,
      message: "An error occurred while creating the category",
      data: null,
    };
  }
}

export async function deleteCategory(catID: string) {
  try {
    const userID = await getUserId();
    const existingCategory = await db.category.findUnique({
      where: {
        id: catID,
      },
    });

    if (!existingCategory) {
      return {
        success: false,
        message: "Category with this name does not exist.",
      };
    }

    if (existingCategory.userId !== userID) {
      return {
        success: false,
        message: "This category does not belong to the requester",
      };
    }

    const deletedCategory = await db.$transaction(async (tx) => {
      const category = await tx.category.delete({
        where: { id: catID },
      });

      await tx.category.updateMany({
        where: {
          userId: category.userId,
          order: { gt: category.order },
        },
        data: {
          order: { decrement: 1 },
        },
      });
      return category;
    });

    return {
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        message: "Authentication required",
        data: null,
      };
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid input",
        errors: error.errors,
        data: null,
      };
    }
    console.error("Category deletion error:", error);
    return {
      success: false,
      message: "An error occurred while deleting the category",
      data: null,
    };
  }
}

export async function updateCategory(data: Category) {
  try {
    const userID = await getUserId();
    const validatedData = categorySchema.parse(data);

    const existingCategory = await db.category.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!existingCategory) {
      return {
        success: false,
        message: "Category not found",
      };
    }

    if (existingCategory.userId !== userID) {
      return {
        success: false,
        message: "You don't have permission to update this category",
      };
    }

    if (validatedData.name !== existingCategory.name) {
      const nameExists = await db.category.findUnique({
        where: {
          userId_name: {
            userId: userID,
            name: validatedData.name,
          },
        },
      });

      if (nameExists) {
        return {
          success: false,
          message: "Category with this name already exists",
        };
      }
    }

    const updatedCategory = await db.category.update({
      where: { id: data.id },
      data: {
        name: validatedData.name,
        color: validatedData.color,
        type: validatedData.type,
        order: validatedData.order,
      },
    });

    return {
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        message: "Authentication required",
        data: null,
      };
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid input",
        errors: error.errors,
        data: null,
      };
    }
    console.error("Category update error:", error);
    return {
      success: false,
      message: "An error occurred while updating the category",
      data: null,
    };
  }
}

export async function swapCategory(catID: string, newOrder: number) {
  try {
    const userID = await getUserId();
    const category = await db.category.findUnique({
      where: { id: catID },
    });

    if (!category) {
      return {
        success: false,
        message: "Category not found",
      };
    }

    if (category.userId !== userID) {
      return {
        success: false,
        message: "Category does not belong to this user",
      };
    }

    const catCount = await db.category.count({
      where: { userId: userID },
    });

    if (newOrder < 1 || newOrder > catCount) {
      return {
        success: false,
        message: `Order must be between 1 and ${catCount}`,
      };
    }

    const currentOrder = category.order;

    if (currentOrder === newOrder) {
      return {
        success: true,
        message: "Category order unchanged",
        data: category,
      };
    }

    const updatedCategory = await db.$transaction(async (tx) => {
      if (newOrder > currentOrder) {
        await tx.category.updateMany({
          where: {
            userId: userID,
            order: {
              gt: currentOrder,
              lte: newOrder,
            },
          },
          data: {
            order: { decrement: 1 },
          },
        });
      } else {
        await tx.category.updateMany({
          where: {
            userId: userID,
            order: {
              gte: newOrder,
              lt: currentOrder,
            },
          },
          data: {
            order: { increment: 1 },
          },
        });
      }

      return tx.category.update({
        where: { id: catID },
        data: { order: newOrder },
      });
    });

    return {
      success: true,
      message: "Category order updated successfully",
      data: updatedCategory,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        message: "Authentication required",
        data: null,
      };
    }
    console.error("Category swap error:", error);
    return {
      success: false,
      message: "An error occurred while updating the category order",
      data: null,
    };
  }
}
