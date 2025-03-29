import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: "SUPER_ADMIN" | "ORG_ADMIN" | "VOLUNTEER";
  }

  interface Session {
    user: User & {
      role: "SUPER_ADMIN" | "ORG_ADMIN" | "VOLUNTEER";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "SUPER_ADMIN" | "ORG_ADMIN" | "VOLUNTEER";
  }
} 