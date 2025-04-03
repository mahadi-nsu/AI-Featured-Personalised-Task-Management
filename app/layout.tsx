import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { NavLinks } from "@/components/nav-links";

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
          <nav className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="text-lg font-semibold">Task Management</div>
              <NavLinks />
            </div>
          </nav>
          <main className="container mx-auto px-4 py-6">{children}</main>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
