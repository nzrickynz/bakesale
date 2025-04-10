import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

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
                    organization: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    listings: {
                      select: {
                        price: true,
                        orders: {
                          select: {
                            id: true,
                            buyerEmail: true,
                            fulfillmentStatus: true,
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

    // Get all active causes
    const activeCauses = await prisma.cause.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        listings: {
          select: {
            price: true,
            orders: {
              select: {
                id: true,
                buyerEmail: true,
                fulfillmentStatus: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate current amount for each cause
    const causesWithAmounts = activeCauses.map(cause => ({
      ...cause,
      currentAmount: cause.listings.reduce((total, listing) => {
        return total + (listing.price * listing.orders.length);
      }, 0),
    }));

    return NextResponse.json({
      organizations: user.userOrganizations.map(org => ({
        id: org.organization.id,
        name: org.organization.name,
        role: org.role,
        causes: org.organization.causes,
      })),
      causes: causesWithAmounts,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { message: "Error fetching dashboard data" },
      { status: 500 }
    );
  }
} 