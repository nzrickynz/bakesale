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
              <img
                src="https://ypogpkbzhgvdenmxnamt.supabase.co/storage/v1/object/public/publicimages//orange.png"
                alt="Bake Sale"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-8 mr-6">
              <Link
                href="/causes"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-800 hover:text-orange-500"
              >
                Causes
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-800 hover:text-orange-500"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-800 hover:text-orange-500"
              >
                Contact
              </Link>
            </div>
            
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
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  {session.user?.role === "VOLUNTEER" ? (
                    <DropdownMenuItem asChild>
                      <Link href="/volunteer-dashboard" className="text-gray-800 hover:text-orange-500">Volunteer Dashboard</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="text-gray-800 hover:text-orange-500">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-gray-800 hover:text-orange-500"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login" className="text-gray-800 hover:text-orange-500">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/register" className="text-gray-800 hover:text-orange-500">
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
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem asChild>
                  <Link href="/causes" className="text-gray-800 hover:text-orange-500">Causes</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about" className="text-gray-800 hover:text-orange-500">About</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact" className="text-gray-800 hover:text-orange-500">Contact</Link>
                </DropdownMenuItem>
                {session ? (
                  <>
                    {session.user?.role === "VOLUNTEER" ? (
                      <DropdownMenuItem asChild>
                        <Link href="/volunteer-dashboard" className="text-gray-800 hover:text-orange-500">Volunteer Dashboard</Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="text-gray-800 hover:text-orange-500">Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-gray-800 hover:text-orange-500"
                    >
                      Sign out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="text-gray-800 hover:text-orange-500">Sign in</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" className="text-gray-800 hover:text-orange-500">Get Started</Link>
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