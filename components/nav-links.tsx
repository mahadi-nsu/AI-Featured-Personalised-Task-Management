"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavLinks() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
    router.push("/auth/login");
  };

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              Task Management
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className={`hover:text-primary transition-colors ${
                pathname === "/"
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-muted-foreground"
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
              className={`hover:text-primary transition-colors ${
                pathname === "/analytics"
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Analytics
            </Link>

            {/* TODO: Will implement routines later */}

            {/* <Link
              href="/routines"
              className={`hover:text-primary transition-colors ${
                pathname === "/routines"
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Routines
            </Link> */}

            <Link
              href="/job-hunt"
              className={`hover:text-primary transition-colors ${
                pathname === "/job-hunt"
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Job-hunt
            </Link>

            <Link
              href="/learn"
              className={`hover:text-primary transition-colors ${
                pathname === "/learn"
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Read Articles
            </Link>

            {/* <Link
              href="/debug"
              className={`hover:text-primary transition-colors ${
                pathname === "/debug"
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Backend/Localstorage
            </Link> */}
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-none shadow-lg"
                  >
                    <User className="h-8 w-8" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
            )}
          </div>
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
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`fixed inset-0 bg-background/95 z-50 md:hidden transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <Link
            href="/"
            className={`text-2xl hover:text-primary transition-colors ${
              pathname === "/"
                ? "text-primary font-bold border-b-2 border-primary"
                : "text-muted-foreground"
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
            className={`text-2xl hover:text-primary transition-colors ${
              pathname === "/analytics"
                ? "text-primary font-bold border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Analytics
          </Link>

          {/* TODO: Will implement routines later */}

          {/* <Link
            href="/routines"
            className={`text-2xl hover:text-primary transition-colors ${
              pathname === "/routines"
                ? "text-primary font-bold border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Routines
          </Link> */}

          <Link
            href="/job-hunt"
            className={`text-2xl hover:text-primary transition-colors ${
              pathname === "/job-hunt"
                ? "text-primary font-bold border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Job-hunt
          </Link>

          <Link
            href="/learn"
            className={`text-2xl hover:text-primary transition-colors ${
              pathname === "/learn"
                ? "text-primary font-bold border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Read Articles
          </Link>

          {/* <Link
            href="/debug"
            className={`text-2xl hover:text-primary transition-colors ${
              pathname === "/debug"
                ? "text-primary font-bold border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Backend/Localstorage
          </Link> */}
          <ThemeToggle />

          {user ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-foreground">{user.email}</p>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
              >
                Log out
              </Button>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
