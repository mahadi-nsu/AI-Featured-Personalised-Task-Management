import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task Management App",
  description: "A simple task management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <nav className="bg-black text-white">
            <div className="flex justify-between items-center px-4 py-2">
              <h1 className="text-xl font-bold">Task Management</h1>
              <div className="flex items-center gap-2">
                <Link href="/debug" className="hover:text-gray-300">
                  Debug
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </nav>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
