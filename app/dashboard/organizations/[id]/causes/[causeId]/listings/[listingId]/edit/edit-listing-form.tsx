"use client";

import { ListingForm } from "@/components/forms/ListingForm";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditListingFormProps {
  causeId: string;
  listingId: string;
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    paymentLink: string | null;
    imageUrl: string | null;
  };
}

export function EditListingForm({ causeId, listingId, listing }: EditListingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  return (
    <ListingForm 
      causeId={causeId}
      listingId={listingId}
      listing={listing}
      mode="edit"
      isSubmitting={isSubmitting}
      onSubmit={async (data) => {
        setIsSubmitting(true);
        try {
          const response = await fetch(`/api/listings/${listingId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...data,
              price: parseFloat(data.price),
              causeId,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update listing");
          }

          toast.success("Listing updated successfully");
          router.push(`/dashboard/organizations/${causeId.split('/')[0]}/causes/${causeId.split('/')[1]}`);
        } catch (error) {
          console.error("Failed to update listing:", error);
          toast.error("Failed to update listing");
        } finally {
          setIsSubmitting(false);
        }
      }}
    />
  );
} 