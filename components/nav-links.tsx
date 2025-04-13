"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function NavLinks() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4">
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
          href="/routines"
          className={`hover:text-gray-300 transition-colors ${
            pathname === "/routines"
              ? "text-white font-bold border-b-2 border-white"
              : "text-gray-400"
          }`}
        >
          Routines
        </Link>

        <Link
          href="/job-hunt"
          className={`hover:text-gray-300 transition-colors ${
            pathname === "/job-hunt"
              ? "text-white font-bold border-b-2 border-white"
              : "text-gray-400"
          }`}
        >
          Job-hunt
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

      {/* Mobile Navigation */}
      <div
        className={`fixed inset-0 bg-gray-900/95 z-50 md:hidden transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <Link
            href="/"
            className={`text-2xl hover:text-gray-300 transition-colors ${
              pathname === "/"
                ? "text-white font-bold border-b-2 border-white"
                : "text-gray-400"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/ai-testing"
            className={`relative px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 group flex items-center gap-2 ${
              pathname === "/ai-testing"
                ? "bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold"
                : "bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="relative z-10">AI Testing</span>
            <span className="relative z-10 text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse">
              Exclusive
            </span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </Link>

          <Link
            href="/analytics"
            className={`text-2xl hover:text-gray-300 transition-colors ${
              pathname === "/analytics"
                ? "text-white font-bold border-b-2 border-white"
                : "text-gray-400"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Analytics
          </Link>

          <Link
            href="/routines"
            className={`text-2xl hover:text-gray-300 transition-colors ${
              pathname === "/routines"
                ? "text-white font-bold border-b-2 border-white"
                : "text-gray-400"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Routines
          </Link>

          <Link
            href="/debug"
            className={`text-2xl hover:text-gray-300 transition-colors ${
              pathname === "/debug"
                ? "text-white font-bold border-b-2 border-white"
                : "text-gray-400"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Backend/Localstorage
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
