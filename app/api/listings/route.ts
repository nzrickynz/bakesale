import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { ListingService } from "@/lib/services/listing";
import { sendVolunteerAssignmentEmail } from "@/lib/email";

// Validation schema for listing creation
const listingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  imageUrl: z.string().optional(),
  paymentLink: z.string().url().optional(),
  causeId: z.string(),
  volunteerId: z.string(),
});

const listingService = new ListingService();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const result = listingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      );
    }

    const { title, description, price, imageUrl, paymentLink, causeId, volunteerId } = result.data;

    // Get cause and organization details for the email
    const cause = await prisma.cause.findUnique({
      where: { id: causeId },
      include: {
        organization: true,
      },
    });

    if (!cause) {
      return new NextResponse("Cause not found", { status: 404 });
    }

    // Get volunteer details
    const volunteer = await prisma.user.findUnique({
      where: { id: volunteerId },
    });

    if (!volunteer) {
      return new NextResponse("Volunteer not found", { status: 404 });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price,
        imageUrl: imageUrl || "/placeholder.svg?height=300&width=300",
        causeId,
        volunteerId,
        paymentLink,
      },
    });

    // Send email notification to the volunteer
    await sendVolunteerAssignmentEmail({
      to: volunteer.email,
      listingTitle: title,
      causeTitle: cause.title,
      organizationName: cause.organization.name,
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("[LISTINGS_POST_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error", 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const causeId = searchParams.get("causeId");

    const listings = await listingService.findMany({
      where: causeId ? { causeId } : undefined,
      include: {
        cause: true,
        volunteer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("[LISTINGS_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error", 
      { status: 500 }
    );
  }
} 