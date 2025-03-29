import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return new NextResponse("No signature", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new NextResponse("Invalid signature", { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get the listing ID from the metadata
        const listingId = session.metadata?.listingId;
        if (!listingId) {
          throw new Error("No listing ID in session metadata");
        }

        // Create the order
        await prisma.order.create({
          data: {
            listingId,
            buyerEmail: session.customer_details?.email || "",
            buyerName: session.customer_details?.name || "",
            status: "ORDERED",
          },
        });

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update the order status if needed
        // This is optional since we're handling it in checkout.session.completed
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Handle failed payment
        // You might want to update the order status or notify the user
        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new NextResponse("Webhook error", { status: 500 });
  }
} 