import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Cause, Donation } from "@prisma/client";

type CauseWithDonations = Cause & {
  donations: Donation[];
};

type CauseWithAmount = CauseWithDonations & {
  currentAmount: number;
};

// Validation schema for cause creation
const causeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  targetGoal: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  organizationId: z.string(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    // If organizationId is provided, fetch causes for that organization
    if (organizationId) {
      const causes = await prisma.cause.findMany({
        where: {
          organizationId,
        },
        include: {
          donations: true,
        },
      });

      const causesWithAmounts = causes.map((cause: CauseWithDonations) => ({
        ...cause,
        currentAmount: cause.donations.reduce((sum, donation) => sum + donation.amount, 0),
      }));

      return NextResponse.json(causesWithAmounts);
    }

    // Otherwise, fetch all causes (with proper authorization)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const causes = await prisma.cause.findMany({
      include: {
        donations: true,
      },
    });

    const causesWithAmounts = causes.map((cause: CauseWithDonations) => ({
      ...cause,
      currentAmount: cause.donations.reduce((sum, donation) => sum + donation.amount, 0),
    }));

    return NextResponse.json(causesWithAmounts);
  } catch (error) {
    console.error("[CAUSES] Error fetching causes:", error);
    return NextResponse.json(
      { error: "Failed to fetch causes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = causeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      );
    }

    const { title, description, targetGoal, startDate, endDate, organizationId } = result.data;

    // Check if user has permission to create cause for this organization
    const userOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
    });

    if (!userOrg || !["ORG_ADMIN", "SUPER_ADMIN"].includes(userOrg.role)) {
      return NextResponse.json(
        { error: "Unauthorized to create cause for this organization" },
        { status: 403 }
      );
    }

    const cause = await prisma.cause.create({
      data: {
        title,
        description,
        targetGoal,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        organizationId,
      },
    });

    return NextResponse.json(cause, { status: 201 });
  } catch (error) {
    console.error("[CAUSES] Error creating cause:", error);
    return NextResponse.json(
      { error: "Failed to create cause" },
      { status: 500 }
    );
  }
} 