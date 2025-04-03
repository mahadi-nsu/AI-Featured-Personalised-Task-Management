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
          <nav className="bg-gray-900 text-white p-4">
            <div className="container mx-auto flex items-center justify-between">
              <div className="text-lg font-semibold">Task Management</div>
              <div className="flex items-center gap-4">
                <Link href="/" className="hover:text-gray-300">
                  Home
                </Link>
                <Link
                  href="/ai-testing"
                  className="relative px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 group flex items-center gap-2"
                >
                  <span className="relative z-10">AI Testing</span>
                  <span className="relative z-10 text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse">
                    Exclusive
                  </span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </Link>
                <Link href="/debug" className="hover:text-gray-300">
                  Debug
                </Link>
                <Link href="/analytics" className="hover:text-gray-300">
                  Analytics
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
