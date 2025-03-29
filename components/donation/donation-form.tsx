"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DonationFormProps {
  causeId: string;
  clientSecret: string;
}

export function DonationForm({ causeId, clientSecret }: DonationFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/causes/${causeId}`,
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />
      </div>
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full"
      >
        {isLoading ? "Processing..." : "Donate"}
      </Button>
    </form>
  );
} 