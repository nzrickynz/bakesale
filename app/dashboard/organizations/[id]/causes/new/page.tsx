// Server Component (NO "use client")
import { notFound } from "next/navigation";
import { requireOrganizationAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { CauseForm } from '@/components/forms/CauseForm';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (formData: any) => {
    'use server';
    
    try {
      const { data: cause, error } = await supabase
        .from('causes')
        .insert([
          {
            organization_id: params.id,
            title: formData.title,
            description: formData.description,
            goal_amount: formData.goalAmount ? parseFloat(formData.goalAmount) : null,
            start_date: formData.startDate || null,
            end_date: formData.endDate || null,
            status: formData.status || 'DRAFT',
            image_url: formData.imageUrl || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Cause created successfully');
      redirect(`/dashboard/organizations/${params.id}/causes/${cause.id}`);
    } catch (error) {
      console.error('Error creating cause:', error);
      toast.error('Failed to create cause');
    }
  };

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
            isSubmitting={false}
          />
        </CardContent>
      </Card>
    </div>
  );
} 