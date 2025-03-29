import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";

// Custom adapter that doesn't try to access organization relationships
const customAdapter: Adapter = {
  createUser: async (data) => {
    return null;
  },
  getUser: async (id) => {
    return null;
  },
  getUserByEmail: async (email) => {
    return null;
  },
  updateUser: async (data) => {
    return null;
  },
  deleteUser: async (userId) => {
    return null;
  },
  linkAccount: async (data) => {
    return null;
  },
  unlinkAccount: async (data) => {
    return null;
  },
  createSession: async (data) => {
    return null;
  },
  getSessionAndUser: async (sessionToken) => {
    return null;
  },
  updateSession: async (data) => {
    return null;
  },
  deleteSession: async (sessionToken) => {
    return null;
  },
  createVerificationToken: async (data) => {
    return null;
  },
  useVerificationToken: async (data) => {
    return null;
  },
};

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Allow all valid roles to login
        if (!["SUPER_ADMIN", "ORG_ADMIN", "VOLUNTEER"].includes(user.role)) {
          throw new Error("Invalid user role");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SUPER_ADMIN" | "ORG_ADMIN" | "VOLUNTEER";
      }
      return session;
    },
  },
}; 