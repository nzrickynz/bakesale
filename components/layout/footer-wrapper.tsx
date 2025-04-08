"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export function FooterWrapper() {
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith("/dashboard") || 
                         pathname.startsWith("/volunteer-dashboard") || 
                         pathname.startsWith("/org/dashboard");

  if (isDashboardPage) {
    return null;
  }

  return <Footer />;
} 