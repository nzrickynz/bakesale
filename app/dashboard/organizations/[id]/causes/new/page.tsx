// Server Component (NO "use client")
import { notFound } from "next/navigation";
import { requireOrganizationAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { CauseForm } from '@/components/forms/CauseForm';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PageProps {
  params: { id: string };
}

export default async function NewCausePage({ params }: PageProps) {
  const userRole = await requireOrganizationAccess(params.id);

  if (userRole !== UserRole.ORG_ADMIN) {
    notFound();
  }

  const organization = await prisma.organization.findUnique({
    where: { id: params.id },
  });

  if (!organization) {
    notFound();
  }

  const isSubmitting = false; // Set this based on your form submission state

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create New Cause</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cause Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CauseForm
            title=""
            description=""
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function handleSubmit(data: any) {
  // Handle form submission logic here
} 