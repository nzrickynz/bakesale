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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Edit Cause</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Cause Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CauseForm
            title={cause.title}
            description={cause.description || ''}
            goalAmount={cause.targetGoal || undefined}
            startDate={cause.startDate.toISOString().split('T')[0]}
            endDate={cause.endDate ? cause.endDate.toISOString().split('T')[0] : undefined}
            status={cause.status}
            imageUrl={cause.imageUrl}
            onSubmit={async (data) => {
              'use server';
              try {
                await prisma.cause.update({
                  where: { id: params.causeId },
                  data: {
                    title: data.title,
                    description: data.description,
                    targetGoal: data.goalAmount,
                    startDate: new Date(data.startDate),
                    endDate: data.endDate ? new Date(data.endDate) : null,
                    status: data.status,
                    imageUrl: data.imageUrl,
                  },
                });
              } catch (error) {
                console.error('Error updating cause:', error);
                throw new Error('Failed to update cause');
              }
            }}
            isSubmitting={false}
          />
        </CardContent>
      </Card>
    </div>
  );
} 