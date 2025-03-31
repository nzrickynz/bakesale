"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

interface NewCauseFormProps {
  organizationId: string;
}

export default function NewCauseForm({ organizationId }: NewCauseFormProps) {
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
      await createCause(formData, organizationId);
      toast.success("Cause created successfully!");
      router.push(`/dashboard/organizations/${organizationId}/causes`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create cause");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/dashboard/organizations/${organizationId}/causes`} className="flex items-center text-sm mb-4 text-orange-600 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to causes
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Cause</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input name="title" id="title" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea name="description" id="description" required />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Cause"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 