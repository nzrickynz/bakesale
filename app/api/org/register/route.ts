import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  organizationName: z.string().min(1),
  organizationDescription: z.string().min(1),
});

type RegisterRequestBody = {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  organizationDescription: string;
};

export async function POST(request: Request) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { name, email, password, organizationName, organizationDescription } = body;

    // Validate required fields
    if (!name || !email || !password || !organizationName || !organizationDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user and organization in a transaction
    const registrationResult = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: "ORG_ADMIN",
        },
      });

      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          description: organizationDescription,
          adminId: user.id,
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
        user: {
          id: registrationResult.user.id,
          name: registrationResult.user.name,
          email: registrationResult.user.email,
          role: registrationResult.user.role,
        },
        organization: {
          id: registrationResult.organization.id,
          name: registrationResult.organization.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Email or organization name already taken" },
          { status: 409 }
        );
      }
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 