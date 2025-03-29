"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">Bake Sale</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/causes"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary"
              >
                Causes
              </Link>
              <Link
                href="/organizations"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary"
              >
                Organizations
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <span className="sr-only">Open user menu</span>
                    {session.user?.image ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={session.user.image}
                        alt={session.user.name || ""}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#E55937] flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {session.user?.name?.[0] || session.user?.email?.[0]}
                        </span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {session.user?.role === "VOLUNTEER" ? (
                    <DropdownMenuItem asChild>
                      <Link href="/volunteer-dashboard">Volunteer Dashboard</Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/org/dashboard">Organization Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/causes">Causes</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/organizations">Organizations</Link>
                </DropdownMenuItem>
                {session ? (
                  <>
                    {session.user?.role === "VOLUNTEER" ? (
                      <DropdownMenuItem asChild>
                        <Link href="/volunteer-dashboard">Volunteer Dashboard</Link>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/org/dashboard">Organization Dashboard</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/login">Sign in</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Get Started</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
} 