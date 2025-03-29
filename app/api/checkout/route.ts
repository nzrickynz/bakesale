import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { listingId } = await req.json();

    if (!listingId) {
      return new NextResponse("Listing ID is required", { status: 400 });
    }

    const session = await createCheckoutSession(listingId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
} 