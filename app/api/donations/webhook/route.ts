import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { causeId, userId } = paymentIntent.metadata;

      if (!causeId || !userId) {
        console.error("Missing metadata in payment intent");
        return NextResponse.json(
          { error: "Missing metadata" },
          { status: 400 }
        );
      }

      // Update cause's current amount
      await prisma.cause.update({
        where: { id: causeId },
        data: {
          currentAmount: {
            increment: paymentIntent.amount / 100, // Convert from cents
          },
        },
      });

      // Create donation record
      await prisma.donation.create({
        data: {
          amount: paymentIntent.amount / 100, // Convert from cents
          causeId,
          userId,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 