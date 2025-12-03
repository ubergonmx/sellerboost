"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname?.startsWith("/login") || pathname?.startsWith("/signup");
  const isErrorRoute = pathname?.startsWith("/error");

  return (
    <>
      {!isAuthRoute && !isErrorRoute && <Navbar />}
      {children}
    </>
  );
}
