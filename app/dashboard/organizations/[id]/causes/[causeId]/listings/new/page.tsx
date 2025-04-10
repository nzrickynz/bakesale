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
import { ListingForm } from '@/components/forms/ListingForm';

interface PageProps {
  params: {
    id: string;
    causeId: string;
  };
}

export default async function NewListingPage({ params }: PageProps) {
  const userRole = await requireOrganizationAccess(params.id);
  
  // Only allow VOLUNTEER and ORG_ADMIN to create listings
  if (userRole !== UserRole.VOLUNTEER && userRole !== UserRole.ORG_ADMIN) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
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
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create New Listing</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingForm 
            causeId={params.causeId} 
            mode="create"
            onSubmit={async (data) => {
              'use server';
              try {
                const listing = await prisma.listing.create({
                  data: {
                    title: data.title,
                    description: data.description,
                    price: parseFloat(data.price),
                    imageUrl: data.imageUrl,
                    causeId: params.causeId,
                    volunteerId: user.id,
                    paymentLink: data.paymentLink,
                  },
                });
              } catch (error) {
                console.error('Error creating listing:', error);
                throw new Error('Failed to create listing');
              }
            }}
            isSubmitting={false}
          />
        </CardContent>
      </Card>
    </div>
  );
} 