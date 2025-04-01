import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Cause } from "@prisma/client";
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {
      status: "ACTIVE",
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    const causes = await causeService.findMany({
      where,
      include: {
        listings: {
          include: {
            volunteer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(causes);
  } catch (error) {
    console.error("Error fetching causes:", error);
    return NextResponse.json(
      { error: "Failed to fetch causes" },
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

    const userOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: user.id,
        },
      },
    });

    if (!userOrg) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const cause = await causeService.create({
      ...body,
      organizationId: userOrg.organizationId,
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