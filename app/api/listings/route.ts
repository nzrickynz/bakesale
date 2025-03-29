import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const imageUrl = formData.get("imageUrl") as string;
    const stripePaymentLink = formData.get("stripePaymentLink") as string;
    const causeId = formData.get("causeId") as string;

    if (!title || !description || !price || !stripePaymentLink || !causeId) {
      console.error("[LISTINGS_POST_MISSING_FIELDS]", {
        title: !!title,
        description: !!description,
        price: !!price,
        stripePaymentLink: !!stripePaymentLink,
        causeId: !!causeId,
      });
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price,
        imageUrl: imageUrl || "/placeholder.svg?height=300&width=300",
        causeId,
        volunteerId: user.id,
        stripePaymentLink: stripePaymentLink,
      },
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