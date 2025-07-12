"use client";

import { usePathname } from "next/navigation";
import { NavLinks } from "./nav-links";

export function ConditionalNav() {
  const pathname = usePathname();
  const noNavRoutes = ["/auth/login"];

  if (noNavRoutes.includes(pathname)) {
    return null;
  }

  return <NavLinks />;
}
