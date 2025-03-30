import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          throw new Error('Email and password are required')
        }

        try {
          console.log("[AUTH] Attempting to find user:", credentials.email);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.log("[AUTH] User not found");
            throw new Error('Invalid credentials')
          }

          console.log("[AUTH] User found, comparing passwords");
          const isValid = await compare(credentials.password, user.passwordHash)
          if (!isValid) {
            console.log("[AUTH] Invalid password");
            throw new Error('Invalid credentials')
          }

          console.log("[AUTH] Login successful for user:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("[AUTH] Authorization error:", error);
          // Don't expose database errors to the client
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
    signIn: '/login',
    error: '/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
})

export { handler as GET, handler as POST } 