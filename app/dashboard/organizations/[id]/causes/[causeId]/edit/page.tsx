import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireOrganizationAccess } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { CauseForm } from '@/components/forms/CauseForm';

interface PageProps {
  params: {
    id: string;
    causeId: string;
  };
}

export default async function EditCausePage({ params }: PageProps) {
  const userRole = await requireOrganizationAccess(params.id);
  
  // Only allow ORG_ADMIN to edit causes
  if (userRole !== UserRole.ORG_ADMIN) {
    notFound();
  }

  const cause = await prisma.cause.findUnique({
    where: {
      id: params.causeId,
      organizationId: params.id,
    },
  });

  if (!cause) {
    notFound();
  }

  const isSubmitting = false; // Set this based on your form submission state

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Cause</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cause Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CauseForm
            title={cause.title}
            description={cause.description || ''}
            goalAmount={cause.targetGoal || undefined}
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