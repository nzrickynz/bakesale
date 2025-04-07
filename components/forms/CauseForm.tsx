'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { ControllerRenderProps } from "react-hook-form";

const causeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().nullable(),
});

type CauseFormValues = z.infer<typeof causeFormSchema>;

interface CauseFormProps {
  cause?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
  };
  mode: "create" | "edit";
  onSubmit: (data: CauseFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function CauseForm({ cause, mode, onSubmit, isSubmitting }: CauseFormProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(cause?.imageUrl || null);

  const form = useForm<CauseFormValues>({
    resolver: zodResolver(causeFormSchema),
    defaultValues: {
      title: cause?.title || "",
      description: cause?.description || "",
      imageUrl: cause?.imageUrl || null,
    },
  });

  const handleSubmit = async (data: CauseFormValues) => {
    try {
      await onSubmit({
        ...data,
        imageUrl,
      });
      toast.success(`Cause ${mode === "create" ? "created" : "updated"} successfully`);
      router.refresh();
    } catch (error) {
      console.error(`Failed to ${mode} cause:`, error);
      toast.error(`Failed to ${mode} cause`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter cause title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter cause description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={imageUrl}
                  onChange={(url: string) => {
                    setImageUrl(url);
                    field.onChange(url);
                  }}
                  onRemove={() => {
                    setImageUrl(null);
                    field.onChange(null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Cause" : "Update Cause"}
        </Button>
      </form>
    </Form>
  );
} 