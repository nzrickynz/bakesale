import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { transferFunds } from "@/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { message: "Missing stripe signature or webhook secret" },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as any;
        const { causeId, organizationId } = paymentIntent.metadata;

        // Get the cause and organization
        const cause = await prisma.cause.findUnique({
          where: { id: causeId },
          include: {
            organization: true,
          },
        });

        if (!cause || !cause.organization) {
          throw new Error("Cause or organization not found");
        }

        // Transfer funds to organization's Stripe account
        await transferFunds(
          paymentIntent.amount / 100, // Convert from cents
          paymentIntent.currency,
          cause.organization.stripeAccountId,
          paymentIntent.id
        );

        // Update cause's current amount
        await prisma.cause.update({
          where: { id: causeId },
          data: {
            currentAmount: {
              increment: paymentIntent.amount / 100, // Convert from cents
            },
          },
        });

        break;
      }

      case "payment_intent.payment_failed": {
        // Handle failed payment
        console.log("Payment failed:", event.data.object);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
} 