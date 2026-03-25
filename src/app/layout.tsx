import Navbar from "@/components/molecules/navbar";
import { getUser } from "@/modules/auth-tools";
import "@/styles/globals.css";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Expense Tracker",
  description: "A minimal website to track and manage your expenses",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();

  return (
    <html lang="en">
      <body
        className={`text-primary bg-background dark overflow-x-hidden font-medium antialiased`}
      >
        {/* Navbar is conditionally rendered in public layout or here for protected routes */}
        {user && <Navbar user={user} />}
        <div className="flex h-full w-full justify-center">
          <div className={`selection:bg-highlight flex h-dvh w-full flex-shrink flex-grow flex-col items-center ${user ? "pt-18 sm:pt-17" : ""}`}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
