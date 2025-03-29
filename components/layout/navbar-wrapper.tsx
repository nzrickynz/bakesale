"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

export function NavbarWrapper() {
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith("/dashboard") || 
                         pathname.startsWith("/volunteer-dashboard") || 
                         pathname.startsWith("/org/dashboard");

  if (isDashboardPage) {
    return null;
  }

  return <Navbar />;
} 