'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Upload } from 'lucide-react';

interface OrganizationFormProps {
  name: string;
  contactEmail: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  logoUrl?: string | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function OrganizationForm({
  name,
  contactEmail,
  websiteUrl,
  facebookUrl,
  instagramUrl,
  logoUrl,
  onSubmit,
  isSubmitting,
}: OrganizationFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(logoUrl || null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name,
      contactEmail,
      websiteUrl,
      facebookUrl,
      instagramUrl,
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

  const onFormSubmit = async (data: any) => {
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
        data.logoUrl = url;
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        return;
      }
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Logo Upload */}
      <div className="space-y-2">
        <Label htmlFor="logo" className="text-gray-900">Organization Logo</Label>
        <div className="flex items-center gap-4">
          <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Organization logo preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("logo")?.click()}
              className="w-full text-gray-900"
            >
              Upload Logo
            </Button>
            <p className="mt-2 text-sm text-gray-900">
              Recommended size: 300x300 pixels
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-900">Organization Name</Label>
        <Input 
          id="name" 
          {...register('name', { required: true })} 
          className="text-gray-900"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">Organization name is required</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail" className="text-gray-900">Contact Email</Label>
        <Input 
          id="contactEmail" 
          type="email" 
          {...register('contactEmail', { required: true })} 
          className="text-gray-900"
        />
        {errors.contactEmail && <p className="text-red-500 text-xs mt-1">Contact email is required</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="websiteUrl" className="text-gray-900">Website URL</Label>
        <Input 
          id="websiteUrl" 
          type="url" 
          {...register('websiteUrl')} 
          className="text-gray-900"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="facebookUrl" className="text-gray-900">Facebook URL</Label>
        <Input 
          id="facebookUrl" 
          type="url" 
          {...register('facebookUrl')} 
          placeholder="https://facebook.com/your-org"
          className="text-gray-900"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagramUrl" className="text-gray-900">Instagram URL</Label>
        <Input 
          id="instagramUrl" 
          type="url" 
          {...register('instagramUrl')} 
          placeholder="https://instagram.com/your-org"
          className="text-gray-900"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
} 