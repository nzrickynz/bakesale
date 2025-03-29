"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { DonationForm } from "@/components/donation/donation-form";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DonationSectionProps {
  causeId: string;
  clientSecret: string;
}

export function DonationSection({ causeId, clientSecret }: DonationSectionProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <DonationForm causeId={causeId} clientSecret={clientSecret} />
    </Elements>
  );
} 