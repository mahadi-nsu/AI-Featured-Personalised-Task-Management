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
          <nav className="bg-background border-b shadow-sm sticky top-0 z-50 backdrop-blur-sm">
            <div className="w-10/12 mx-auto px-1 sm:px-2 lg:px-4 border-slate-950">
              <div className="flex justify-between items-center h-14">
                <h1 className="text-lg font-semibold tracking-tight">
                  Task Management
                </h1>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/debug"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Debug
                  </Link>
                  <ThemeToggle />
                </div>
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
