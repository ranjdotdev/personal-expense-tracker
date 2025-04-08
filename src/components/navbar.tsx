import Link from "next/link";
import type { JSX } from "react";

export default function Navbar(): JSX.Element {
  return (
    <div className="sm:pmt-2 absolute inset-x-0 top-4 z-40 mx-auto h-10 w-full max-w-[20rem] rounded-[1rem] bg-neutral-950">
      <div className="flex h-full w-full flex-row items-center justify-around align-middle text-neutral-300">
        <Link
          href="/about"
          className="hover:text-primary text-md flex items-center justify-center rounded-tl-[1rem] rounded-bl-[1rem] font-bold capitalize"
        >
          about
        </Link>

        <Link
          href="/"
          className="hover:text-primary text-md flex items-center justify-center border-x border-neutral-900 font-bold capitalize"
        >
          Home
        </Link>

        <Link
          href="/signin"
          className="hover:text-primary text-md flex items-center justify-center rounded-tr-[1rem] rounded-br-[1rem] font-bold capitalize"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
