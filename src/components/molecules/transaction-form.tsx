"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionType } from "@prisma/client";
import { z } from "zod";
import { createTransactionSchema } from "@/constants/transaction-schemas";
import {
  createTransaction,
  updateTransaction,
} from "@/server/actions/transaction";
import { getCategories } from "@/server/actions/category";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";

const transactionFormSchema = createTransactionSchema
  .omit({ userId: true })
  .extend({
    date: z.date().optional(),
  });

type TransactionFormData = z.infer<typeof transactionFormSchema>;
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

type Category = {
  id: string;
  name: string;
  type: TransactionType;
  color?: string | null;
};

type Transaction = {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  categoryId?: string | null;
  date: Date;
  category?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;
};

export function TransactionForm({
  className,
  transaction,
  onSuccess,
  ...props
}: Omit<React.ComponentProps<"div">, "onClick"> & {
  transaction?: Transaction;
  onSuccess?: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: transaction?.amount ?? 0,
      description: transaction?.description ?? "",
      type: transaction?.type ?? TransactionType.EXPENSE,
      categoryId: transaction?.categoryId ?? undefined,
      date: transaction?.date ? new Date(transaction.date) : new Date(),
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    };
    void loadCategories();
  }, []);

  useEffect(() => {
    if (selectedType) {
      setValue("categoryId", undefined);
    }
  }, [selectedType, setValue]);

  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        categoryId: transaction.categoryId ?? undefined,
        date: new Date(transaction.date),
      });
      setIsOpen(true);
    }
  }, [transaction, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const transactionData = {
        ...data,
        date: data.date ?? new Date(),
      };

      let result;
      if (transaction) {
        result = await updateTransaction(transaction.id, transactionData);
      } else {
        result = await createTransaction(transactionData as Parameters<typeof createTransaction>[0]);
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

  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedType,
  );

  return (
    <>
      {!transaction && (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className={className}
        >
          Add Transaction
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {transaction ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
            <DialogDescription>
              {transaction
                ? "Update the transaction details below"
                : "Enter the transaction details below"}
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
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount", { valueAsNumber: true })}
                  aria-invalid={errors.amount ? "true" : "false"}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Enter description"
                  {...register("description")}
                  aria-invalid={errors.description ? "true" : "false"}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <label htmlFor="categoryId" className="text-sm font-medium">
                  Category (Optional)
                </label>
                <Select
                  value={watch("categoryId") ?? "__none__"}
                  onValueChange={(value) =>
                    setValue("categoryId", value === "__none__" ? undefined : value)
                  }
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No categories available
                      </div>
                    ) : (
                      <>
                        <SelectItem value="__none__">
                          None
                        </SelectItem>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <label htmlFor="date" className="text-sm font-medium">
                  Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="date"
                  type="date"
                  {...register("date", { valueAsDate: true })}
                  defaultValue={
                    transaction?.date
                      ? (transaction.date instanceof Date
                          ? transaction.date
                          : new Date(transaction.date)
                        )
                          .toISOString()
                          .split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  aria-invalid={errors.date ? "true" : "false"}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date.message}</p>
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
                  ? transaction
                    ? "Updating..."
                    : "Creating..."
                  : transaction
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

