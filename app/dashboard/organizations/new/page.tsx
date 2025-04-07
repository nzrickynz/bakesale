"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createOrganization } from "./actions";
import { OrganizationForm } from '@/components/forms/OrganizationForm';

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
          <OrganizationForm
            name=""
            contactEmail=""
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function handleSubmit(data: any) {
  // Handle form submission logic here
}