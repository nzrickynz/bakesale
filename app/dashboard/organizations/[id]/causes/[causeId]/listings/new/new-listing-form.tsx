"use client";

import { ListingForm } from "@/components/forms/ListingForm";

interface NewListingFormProps {
  causeId: string;
  userId: string;
}

export function NewListingForm({ causeId, userId }: NewListingFormProps) {
  return (
    <ListingForm 
      causeId={causeId}
      mode="create"
    />
  );
} 