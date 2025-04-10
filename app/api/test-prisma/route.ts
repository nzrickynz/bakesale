import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // First, get the user with basic info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Then get the user's listings
    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { volunteerId: user.id },
          {
            cause: {
              organization: {
                userOrganizations: {
                  some: {
                    userId: user.id,
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        cause: {
          include: {
            organization: true,
          },
        },
        orders: true,
      },
    });

    return NextResponse.json({
      user,
      listings,
      message: "Successfully retrieved user and listings data",
    });
  } catch (error) {
    console.error("[TEST_PRISMA_ERROR]", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

