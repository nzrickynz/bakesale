import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const imageUrl = formData.get("imageUrl") as string;
    const paymentLink = formData.get("paymentLink") as string;

    // Get the user's organization through UserOrganization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!userOrg?.organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Get the listing and verify it belongs to the organization
    const listing = await prisma.listing.findFirst({
      where: {
        id: params.listingId,
        cause: {
          organizationId: userOrg.organization.id,
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 }
      );
    }

    // Update the listing
    const updatedListing = await prisma.listing.update({
      where: { id: params.listingId },
      data: {
        title,
        description,
        price,
        imageUrl,
        paymentLink,
      },
    });

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { message: "Error updating listing" },
      { status: 500 }
    );
  }
} 