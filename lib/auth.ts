import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
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
        console.log("[AUTH] Starting authorization process");
        console.log("[AUTH] Email provided:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        console.log("[AUTH] User found:", user ? "yes" : "no");
        if (user) {
          console.log("[AUTH] User role:", user.role);
          console.log("[AUTH] Password hash length:", user.passwordHash?.length);
        }

        if (!user) {
          console.log("[AUTH] User not found");
          throw new Error("Invalid email or password");
        }

        console.log("[AUTH] Attempting password comparison");
        console.log("[AUTH] Input password length:", credentials.password.length);
        console.log("[AUTH] Stored hash:", user.passwordHash);
        
        let isPasswordValid = false;
        try {
          isPasswordValid = await compare(credentials.password, user.passwordHash);
          console.log("[AUTH] Password valid:", isPasswordValid);
        } catch (error) {
          console.error("[AUTH] Password comparison error:", error);
          throw new Error("Error comparing passwords");
        }

        if (!isPasswordValid) {
          console.log("[AUTH] Invalid password");
          throw new Error("Invalid email or password");
        }

        // Allow all valid roles to login
        if (!["SUPER_ADMIN", "ORG_ADMIN", "VOLUNTEER"].includes(user.role)) {
          console.log("[AUTH] Invalid role:", user.role);
          throw new Error("Invalid user role");
        }

        console.log("[AUTH] Login successful for user:", user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
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
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SUPER_ADMIN" | "ORG_ADMIN" | "VOLUNTEER";
        session.user.name = token.name as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

export async function getUserRole() {
  const session = await getServerSession(authOptions);
  return session?.user?.role as UserRole | undefined;
}

export async function requireRole(requiredRole: UserRole) {
  const userRole = await getUserRole();
  if (!userRole || userRole !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
}

export async function requireAnyRole(requiredRoles: UserRole[]) {
  const userRole = await getUserRole();
  if (!userRole || !requiredRoles.includes(userRole)) {
    throw new Error(`Access denied. Required roles: ${requiredRoles.join(", ")}`);
  }
}

export async function requireOrganizationAccess(organizationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      userOrganizations: {
        where: { organizationId },
      },
    },
  });

  if (!user || user.userOrganizations.length === 0) {
    throw new Error("No access to this organization");
  }

  return user.userOrganizations[0].role;
}

export async function requireSuperAdmin() {
  const userRole = await getUserRole();
  if (!userRole || userRole !== UserRole.SUPER_ADMIN) {
    throw new Error("Access denied. Super admin role required.");
  }
}

export async function requireApiAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }
  return session.user;
}

export async function requireApiRole(requiredRole: UserRole) {
  const user = await requireApiAuth();
  if (user.role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
  return user;
}

export async function requireApiOrganizationAccess(organizationId: string) {
  const user = await requireApiAuth();
  const userOrg = await prisma.userOrganization.findFirst({
    where: {
      userId: user.id,
      organizationId,
    },
  });

  if (!userOrg) {
    throw new Error("No access to this organization");
  }

  return userOrg.role;
} 