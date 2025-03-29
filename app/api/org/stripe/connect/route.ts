import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createStripeAccount, createStripeAccountLink } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: true,
      },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Create Stripe Connect account
    const stripeAccount = await createStripeAccount(
      user.organization.name,
      session.user.email
    );

    // Create account link for onboarding
    const accountLink = await createStripeAccountLink(
      stripeAccount.id,
      `${process.env.NEXT_PUBLIC_APP_URL}/org/settings?stripe=refresh`,
      `${process.env.NEXT_PUBLIC_APP_URL}/org/settings?stripe=success`
    );

    // Update organization with Stripe account ID
    await prisma.organization.update({
      where: { id: user.organization.id },
      data: {
        stripeAccountId: stripeAccount.id,
      },
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error setting up Stripe Connect:", error);
    return NextResponse.json(
      { message: "Error setting up Stripe Connect" },
      { status: 500 }
    );
  }
} 