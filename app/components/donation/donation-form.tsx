"use client";

import { useState, FormEvent } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
        toast.error(error.message || "Something went wrong");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Donation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              required
            />
          </div>
          <PaymentElement />
          <Button type="submit" disabled={!stripe || isLoading}>
            {isLoading ? "Processing..." : "Donate"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 