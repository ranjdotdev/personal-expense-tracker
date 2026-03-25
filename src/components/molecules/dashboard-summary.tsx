"use client";

import { useState, useEffect } from "react";
import { getTransactions } from "@/server/actions/transaction";
import { getDebtSummary } from "@/server/actions/debt";
import { TransactionType } from "@prisma/client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";

export function DashboardSummary({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [summary, setSummary] = useState<{
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
    debtSummary: {
      totalOwed: number;
      totalOwing: number;
      netBalance: number;
    } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const [transactionsResult, debtSummaryResult] = await Promise.all([
          getTransactions(),
          getDebtSummary(),
        ]);

        let totalIncome = 0;
        let totalExpense = 0;
        let transactionCount = 0;

        if (transactionsResult.success && transactionsResult.data) {
          transactionsResult.data.forEach((transaction) => {
            if (transaction.type === TransactionType.INCOME) {
              totalIncome += transaction.amount;
            } else {
              totalExpense += transaction.amount;
            }
            transactionCount++;
          });
        }

        const debtSummary =
          debtSummaryResult.success && debtSummaryResult.data
            ? debtSummaryResult.data
            : null;

        setSummary({
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          transactionCount,
          debtSummary,
        });
      } catch (err) {
        console.error("Failed to load summary:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadSummary();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)} {...props}>
        <p className="text-muted-foreground">Loading summary...</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <CardDescription>All income transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <CardDescription>All expense transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.totalExpense)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <CardDescription>Income - Expenses</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <CardDescription>Total count</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.transactionCount}</p>
        </CardContent>
      </Card>

      {summary.debtSummary && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Owed to Me</CardTitle>
              <CardDescription>Total debts owed to you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.debtSummary.totalOwed)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">I Owe</CardTitle>
              <CardDescription>Total debts you owe</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.debtSummary.totalOwing)}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

