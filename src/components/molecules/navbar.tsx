"use client";
import Link from "next/link";
import { useState } from "react";
import type { JSX } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import type { UserPayload } from "@/constants/user-schemas";

export default function Navbar({
  user,
}: {
  user: UserPayload | undefined;
}): JSX.Element {
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState<string | null>(pathname);
  const currentUser: UserPayload | undefined = user;

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
  };

  return (
    <div className="absolute inset-x-0 top-4 z-40 mx-auto h-10 w-full max-w-[20rem]">
      <div className="flex h-full w-full flex-row items-center justify-around text-neutral-300">
        <Link
          href="/about"
          className={cn(
            "text-md flex items-center justify-center font-bold capitalize transition-colors duration-200",
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
          href="/"
          className={cn(
            "text-md flex items-center justify-center px-4 font-bold capitalize transition-colors duration-200",
            {
              "text-white": activeLink === "/",
              "hover:text-primary": activeLink !== "/",
              "text-neutral-500": activeLink !== "/",
            },
          )}
          onClick={() => handleLinkClick("/")}
        >
          Home
        </Link>
        {currentUser ? (
          <>
            <Link
              href="/settings"
              className={cn(
                "text-md flex items-center justify-center font-bold capitalize transition-colors duration-200",
                {
                  "text-white": activeLink === "/settings",
                  "hover:text-primary": activeLink !== "/settings",
                  "text-neutral-500": activeLink !== "/settings",
                },
              )}
              onClick={() => handleLinkClick("/settings")}
            >
              Settings
            </Link>
          </>
        ) : (
          <Link
            href="/signin"
            className={cn(
              "text-md flex items-center justify-center font-bold capitalize transition-colors duration-200",
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
        )}
      </div>
    </div>
  );
}
