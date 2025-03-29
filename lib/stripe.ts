import Stripe from "stripe";
import { prisma } from "./prisma";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export async function createStripeAccount(organizationName: string, email: string) {
  try {
    const account = await stripe.accounts.create({
      type: "standard",
      business_profile: {
        name: organizationName,
        email,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    throw error;
  }
}

export async function createStripeAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return accountLink;
  } catch (error) {
    console.error("Error creating Stripe account link:", error);
    throw error;
  }
}

export async function createPaymentIntent(
  amount: number,
  currency: string,
  causeId: string,
  organizationId: string
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        causeId,
        organizationId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}

export async function transferFunds(
  amount: number,
  currency: string,
  destination: string,
  paymentIntentId: string
) {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      destination,
      transfer_group: paymentIntentId,
    });

    return transfer;
  } catch (error) {
    console.error("Error transferring funds:", error);
    throw error;
  }
}

export async function createCheckoutSession(listingId: string) {
  try {
    // Get the listing and its associated organization
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        cause: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    if (!listing.cause.organization.stripeAccountId) {
      throw new Error("Organization has not connected their Stripe account");
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: listing.title,
              description: listing.description || undefined,
            },
            unit_amount: Math.round(listing.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      metadata: {
        listingId,
        causeId: listing.causeId,
        organizationId: listing.cause.organization.id,
      },
      payment_intent_data: {
        application_fee_amount: Math.round(listing.price * 100 * 0.1), // 10% platform fee
      },
    }, {
      stripeAccount: listing.cause.organization.stripeAccountId,
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
} 