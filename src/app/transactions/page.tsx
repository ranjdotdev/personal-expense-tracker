"use client";

import { TransactionList } from "@/components/molecules/transaction-list";

export default function TransactionsPage() {
  return (
    <div className="flex min-h-full w-full items-start justify-center p-6 md:p-10">
      <div className="w-full max-w-6xl">
        <TransactionList />
      </div>
    </div>
  );
}

