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

export async function GET(request: Request) {
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

    const organizationService = new OrganizationService();
    
    // First get the organizations
    const organizations = await organizationService.findMany({
      where: {
        OR: [
          { adminId: user.id },
          {
            userOrganizations: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
    });

    // Then get the user roles for these organizations
    const orgIds = organizations?.map(org => org.id) ?? [];
    const userOrgs = await prisma.userOrganization.findMany({
      where: {
        userId: user.id,
        organizationId: {
          in: orgIds,
        },
      },
      select: {
        organizationId: true,
        role: true,
      },
    });

    // Create a map of organization ID to role
    const orgRoleMap = new Map(userOrgs?.map(uo => [uo.organizationId, uo.role]) ?? []);

    // Transform the response to match the expected format
    const transformedOrganizations = organizations?.map(org => ({
      id: org.id,
      name: org.name,
      description: org.description,
      logoUrl: org.logoUrl,
      facebookUrl: org.facebookUrl,
      instagramUrl: org.instagramUrl,
      websiteUrl: org.websiteUrl,
      role: org.adminId === user.id ? UserRole.ORG_ADMIN : orgRoleMap.get(org.id),
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    })) ?? [];

    const response = NextResponse.json({
      success: true,
      data: transformedOrganizations,
    });

    // Set cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error("[ORGANIZATIONS] Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
} 