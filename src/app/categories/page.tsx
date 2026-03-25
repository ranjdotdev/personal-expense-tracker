"use client";

import { CategoryList } from "@/components/molecules/category-list";

export default function CategoriesPage() {
  return (
    <div className="flex min-h-full w-full items-start justify-center p-6 md:p-10">
      <div className="w-full max-w-6xl">
        <CategoryList />
      </div>
    </div>
  );
}

