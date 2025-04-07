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
    listingId: string;
  };
}

export default async function EditListingPage({ params }: PageProps) {
  const userRole = await requireOrganizationAccess(params.id);
  
  // Only allow ORG_ADMIN to edit listings
  if (userRole !== UserRole.ORG_ADMIN) {
    notFound();
  }

  const listing = await prisma.listing.findUnique({
    where: {
      id: params.listingId,
      causeId: params.causeId,
    },
  });

  if (!listing) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Edit Listing</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingForm
            causeId={params.causeId}
            listingId={params.listingId}
            listing={listing}
            mode="edit"
            onSubmit={async (data) => {
              'use server';
              try {
                await prisma.listing.update({
                  where: { id: params.listingId },
                  data: {
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    paymentLink: data.paymentLink,
                    imageUrl: data.imageUrl,
                  },
                });
              } catch (error) {
                console.error('Error updating listing:', error);
                throw new Error('Failed to update listing');
              }
            }}
            isSubmitting={false}
          />
        </CardContent>
      </Card>
    </div>
  );
} 