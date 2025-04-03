import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrganizationService } from "@/lib/services/organization";
import { UserService } from "@/lib/services/user";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import prisma from "@/lib/prisma";

// Force deployment
export const dynamic = 'force-dynamic'

// Organization creation schema
const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  description: z.string().min(1, "Description is required"),
  logoUrl: z.string().url("Invalid logo URL").optional(),
  facebookUrl: z.string().url("Invalid Facebook URL").optional(),
  instagramUrl: z.string().url("Invalid Instagram URL").optional(),
  websiteUrl: z.string().url("Invalid website URL").optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const userService = new UserService();
    const user = await userService.findByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has super admin role
    if (user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Only super admins can create organizations" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = createOrganizationSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.errors },
        { status: 400 }
      );
    }

    // Check for duplicate organization name
    const organizationService = new OrganizationService();
    const existingOrg = await organizationService.findByName(validatedData.data.name);
    if (existingOrg) {
      return NextResponse.json(
        { error: "An organization with this name already exists" },
        { status: 409 }
      );
    }

    // Create organization
    const organization = await organizationService.create({
      ...validatedData.data,
      admin: {
        connect: {
          id: user.id
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error("[ORGANIZATIONS] Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userOrganizations: {
          include: {
            organization: {
              include: {
                causes: {
                  include: {
                    listings: {
                      include: {
                        volunteer: {
                          select: {
                            id: true,
                            name: true,
                            email: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      organizations: user.userOrganizations.map(org => ({
        id: org.organization.id,
        name: org.organization.name,
        role: org.role,
        causes: org.organization.causes,
      })),
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { message: "Error fetching organizations" },
      { status: 500 }
    );
  }
} 