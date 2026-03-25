"use client";

import { DebtList } from "@/components/molecules/debt-list";

export default function DebtsPage() {
  return (
    <div className="flex min-h-full w-full items-start justify-center p-6 md:p-10">
      <div className="w-full max-w-6xl">
        <DebtList />
      </div>
    </div>
  );
}

