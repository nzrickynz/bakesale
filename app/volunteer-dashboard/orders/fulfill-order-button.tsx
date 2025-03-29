"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Order } from "@prisma/client";

interface FulfillOrderButtonProps {
  order: Order;
}

export function FulfillOrderButton({ order }: FulfillOrderButtonProps) {
  const [isFulfilled, setIsFulfilled] = useState(order.fulfillmentStatus === "FULFILLED");
  const [isLoading, setIsLoading] = useState(false);

  const handleFulfill = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${order.id}/fulfill`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to fulfill order");
      }

      setIsFulfilled(true);
    } catch (error) {
      console.error("Error fulfilling order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFulfilled) {
    return (
      <span className="text-sm text-green-600 font-medium flex items-center">
        <CheckCircle className="h-4 w-4 mr-2" />
        Completed
      </span>
    );
  }

  return (
    <Button
      onClick={handleFulfill}
      variant="ghost"
      size="sm"
      disabled={isLoading}
      className="text-green-600 hover:text-green-700 hover:bg-green-50"
    >
      <CheckCircle className="h-4 w-4 mr-2" />
      {isLoading ? "Fulfilling..." : "Fulfill"}
    </Button>
  );
} 