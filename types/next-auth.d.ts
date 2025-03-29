import NextAuth from 'next-auth'
import { Database } from './supabase'

type User = Database['public']['Tables']['users']['Row']

declare module 'next-auth' {
  interface User {
    role: User['role']
  }

  interface Session {
    user: User & {
      role: User['role']
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: User['role']
  }
} 