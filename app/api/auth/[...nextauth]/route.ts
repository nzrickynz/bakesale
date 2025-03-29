import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@/lib/auth-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { signIn } from '@/lib/supabase-auth'
import { User } from 'next-auth'

const handler = NextAuth({
  adapter: SupabaseAdapter(),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          const data = await signIn(credentials.email, credentials.password)
          if (!data.user) return null

          // Convert Supabase user to NextAuth user
          const user: User = {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || null,
            role: data.user.user_metadata?.role || 'user',
          }
          return user
        } catch (error) {
          throw new Error('Invalid credentials')
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
      }
      return session
    },
  },
})

export { handler as GET, handler as POST } 