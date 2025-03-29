import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const registerSchema = z.object({
  // User account details
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["ORG_ADMIN"]),
  
  // Organization details
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  organizationDescription: z.string().min(10, "Description must be at least 10 characters"),
  websiteUrl: z.string().url("Invalid website URL").optional(),
  facebookUrl: z.string().url("Invalid Facebook URL").optional(),
  instagramUrl: z.string().url("Invalid Instagram URL").optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12);

    // Create user and organization in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          passwordHash: hashedPassword,
          role: validatedData.role as UserRole,
        },
      });

      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: validatedData.organizationName,
          description: validatedData.organizationDescription,
          websiteUrl: validatedData.websiteUrl,
          facebookUrl: validatedData.facebookUrl,
          instagramUrl: validatedData.instagramUrl,
          adminId: user.id
        },
      });

      // Create user-organization relationship
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "ORG_ADMIN",
        },
      });

      return { user, organization };
    });

    return NextResponse.json(
      {
        message: "Organization registered successfully",
        organization: result.organization,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Error registering organization" },
      { status: 500 }
    );
  }
} 