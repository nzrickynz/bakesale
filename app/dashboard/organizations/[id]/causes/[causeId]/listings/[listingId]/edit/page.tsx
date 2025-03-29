import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditListingForm } from "./edit-listing-form";

interface PageProps {
  params: {
    id: string;
    causeId: string;
    listingId: string;
  };
}

export default async function EditListingPage({ params }: PageProps) {
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
    where: { id: params.causeId },
    include: {
      organization: true,
    },
  });

  if (!cause) {
    notFound();
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
  });

  if (!listing) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/causes/${params.causeId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Edit Listing</h2>
          <p className="text-sm text-gray-600">
            Edit listing for {cause.title}
          </p>
        </div>
      </div>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-900">Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EditListingForm 
            causeId={params.causeId} 
            listingId={params.listingId}
            listing={listing}
          />
        </CardContent>
      </Card>
    </div>
  );
} 