"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";

interface ListingFormProps {
  causeId: string;
  listingId?: string; // Optional - only present for edit mode
  listing?: {
    id: string;
    title: string;
    description: string;
    price: number;
    paymentLink: string | null;
    imageUrl: string | null;
  };
  mode: "create" | "edit";
}

export function ListingForm({ causeId, listingId, listing, mode }: ListingFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [description, setDescription] = useState(listing?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(listing?.imageUrl || null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${session?.supabaseAccessToken}`,
        },
      },
    }
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (500KB = 500 * 1024 bytes)
      if (file.size > 500 * 1024) {
        toast.error("Image size must be less than 500KB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      let imageUrl = listing?.imageUrl || null;
      
      // Upload new image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('publicimages')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('publicimages')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const response = await fetch(mode === "create" ? "/api/listings" : `/api/listings/${listingId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price,
          paymentLink,
          imageUrl,
          causeId,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `Failed to ${mode} listing`);
      }

      toast.success(`Listing ${mode === "create" ? "created" : "updated"} successfully`);
      router.push("/dashboard/causes");
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
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required={mode === "create"}
        />
        {imagePreview && (
          <div className="mt-2">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-32 h-32 object-cover rounded-md"
            />
          </div>
        )}
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