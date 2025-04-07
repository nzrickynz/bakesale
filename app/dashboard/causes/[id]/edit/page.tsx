import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrganizationAccess } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { CauseForm } from '@/components/forms/CauseForm';

interface PageProps {
  params: {
    id: string;
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
      id: params.id,
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
            cause={cause}
            mode="edit"
            onSubmit={async (data) => {
              'use server';
              try {
                await prisma.cause.update({
                  where: { id: params.id },
                  data: {
                    title: data.title,
                    description: data.description,
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