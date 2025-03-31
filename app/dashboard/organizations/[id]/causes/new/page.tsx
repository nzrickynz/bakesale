"use client";

import { useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCause } from "../actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireOrganizationAccess } from "@/lib/auth";
import { UserRole } from "@prisma/client";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function NewCausePage({ params }: PageProps) {
  const userRole = await requireOrganizationAccess(params.id);
  
  // Only allow ORG_ADMIN to create causes
  if (userRole !== UserRole.ORG_ADMIN) {
    notFound();
  }

  const organization = await prisma.organization.findUnique({
    where: { id: params.id },
  });

  if (!organization) {
    notFound();
  }

  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    if (!session?.user?.email) {
      toast.error("You must be logged in to create a cause");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createCause(formData, params.id);
      if (result.success) {
        toast.success("Cause created successfully");
        router.push(`/dashboard/organizations/${params.id}`);
      } else {
        toast.error(result.error || "Failed to create cause");
      }
    } catch (error) {
      console.error("Error creating cause:", error);
      toast.error("Failed to create cause");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/organizations/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">New Cause</h2>
          <p className="text-gray-600">Create a new cause for your organization</p>
        </div>
      </div>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900">Cause Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-900">Title</Label>
              <Input
                id="title"
                name="title"
                required
                className="w-full text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-900">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                className="w-full text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal" className="text-sm font-medium text-gray-900">Goal Amount ($)</Label>
              <Input
                id="goal"
                name="goal"
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full text-gray-900"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium text-gray-900">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  className="w-full text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium text-gray-900">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  required
                  className="w-full text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="bg-[#F15A2B] text-white hover:bg-[#F15A2B]/90"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Cause"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/organizations/${params.id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 