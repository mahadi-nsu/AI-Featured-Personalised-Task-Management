import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrainCircuit, ListTodo, ScrollText, Briefcase } from "lucide-react";

export function NavLinks() {
  const pathname = usePathname();

  const links = [
    {
      name: "AI Testing",
      href: "/ai-testing",
      icon: BrainCircuit,
    },
    {
      name: "Todo",
      href: "/todo",
      icon: ListTodo,
    },
    {
      name: "Routines",
      href: "/routines",
      icon: ScrollText,
    },
    {
      name: "Job Hunt",
      href: "/job-hunt",
      icon: Briefcase,
    },
  ];

  return (
    <nav className="grid gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
              pathname === link.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
