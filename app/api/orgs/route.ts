import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  website: z.string().url("Invalid website URL").optional(),
});

export async function GET() {
  return NextResponse.json({ message: "GET /api/orgs working" });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("API Route - Session:", session);

    if (!session?.user?.role || session.user.role !== "SUPER_ADMIN") {
      console.log("API Route - Not a Super Admin");
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // For Super Admins, we'll create the organization without a specific admin
    const body = await request.json();
    const validatedData = createOrganizationSchema.parse(body);

    // First find the admin user by email
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser) {
      return NextResponse.json(
        { message: "Admin user not found" },
        { status: 404 }
      );
    }

    // Create the organization with the admin connection
    const organization = await prisma.organization.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        websiteUrl: validatedData.website,
        admin: {
          connect: { id: adminUser.id }
        }
      },
    });

    // Create the user-organization relationship
    await prisma.userOrganization.create({
      data: {
        userId: adminUser.id,
        organizationId: organization.id,
        role: "ORG_ADMIN",
      },
    });

    return NextResponse.json({ 
      message: "Organization created successfully",
      organization 
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating organization:", error);
    return NextResponse.json(
      { message: "Error creating organization" },
      { status: 500 }
    );
  }
} 