"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createDebt, updateDebt } from "@/server/actions/debt";

const debtFormSchema = z.object({
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
  isOwed: z.boolean(),
  date: z.date().optional(),
});

type DebtFormData = z.infer<typeof debtFormSchema>;

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

type Debt = {
  id: string;
  amount: number;
  description: string;
  isOwed: boolean;
  date: Date | string;
};

export function DebtForm({
  className,
  debt,
  onSuccess,
  ...props
}: Omit<React.ComponentProps<"div">, "onClick"> & {
  debt?: Debt;
  onSuccess?: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      amount: debt?.amount ?? 0,
      description: debt?.description ?? "",
      isOwed: debt?.isOwed ?? true,
      date: debt?.date ? (debt.date instanceof Date ? debt.date : new Date(debt.date)) : new Date(),
    },
  });

  useEffect(() => {
    if (debt) {
      reset({
        amount: debt.amount,
        description: debt.description,
        isOwed: debt.isOwed,
        date: debt.date instanceof Date ? debt.date : new Date(debt.date),
      });
      setIsOpen(true);
    }
  }, [debt, reset]);

  const onSubmit = async (data: DebtFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const debtData = {
        ...data,
        date: data.date ?? new Date(),
      };

      let result;
      if (debt) {
        result = await updateDebt(debt.id, debtData);
      } else {
        result = await createDebt(debtData as Parameters<typeof createDebt>[0]);
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
      {!debt && (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className={className}
        >
          Add Debt
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {debt ? "Edit Debt" : "Add Debt"}
            </DialogTitle>
            <DialogDescription>
              {debt
                ? "Update the debt details below"
                : "Enter the debt details below"}
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
                <label htmlFor="isOwed" className="text-sm font-medium">
                  Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch("isOwed") ? "owed" : "owing"}
                  onValueChange={(value) =>
                    setValue("isOwed", value === "owed")
                  }
                >
                  <SelectTrigger id="isOwed">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owed">Owed to me</SelectItem>
                    <SelectItem value="owing">I owe</SelectItem>
                  </SelectContent>
                </Select>
                {errors.isOwed && (
                  <p className="text-sm text-red-500">
                    {errors.isOwed.message}
                  </p>
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
                <label htmlFor="date" className="text-sm font-medium">
                  Date <span className="text-red-500">*</span>
                </label>
                <Input
                  id="date"
                  type="date"
                  {...register("date", { valueAsDate: true })}
                  defaultValue={
                    debt?.date
                      ? (debt.date instanceof Date
                          ? debt.date
                          : new Date(debt.date)
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
                  ? debt
                    ? "Updating..."
                    : "Creating..."
                  : debt
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

