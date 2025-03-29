import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaClient, Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      facebookURL,
      instagramURL,
      websiteURL,
      email,
      password,
    } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user and organization in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role: "ORG_ADMIN",
          name: name, // Use organization name as user name
        },
      });

      // Create organization
      const organization = await tx.organization.create({
        data: {
          name,
          description,
          facebookUrl: facebookURL,
          instagramUrl: instagramURL,
          websiteUrl: websiteURL,
          adminId: user.id,
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Error registering organization" },
      { status: 500 }
    );
  }
} 