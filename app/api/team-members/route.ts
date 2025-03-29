import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, email, role, assignments, organizationId } = body;

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userOrganizations: {
          where: { role: "ORG_ADMIN" },
          include: { organization: true }
        }
      }
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify the user has admin access to the organization they're trying to add members to
    const hasAdminAccess = currentUser.userOrganizations.some(
      uo => uo.organizationId === organizationId
    );

    if (!hasAdminAccess) {
      return new NextResponse("Unauthorized - You can only add members to organizations you admin", { status: 403 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists, create a UserOrganization relationship
      if (role === "ORG_ADMIN") {
        // Verify the user has admin access to all organizations they're trying to assign
        const hasAccessToAllOrgs = assignments.every((orgId: string) =>
          currentUser.userOrganizations.some(uo => uo.organizationId === orgId)
        );

        if (!hasAccessToAllOrgs) {
          return new NextResponse("Unauthorized - You can only assign members to organizations you admin", { status: 403 });
        }

        await Promise.all(
          assignments.map((orgId: string) =>
            prisma.userOrganization.create({
              data: {
                userId: existingUser.id,
                organizationId: orgId,
                role: "ORG_ADMIN",
              },
            })
          )
        );
      } else {
        // For volunteers, verify they're being assigned to existing listings
        const listings = await prisma.listing.findMany({
          where: {
            id: { in: assignments },
            cause: {
              organizationId: organizationId
            }
          }
        });

        if (listings.length !== assignments.length) {
          return new NextResponse("Invalid listing assignments", { status: 400 });
        }

        // Update the listings to assign the volunteer
        await Promise.all(
          assignments.map((listingId: string) =>
            prisma.listing.update({
              where: { id: listingId },
              data: { volunteerId: existingUser.id }
            })
          )
        );
      }
    } else {
      // Create new user with hashed password
      const hashedPassword = await hash(Math.random().toString(36), 10);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: role,
        },
      });

      // Create relationships
      if (role === "ORG_ADMIN") {
        // Verify the user has admin access to all organizations they're trying to assign
        const hasAccessToAllOrgs = assignments.every((orgId: string) =>
          currentUser.userOrganizations.some(uo => uo.organizationId === orgId)
        );

        if (!hasAccessToAllOrgs) {
          return new NextResponse("Unauthorized - You can only assign members to organizations you admin", { status: 403 });
        }

        await Promise.all(
          assignments.map((orgId: string) =>
            prisma.userOrganization.create({
              data: {
                userId: newUser.id,
                organizationId: orgId,
                role: "ORG_ADMIN",
              },
            })
          )
        );
      } else {
        // For volunteers, verify they're being assigned to existing listings
        const listings = await prisma.listing.findMany({
          where: {
            id: { in: assignments },
            cause: {
              organizationId: organizationId
            }
          }
        });

        if (listings.length !== assignments.length) {
          return new NextResponse("Invalid listing assignments", { status: 400 });
        }

        // Update the listings to assign the volunteer
        await Promise.all(
          assignments.map((listingId: string) =>
            prisma.listing.update({
              where: { id: listingId },
              data: { volunteerId: newUser.id }
            })
          )
        );
      }
    }

    return NextResponse.json({ message: "Team member added successfully" });
  } catch (error) {
    console.error("Failed to add team member:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return new NextResponse("Organization ID is required", { status: 400 });
    }

    // Get all team members for the organization
    const teamMembers = await prisma.user.findMany({
      where: {
        OR: [
          {
            userOrganizations: {
              some: {
                organizationId,
              },
            },
          },
          {
            managedListings: {
              some: {
                cause: {
                  organizationId,
                },
              },
            },
          },
        ],
      },
      include: {
        userOrganizations: {
          where: {
            organizationId,
          },
          include: {
            organization: true,
          },
        },
        managedListings: {
          where: {
            cause: {
              organizationId,
            },
          },
          include: {
            cause: true,
          },
        },
      },
    });

    // Transform the data to match the TeamMember interface
    const transformedTeamMembers = teamMembers.map((member) => ({
      id: member.id,
      name: member.name || "",
      email: member.email,
      role: member.role,
      assignments: [
        ...member.userOrganizations.map((uo) => ({
          id: uo.organization.id,
          name: uo.organization.name,
          type: "organization" as const,
        })),
        ...member.managedListings.map((ml) => ({
          id: ml.id,
          name: `${ml.title} (${ml.cause.title})`,
          type: "listing" as const,
        })),
      ],
    }));

    return NextResponse.json(transformedTeamMembers);
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 