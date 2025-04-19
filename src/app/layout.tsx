import Navbar from "@/components/molecules/navbar";
import { getUser } from "@/modules/auth-tools";
import "@/styles/globals.css";
import { type Metadata } from "next";
// import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Personal Expense Tracker",
  description: "A minimal website to track and manage your expenses",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// const geist = Geist({
//   subsets: ["latin"],
//   variable: "--font-geist-sans",
// });
// ${geist.variable}
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();

  return (
    <html lang="en">
      <body
        className={`text-primary bg-background dark overflow-x-hidden font-medium antialiased`}
      >
        <Navbar user={user} />
        <div className="flex h-full w-full justify-center">
          <div className="selection:bg-highlight flex h-dvh w-full flex-shrink flex-grow flex-col items-center pt-18 sm:pt-17">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
