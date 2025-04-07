'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image } from '@/components/ui/image';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().min(1, 'Description is required'),
  websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  facebookUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  instagramUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationEditFormProps {
  organization: {
    id: string;
    name: string;
    description: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
  };
  onSubmit: (data: OrganizationFormData & { logoUrl?: string }) => Promise<void>;
}

export function OrganizationEditForm({ organization, onSubmit }: OrganizationEditFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(organization.logoUrl);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name,
      description: organization.description,
      websiteUrl: organization.websiteUrl || '',
      facebookUrl: organization.facebookUrl || '',
      instagramUrl: organization.instagramUrl || '',
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

  const onFormSubmit = async (data: OrganizationFormData) => {
    try {
      // Upload image if provided
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const { url } = await uploadResponse.json();
        await onSubmit({ ...data, logoUrl: url });
      } else {
        await onSubmit(data);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to update organization');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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
          {...register('name')} 
          className="text-gray-900"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-900">Description</Label>
        <Textarea 
          id="description" 
          {...register('description')} 
          className="text-gray-900"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="websiteUrl" className="text-gray-900">Website URL</Label>
        <Input 
          id="websiteUrl" 
          type="url" 
          {...register('websiteUrl')} 
          className="text-gray-900"
        />
        {errors.websiteUrl && <p className="text-red-500 text-xs mt-1">{errors.websiteUrl.message}</p>}
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
        {errors.facebookUrl && <p className="text-red-500 text-xs mt-1">{errors.facebookUrl.message}</p>}
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
        {errors.instagramUrl && <p className="text-red-500 text-xs mt-1">{errors.instagramUrl.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
} 