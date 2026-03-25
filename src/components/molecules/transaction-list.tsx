"use client";

import { useState, useEffect } from "react";
import { TransactionType } from "@prisma/client";
import { getTransactions, deleteTransaction } from "@/server/actions/transaction";
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
import { TransactionForm } from "./transaction-form";
import { DateRangeFilter } from "./date-range-filter";
import { getTransactionsByDateRange } from "@/server/actions/transaction";

type Transaction = {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  categoryId?: string | null;
  date: Date | string;
  category?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;
};

export function TransactionList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });

  const loadTransactions = async () => {
    try {
      setLoading(true);
      let result;
      if (dateRange.startDate && dateRange.endDate) {
        result = await getTransactionsByDateRange(
          dateRange.startDate,
          dateRange.endDate,
        );
      } else {
        result = await getTransactions();
      }
      if (result.success && result.data) {
        setTransactions(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load transactions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const result = await deleteTransaction(id);
      if (result.success) {
        void loadTransactions();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Failed to delete transaction");
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)} {...props}>
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)} {...props}>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <div className="flex items-center gap-2">
          <DateRangeFilter
            onDateRangeChange={(range) => {
              setDateRange(range);
            }}
          />
          <TransactionForm onSuccess={() => void loadTransactions()} />
        </div>
      </div>

      {dateRange.startDate && dateRange.endDate && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing transactions from{" "}
            {dateRange.startDate.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}{" "}
            to{" "}
            {dateRange.endDate.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDateRange({ startDate: null, endDate: null })}
          >
            Clear filter
          </Button>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground mb-4">
            {dateRange.startDate && dateRange.endDate
              ? "No transactions found in the selected date range."
              : "No transactions yet. Add your first transaction to get started."}
          </p>
          <TransactionForm onSuccess={() => void loadTransactions()} />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="text-right w-[120px]">Amount</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell className="font-medium break-words">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    {transaction.category ? (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: transaction.category.color ?? undefined,
                        }}
                      >
                        {transaction.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.type === TransactionType.INCOME
                          ? "default"
                          : "destructive"
                      }
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span
                      className={
                        transaction.type === TransactionType.INCOME
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {transaction.type === TransactionType.INCOME ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTransaction(transaction)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
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
      )}

      {editingTransaction && (
        <TransactionForm
          transaction={{
            ...editingTransaction,
            date:
              editingTransaction.date instanceof Date
                ? editingTransaction.date
                : new Date(editingTransaction.date),
          }}
          onSuccess={() => {
            setEditingTransaction(null);
            void loadTransactions();
          }}
        />
      )}
    </div>
  );
}

