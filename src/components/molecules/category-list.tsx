"use client";

import { useState, useEffect } from "react";
import { TransactionType } from "@prisma/client";
import { getCategories, deleteCategory } from "@/server/actions/category";
import { Trash2, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Badge } from "@/components/atoms/badge";
import { CategoryForm } from "./category-form";

type Category = {
  id: string;
  name: string;
  type: TransactionType;
  order: number;
  color?: string | null;
  userId: string;
};

export function CategoryList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const result = await deleteCategory(id);
      if (result.success) {
        void loadCategories();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Failed to delete category");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div
        className={cn("flex items-center justify-center p-8", className)}
        {...props}
      >
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn("flex items-center justify-center p-8", className)}
        {...props}
      >
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const incomeCategories = categories.filter(
    (cat) => cat.type === TransactionType.INCOME,
  );
  const expenseCategories = categories.filter(
    (cat) => cat.type === TransactionType.EXPENSE,
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categories</h2>
        <CategoryForm onSuccess={() => void loadCategories()} />
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No categories yet. Add your first category to get started.
          </p>
          <CategoryForm onSuccess={() => void loadCategories()} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {incomeCategories.length > 0 && (
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-medium">
                Income Categories
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px] min-w-[150px]">
                        Name
                      </TableHead>
                      <TableHead className="w-[100px]">Color</TableHead>
                      <TableHead className="w-[80px]">Order</TableHead>
                      <TableHead className="w-[120px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium break-words">
                          {category.name}
                        </TableCell>
                        <TableCell>
                          {category.color && (
                            <div
                              className="size-6 rounded-full border"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{category.order}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingCategory(category)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {expenseCategories.length > 0 && (
            <div>
              <h3 className="text-muted-foreground mb-3 text-sm font-medium">
                Expense Categories
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px] min-w-[150px]">
                        Name
                      </TableHead>
                      <TableHead className="w-[100px]">Color</TableHead>
                      <TableHead className="w-[80px]">Order</TableHead>
                      <TableHead className="w-[120px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium break-words">
                          {category.name}
                        </TableCell>
                        <TableCell>
                          {category.color && (
                            <div
                              className="size-6 rounded-full border"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{category.order}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingCategory(category)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}

      {editingCategory && (
        <CategoryForm
          category={{
            ...editingCategory,
            color: editingCategory.color ?? undefined,
          }}
          onSuccess={() => {
            setEditingCategory(null);
            void loadCategories();
          }}
        />
      )}
    </div>
  );
}
