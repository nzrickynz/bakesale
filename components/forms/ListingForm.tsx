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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const listingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required').max(100, 'Description cannot exceed 100 characters'),
  price: z.string().min(1, 'Price is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a valid positive number',
  }),
  paymentLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  causeId: string;
  listingId?: string;
  listing?: {
    id: string;
    title: string;
    description: string;
    price: number;
    paymentLink: string | null;
    imageUrl: string | null;
  };
  mode: "create" | "edit";
  onSubmit: (data: ListingFormData & { imageUrl?: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function ListingForm({ causeId, listingId, listing, mode, onSubmit, isSubmitting: externalIsSubmitting }: ListingFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(listing?.imageUrl || null);
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing?.title || "",
      description: listing?.description || "",
      price: listing?.price?.toString() || "",
      paymentLink: listing?.paymentLink || "",
    }
  });

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

  const handleSubmitForm = async (data: ListingFormData) => {
    setInternalIsSubmitting(true);
    try {
      let imageUrl = listing?.imageUrl || undefined;
      
      // Upload new image if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const { url } = await uploadResponse.json();
        if (!url) {
          throw new Error('No image URL returned from upload');
        }
        imageUrl = url;
      }

      await onSubmit({ ...data, imageUrl });
      toast.success(`Listing ${mode === "create" ? "created" : "updated"} successfully`);
      router.push(`/dashboard/organizations/${causeId.split('/')[0]}/causes/${causeId.split('/')[1]}`);
    } catch (err) {
      console.error(`Failed to ${mode} listing:`, err);
      toast.error(err instanceof Error ? err.message : `Failed to ${mode} listing`);
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  const isSubmitting = externalIsSubmitting || internalIsSubmitting;

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
          {...register('title')}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div className="text-gray-900">
        <label className="block text-gray-900 font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          placeholder="Enter listing description"
          {...register('description')}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>
      <div className="text-gray-900">
        <label className="block text-gray-900 font-bold mb-2" htmlFor="price">
          Price
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
          id="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="Enter price"
          {...register('price')}
        />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
      </div>
      <div className="text-gray-900">
        <label className="block text-gray-900 font-bold mb-2" htmlFor="paymentLink">
          Payment Link (Optional)
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
          id="paymentLink"
          type="url"
          placeholder="Enter payment link (optional)"
          {...register('paymentLink')}
        />
        {errors.paymentLink && <p className="text-red-500 text-xs mt-1">{errors.paymentLink.message}</p>}
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
        disabled={isSubmitting}
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