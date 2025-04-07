"use client";

import { ListingForm } from "@/components/forms/ListingForm";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NewListingFormProps {
  causeId: string;
  userId: string;
}

export function NewListingForm({ causeId, userId }: NewListingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  return (
    <ListingForm 
      causeId={causeId}
      mode="create"
      isSubmitting={isSubmitting}
      onSubmit={async (data) => {
        setIsSubmitting(true);
        try {
          const response = await fetch("/api/listings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...data,
              price: parseFloat(data.price),
              causeId,
              volunteerId: userId,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to create listing");
          }

          toast.success("Listing created successfully");
          router.push(`/dashboard/organizations/${causeId.split('/')[0]}/causes/${causeId.split('/')[1]}`);
        } catch (error) {
          console.error("Failed to create listing:", error);
          toast.error("Failed to create listing");
        } finally {
          setIsSubmitting(false);
        }
      }}
    />
  );
} 