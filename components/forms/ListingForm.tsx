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
import { useForm } from 'react-hook-form';

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
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );

  const { register, handleSubmit } = useForm();

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

  const handleSubmitForm = async (data: any) => {
    setIsSubmitting(true);
    const { title, description, price, paymentLink } = data;

    if (description.length > 100) {
      setIsSubmitting(false);
      toast.error("Description cannot exceed 100 characters");
      return;
    }

    try {
      let imageUrl = listing?.imageUrl || null;
      
      // Upload new image if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await uploadResponse.json();
        imageUrl = url;
      }

      // Convert price to number
      const priceNumber = parseFloat(price);
      if (isNaN(priceNumber)) {
        throw new Error("Price must be a valid number");
      }

      const response = await fetch(mode === "create" ? "/api/listings" : `/api/listings/${listingId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price: priceNumber,
          paymentLink: paymentLink || null,
          imageUrl,
          causeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${mode} listing`);
      }

      toast.success(`Listing ${mode === "create" ? "created" : "updated"} successfully`);
      // Navigate back to the cause page after successful creation
      router.push(`/dashboard/organizations/${causeId.split('/')[0]}/causes/${causeId.split('/')[1]}`);
    } catch (err) {
      console.error(`Failed to ${mode} listing:`, err);
      toast.error(err instanceof Error ? err.message : `Failed to ${mode} listing`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
      <div className="text-gray-900">
        <label className="block text-gray-900 font-bold mb-2" htmlFor="title">
          Title
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
          id="title"
          type="text"
          placeholder="Enter listing title"
          {...register('title', { required: true })}
        />
      </div>
      <div className="text-gray-900">
        <label className="block text-gray-900 font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          placeholder="Enter listing description"
          {...register('description', { required: true })}
        />
      </div>
      <div className="text-gray-900">
        <label className="block text-gray-900 font-bold mb-2" htmlFor="price">
          Price
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
          id="price"
          type="text"
          placeholder="Enter price"
          {...register('price', { required: true })}
        />
      </div>
      <div className="text-gray-900">
        <label className="block text-gray-900 font-bold mb-2" htmlFor="paymentLink">
          Payment Link (Optional)
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
          id="paymentLink"
          type="text"
          placeholder="Enter payment link (optional)"
          {...register('paymentLink')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image" className="text-gray-900">Image</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required={mode === "create"}
          className="text-gray-900"
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
        className="w-full"
      >
        {isSubmitting 
          ? mode === "create" ? "Creating..." : "Saving..." 
          : mode === "create" ? "Create Listing" : "Save Changes"
        }
      </Button>
    </form>
  );
} 