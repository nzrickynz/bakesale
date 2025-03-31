"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ListingFormProps {
  causeId: string;
  listingId?: string; // Optional - only present for edit mode
  listing?: {
    id: string;
    title: string;
    description: string;
    price: number;
    paymentLink: string | null;
  };
  mode: "create" | "edit";
}

export function ListingForm({ causeId, listingId, listing, mode }: ListingFormProps) {
  const router = useRouter();
  const [description, setDescription] = useState(listing?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const paymentLink = formData.get("paymentLink") as string || null;

    if (description.length > 100) {
      setIsSubmitting(false);
      toast.error("Description cannot exceed 100 characters");
      return;
    }

    try {
      formData.append("causeId", causeId);
      formData.append("imageUrl", "/placeholder.svg?height=300&width=300");

      const url = mode === "create" 
        ? "/api/listings"
        : `/api/listings/${listingId}`;
      
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
        headers: {},
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `Failed to ${mode} listing`);
      }

      toast.success(`Listing ${mode === "create" ? "created" : "updated"} successfully`);
      router.push(`/dashboard/causes/${causeId}`);
    } catch (err) {
      console.error(`Failed to ${mode} listing:`, err);
      toast.error(err instanceof Error ? err.message : `Failed to ${mode} listing`);
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
          defaultValue={listing?.title}
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
          defaultValue={listing?.price}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="paymentLink">Payment Link</Label>
        <Input
          id="paymentLink"
          name="paymentLink"
          type="url"
          placeholder="Enter payment link"
          defaultValue={listing?.paymentLink || ""}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting || description.length > 100}
      >
        {isSubmitting 
          ? mode === "create" ? "Creating..." : "Saving..." 
          : mode === "create" ? "Create Listing" : "Save Changes"
        }
      </Button>
    </form>
  );
} 