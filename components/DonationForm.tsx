"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DonationFormProps {
  causeId: string;
  onSuccess?: () => void;
}

function DonationFormContent({ causeId, onSuccess }: DonationFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch(`/api/causes/${causeId}/donate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process donation");
      }

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/causes/${causeId}?payment=success`,
        },
      });

      if (paymentError) {
        throw new Error(paymentError.message || "Payment failed");
      }

      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Donation Amount ($)
        </label>
        <input
          type="number"
          id="amount"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Processing..." : "Donate Now"}
      </button>
    </form>
  );
}

export default function DonationForm(props: DonationFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <DonationFormContent {...props} />
    </Elements>
  );
} 