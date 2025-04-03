import { notFound } from "next/navigation";
import { requireOrganizationAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingForm } from "@/components/forms/ListingForm";

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
        <h2 className="text-2xl font-bold text-gray-900">Create New Listing</h2>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-gray-900">Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingForm 
            causeId={params.causeId}
            mode="create"
          />
        </CardContent>
      </Card>
    </div>
  );
} 