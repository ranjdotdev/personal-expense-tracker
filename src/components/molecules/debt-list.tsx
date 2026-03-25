"use client";

import { useState, useEffect } from "react";
import { getDebts, deleteDebt, getDebtSummary } from "@/server/actions/debt";
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
import { DebtForm } from "./debt-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { DateRangeFilter } from "./date-range-filter";
import { getDebtsByDateRange } from "@/server/actions/debt";

type Debt = {
  id: string;
  amount: number;
  description: string;
  isOwed: boolean;
  date: Date | string;
};

export function DebtList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<{
    totalOwed: number;
    totalOwing: number;
    netBalance: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });

  const loadDebts = async () => {
    try {
      setLoading(true);
      const debtsPromise = dateRange.startDate && dateRange.endDate
        ? getDebtsByDateRange(dateRange.startDate, dateRange.endDate)
        : getDebts();
      const [debtsResult, summaryResult] = await Promise.all([
        debtsPromise,
        getDebtSummary(),
      ]);

      if (debtsResult.success && debtsResult.data) {
        // Both getDebts and getDebtsByDateRange return the same Debt[] type
        const debts = debtsResult.data;
        setDebts(debts);
      } else {
        setError(debtsResult.message ?? "Failed to load debts");
      }

      if (summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data);
      }
    } catch (err) {
      setError("Failed to load debts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDebts();
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this debt?")) {
      return;
    }

    try {
      const result = await deleteDebt(id);
      if (result.success) {
        void loadDebts();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Failed to delete debt");
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
        <p className="text-muted-foreground">Loading debts...</p>
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Owed to Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalOwed)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total I Owe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalOwing)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${
                  summary.netBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(summary.netBalance)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Debts</h2>
        <div className="flex items-center gap-2">
          <DateRangeFilter
            onDateRangeChange={(range) => {
              setDateRange(range);
            }}
          />
          <DebtForm onSuccess={() => void loadDebts()} />
        </div>
      </div>

      {dateRange.startDate && dateRange.endDate && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing debts from{" "}
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

      {debts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No debts yet. Add your first debt to get started.
          </p>
          <DebtForm onSuccess={() => void loadDebts()} />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="text-right w-[120px]">Amount</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell>{formatDate(debt.date)}</TableCell>
                  <TableCell className="font-medium break-words">
                    {debt.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={debt.isOwed ? "default" : "destructive"}
                    >
                      {debt.isOwed ? "Owed to me" : "I owe"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span
                      className={debt.isOwed ? "text-green-600" : "text-red-600"}
                    >
                      {debt.isOwed ? "+" : "-"}
                      {formatCurrency(debt.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingDebt(debt)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(debt.id)}
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

      {editingDebt && (
        <DebtForm
          debt={editingDebt}
          onSuccess={() => {
            setEditingDebt(null);
            void loadDebts();
          }}
        />
      )}
    </div>
  );
}

