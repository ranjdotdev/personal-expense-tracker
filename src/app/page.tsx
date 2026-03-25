"use client";

import { DashboardSummary } from "@/components/molecules/dashboard-summary";
import { TransactionList } from "@/components/molecules/transaction-list";

export default function HomePage() {
  return (
    <div className="flex min-h-full w-full flex-col items-start justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <DashboardSummary />
      </div>
      <div className="w-full max-w-6xl">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
        <TransactionList />
      </div>
    </div>
  );
}
