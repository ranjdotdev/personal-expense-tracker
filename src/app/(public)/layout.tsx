"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState<string | null>(pathname);

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
  };

  return (
    <>
      {/* Minimal navbar for public pages (unlogged users) */}
      <div className="absolute inset-x-0 top-4 z-40 mx-auto h-10 w-full max-w-4xl px-4">
        <div className="flex h-full w-full flex-row items-center justify-around gap-2 text-neutral-300">
          <Link
            href="/about"
            className={cn(
              "text-sm flex items-center justify-center px-2 font-bold capitalize transition-colors duration-200",
              {
                "text-white": activeLink === "/about",
                "hover:text-primary": activeLink !== "/about",
                "text-neutral-500": activeLink !== "/about",
              },
            )}
            onClick={() => handleLinkClick("/about")}
          >
            About
          </Link>
          <Link
            href="/signin"
            className={cn(
              "text-sm flex items-center justify-center px-2 font-bold capitalize transition-colors duration-200",
              {
                "text-white": activeLink === "/signin",
                "hover:text-primary": activeLink !== "/signin",
                "text-neutral-500": activeLink !== "/signin",
              },
            )}
            onClick={() => handleLinkClick("/signin")}
          >
            Sign In
          </Link>
        </div>
      </div>
      <div className="pt-18 sm:pt-17">
        {children}
      </div>
    </>
  );
}
