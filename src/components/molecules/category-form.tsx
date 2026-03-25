"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionType } from "@prisma/client";
import {
  categorySchema,
  type Category,
} from "@/constants/category-schemas";
import { z } from "zod";
import {
  createCategory,
  updateCategory,
} from "@/server/actions/category";

import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";

export function CategoryForm({
  className,
  category,
  onSuccess,
  ...props
}: Omit<React.ComponentProps<"div">, "onClick"> & {
  category?: Category;
  onSuccess?: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const categoryFormSchema = categorySchema.omit({ userId: true, order: true });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      type: category?.type ?? TransactionType.EXPENSE,
      color: category?.color ?? undefined,
      id: category?.id,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        type: category.type,
        color: category.color ?? undefined,
        id: category.id,
      });
      setIsOpen(true);
    }
  }, [category, reset]);

  const onSubmit = async (data: z.infer<typeof categoryFormSchema>) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      let result;
      if (category) {
        const updateData: Category = {
          id: category.id,
          name: data.name,
          type: data.type,
          color: data.color,
          order: category.order,
          userId: category.userId,
        };
        result = await updateCategory(updateData);
      } else {
        result = await createCategory(data as Parameters<typeof createCategory>[0]);
      }

      if (result.success) {
        setIsOpen(false);
        reset();
        onSuccess?.();
      } else {
        setServerError(result.message);
      }
    } catch (error) {
      setServerError("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!category && (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className={className}
        >
          Add Category
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {category ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {category
                ? "Update the category details below"
                : "Enter the category details below"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {serverError && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {serverError}
                </div>
              )}

              <div className="grid gap-3">
                <label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Category name"
                  {...register("name")}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <label htmlFor="type" className="text-sm font-medium">
                  Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch("type")}
                  onValueChange={(value) =>
                    setValue("type", value as TransactionType)
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TransactionType.INCOME}>
                      Income
                    </SelectItem>
                    <SelectItem value={TransactionType.EXPENSE}>
                      Expense
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <label htmlFor="color" className="text-sm font-medium">
                  Color <span className="text-muted-foreground text-xs">(Optional)</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    id="color-picker"
                    type="color"
                    value={watch("color") || "#000000"}
                    onChange={(e) => {
                      setValue("color", e.target.value);
                    }}
                    className="h-10 w-20 cursor-pointer"
                    aria-invalid={errors.color ? "true" : "false"}
                  />
                  <Input
                    id="color-text"
                    type="text"
                    placeholder="#FF5733"
                    value={watch("color") || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setValue("color", value || undefined);
                    }}
                    aria-invalid={errors.color ? "true" : "false"}
                  />
                </div>
                {errors.color && (
                  <p className="text-sm text-red-500">{errors.color.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? category
                    ? "Updating..."
                    : "Creating..."
                  : category
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

