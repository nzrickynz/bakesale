import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Cause, Order } from "@prisma/client";
import { CauseService } from "@/lib/services/cause";
import { UserService } from "@/lib/services/user";

const causeService = new CauseService();
const userService = new UserService();

// Validation schema for cause creation
const causeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  targetGoal: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  organizationId: z.string(),
});

interface CauseWithAmount extends Cause {
  currentAmount: number;
  organization: {
    id: string;
    name: string;
  };
  listings: {
    price: number;
    orders: {
      id: string;
      buyerEmail: string;
      fulfillmentStatus: string;
    }[];
  }[];
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

    const causes = await prisma.cause.findMany({
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
    }) as CauseWithAmount[];

    const causesWithAmounts = causes.map(cause => ({
      ...cause,
      currentAmount: cause.listings.reduce((total: number, listing) => {
        return total + (listing.price * listing.orders.length);
      }, 0),
    }));

    return NextResponse.json({
      causes: causesWithAmounts,
    });
  } catch (error) {
    console.error("Error fetching causes:", error);
    return NextResponse.json(
      { message: "Error fetching causes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await userService.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = causeSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.errors },
        { status: 400 }
      );
    }

    // Check if user has access to the organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: validatedData.data.organizationId,
      },
    });

    if (!userOrg) {
      return NextResponse.json(
        { error: "You don't have access to this organization" },
        { status: 403 }
      );
    }

    const cause = await causeService.create({
      data: {
        ...validatedData.data,
        organization: {
          connect: {
            id: validatedData.data.organizationId,
          },
        },
      },
    });

    return NextResponse.json(cause);
  } catch (error) {
    console.error("Error creating cause:", error);
    return NextResponse.json(
      { error: "Failed to create cause" },
      { status: 500 }
    );
  }
} 