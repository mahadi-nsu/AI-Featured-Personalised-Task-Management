"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/"
        className={`hover:text-gray-300 transition-colors ${
          pathname === "/"
            ? "text-white font-bold border-b-2 border-white"
            : "text-gray-400"
        }`}
      >
        Home
      </Link>
      <Link
        href="/ai-testing"
        className={`relative px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 group flex items-center gap-2 ${
          pathname === "/ai-testing"
            ? "bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold"
            : "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700"
        }`}
      >
        <span className="relative z-10">AI Testing</span>
        <span className="relative z-10 text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse">
          Exclusive
        </span>
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
      </Link>

      <Link
        href="/analytics"
        className={`hover:text-gray-300 transition-colors ${
          pathname === "/analytics"
            ? "text-white font-bold border-b-2 border-white"
            : "text-gray-400"
        }`}
      >
        Analytics
      </Link>

      <Link
        href="/debug"
        className={`hover:text-gray-300 transition-colors ${
          pathname === "/debug"
            ? "text-white font-bold border-b-2 border-white"
            : "text-gray-400"
        }`}
      >
        Backend/Localstorage
      </Link>
      <ThemeToggle />
    </div>
  );
}
