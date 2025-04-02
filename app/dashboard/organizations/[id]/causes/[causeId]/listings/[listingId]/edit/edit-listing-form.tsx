"use client";

import { ListingForm } from "@/components/forms/ListingForm";

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
  return (
    <ListingForm 
      causeId={causeId}
      listingId={listingId}
      listing={listing}
      mode="edit"
    />
  );
} 