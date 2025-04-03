"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createOrganization } from "./actions";

export default function NewOrganizationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    if (!session?.user?.email) {
      toast.error("You must be logged in to create an organization");
      return;
    }

    console.log("[NEW_ORG] Session user:", {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    });

    setIsLoading(true);
    try {
      const result = await createOrganization(formData, session.user.id);
      if (result.success) {
        toast.success("Organization created successfully");
        router.push(`/dashboard/organizations/${result.organizationId}`);
      } else {
        toast.error(result.error || "Failed to create organization");
      }
    } catch (error) {
      console.error("[NEW_ORG] Error creating organization:", error);
      toast.error("Failed to create organization");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/organizations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">New Organization</h2>
          <p className="text-gray-600">Create a new organization</p>
        </div>
      </div>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900">Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-900">Organization Name</Label>
              <Input
                id="name"
                name="name"
                required
                className="w-full text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-900">Organization Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                required
                className="w-full text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl" className="text-sm font-medium text-gray-900">Website URL</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                className="w-full text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebookUrl" className="text-sm font-medium text-gray-900">Facebook Link</Label>
              <Input
                id="facebookUrl"
                name="facebookUrl"
                type="url"
                className="w-full text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl" className="text-sm font-medium text-gray-900">Instagram Link</Label>
              <Input
                id="instagramUrl"
                name="instagramUrl"
                type="url"
                className="w-full text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-900">Organization Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                className="w-full text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium text-gray-900">Organization Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="w-full text-gray-900"
              />
              <p className="text-sm text-gray-600">Upload an image for your organization (recommended size: 1200x630 pixels)</p>
            </div>
            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="bg-[#F15A2B] text-white hover:bg-[#F15A2B]/90"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Organization"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/organizations">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 