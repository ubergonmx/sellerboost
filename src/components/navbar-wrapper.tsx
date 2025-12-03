"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

export function NavbarWrapper() {
  const pathname = usePathname();
  const isAuthRoute =
    pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  if (isAuthRoute) {
    return null;
  }

  return <Navbar />;
}
