'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Image } from '@/components/ui/image';
import { toast } from 'sonner';

interface CauseFormProps {
  title: string;
  description: string;
  goalAmount?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  imageUrl?: string | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function CauseForm({
  title,
  description,
  goalAmount,
  startDate,
  endDate,
  status,
  imageUrl,
  onSubmit,
  isSubmitting,
}: CauseFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(imageUrl || null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    // Upload image if provided
    if (imageFile) {
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);

      try {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const { url } = await uploadResponse.json();
        data.imageUrl = url;
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        return;
      }
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={description} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goalAmount">Goal Amount</Label>
        <Input id="goalAmount" name="goalAmount" type="number" defaultValue={goalAmount} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input id="startDate" name="startDate" type="date" defaultValue={startDate} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate">End Date</Label>
        <Input id="endDate" name="endDate" type="date" defaultValue={endDate} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select id="status" name="status" defaultValue={status} className="w-full">
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
} 