import Navbar from "@/components/navbar";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Personal Expense Tracker",
  description: "A minimal website to track and manage your expenses",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} text-primary bg-background dark overflow-x-hidden font-medium antialiased`}
      >
        <Navbar />
        <div className="flex h-full w-full">
          <div className="selection:bg-highlight @container/mainview flex h-dvh w-full flex-shrink flex-grow pt-18 sm:pt-17">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
