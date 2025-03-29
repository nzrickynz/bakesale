"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditListingFormProps {
  causeId: string;
  listingId: string;
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    stripePaymentLink: string;
  };
}

export function EditListingForm({ causeId, listingId, listing }: EditListingFormProps) {
  const [description, setDescription] = useState(listing.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stripePaymentLink = formData.get("stripePaymentLink") as string;

    if (description.length > 100) {
      setIsSubmitting(false);
      toast.error("Description cannot exceed 100 characters");
      return;
    }

    try {
      formData.append("causeId", causeId);
      formData.append("imageUrl", "/placeholder.svg?height=300&width=300");

      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
        headers: {
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update listing");
      }

      toast.success("Listing updated successfully");
      redirect(`/dashboard/causes/${causeId}`);
    } catch (err) {
      console.error("Failed to update listing:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter listing title"
          required
          defaultValue={listing.title}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <div className="relative">
          <Textarea
            id="description"
            name="description"
            placeholder="Enter listing description"
            required
            maxLength={100}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
          <div className={cn(
            "absolute bottom-2 right-2 text-xs",
            description.length > 100 ? "text-red-500" : "text-gray-500"
          )}>
            {description.length}/100
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter price"
          required
          defaultValue={listing.price}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="stripePaymentLink">Stripe Payment Link</Label>
        <Input
          id="stripePaymentLink"
          name="stripePaymentLink"
          type="url"
          placeholder="Enter Stripe payment link"
          required
          defaultValue={listing.stripePaymentLink}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting || description.length > 100}
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
} 