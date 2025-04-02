"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Heart,
  Settings,
  PlusCircle,
  BarChart,
  ShoppingCart,
  Package,
} from "lucide-react";
import { useSession } from "next-auth/react";

const items = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: Home,
    roles: ["ORG_ADMIN"],
  },
  {
    title: "Organizations",
    href: "/dashboard/organizations",
    icon: Users,
    roles: ["ORG_ADMIN"],
  },
  {
    title: "Causes",
    href: "/dashboard/causes",
    icon: Heart,
    roles: ["ORG_ADMIN"],
  },
  {
    title: "Listings",
    href: "/dashboard/listings",
    icon: Package,
    roles: ["ORG_ADMIN"],
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    roles: ["ORG_ADMIN"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["ORG_ADMIN"],
  },
];

const volunteerItems = [
  {
    title: "My Listings",
    href: "/volunteer-dashboard",
    icon: Package,
  },
  {
    title: "All Orders",
    href: "/volunteer-dashboard/orders",
    icon: ShoppingCart,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isVolunteer = session?.user?.role === "VOLUNTEER";
  const itemsToShow = isVolunteer ? volunteerItems : items;

  return (
    <nav className="grid items-start gap-2 p-4">
      {!isVolunteer && (
        <Link
          href="/dashboard/organizations/new"
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100",
            pathname === "/dashboard/organizations/new" && "bg-gray-100"
          )}
        >
          <PlusCircle className="mr-2 h-4 w-4 text-gray-600" />
          <span>New Organization</span>
        </Link>
      )}
      {itemsToShow.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100",
              pathname === item.href && "bg-gray-100"
            )}
          >
            <Icon className="mr-2 h-4 w-4 text-gray-600" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
} 