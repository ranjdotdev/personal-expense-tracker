"use client";

import { Button } from "@/components/atoms/button";
import { signout } from "@/server/actions/auth";
import { useRouter } from "next/navigation";

export default function Settings() {
  const router = useRouter();
  const onSignout = async () => {
    const result = await signout();
    if (result.success) {
      router.push("/");
    }
  };
  return (
    <div className="relative z-40 flex h-full w-full flex-row items-center justify-center text-neutral-300 selection:bg-neutral-700">
      <Button onClick={onSignout}>Log Out</Button>
    </div>
  );
}
