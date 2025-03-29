import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent, transferFunds } from "@/lib/stripe";

export async function POST(
  request: Request,
  { params }: { params: { causeId: string } }
) {
  try {
    const body = await request.json();
    const { amount, currency = "usd" } = body;

    // Get the cause and its organization
    const cause = await prisma.cause.findUnique({
      where: { id: params.causeId },
      include: {
        organization: true,
      },
    });

    if (!cause) {
      return NextResponse.json(
        { message: "Cause not found" },
        { status: 404 }
      );
    }

    if (!cause.organization?.stripeAccountId) {
      return NextResponse.json(
        { message: "Organization has not set up payments" },
        { status: 400 }
      );
    }

    if (cause.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "This cause is not currently accepting donations" },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      amount,
      currency,
      cause.id,
      cause.organization.id
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error processing donation:", error);
    return NextResponse.json(
      { message: "Error processing donation" },
      { status: 500 }
    );
  }
} 