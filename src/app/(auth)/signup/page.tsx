"use client";

import { SignupForm } from "@/components/molecules/signup-form";

export default function Page() {
  return (
    <div className="flex min-h-full w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
