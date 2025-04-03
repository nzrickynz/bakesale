import NextAuth from 'next-auth'
import { Database } from './supabase'
import "next-auth";
import { UserRole } from "@prisma/client";

type User = Database['public']['Tables']['users']['Row']

declare module 'next-auth' {
  interface User {
    role: User['role']
    id: string;
    email: string;
    name: string | null;
    supabaseAccessToken?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: UserRole;
      image?: string | null;
    }
    supabaseAccessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: User['role']
  }
} 