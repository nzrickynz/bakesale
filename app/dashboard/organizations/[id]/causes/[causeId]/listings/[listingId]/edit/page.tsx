import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireOrganizationAccess } from "@/lib/auth";
import { UserRole } from "@prisma/client";

interface PageProps {
  params: {
    id: string;
    causeId: string;
    listingId: string;
  };
}

export default async function EditListingPage({ params }: PageProps) {
  const userRole = await requireOrganizationAccess(params.id);
  
  // Only allow VOLUNTEER and ORG_ADMIN to edit listings
  if (userRole !== UserRole.VOLUNTEER && userRole !== UserRole.ORG_ADMIN) {
    notFound();
  }

  const listing = await prisma.listing.findUnique({
    where: {
      id: params.listingId,
      causeId: params.causeId,
      cause: {
        organizationId: params.id,
      },
    },
  });

  if (!listing) {
    notFound();
  }

  // Only allow the listing's volunteer or org admin to edit
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

  if (userRole !== UserRole.ORG_ADMIN && listing.volunteerId !== user.id) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Listing</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                defaultValue={listing.title}
                placeholder="Enter listing title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue={listing.description}
                placeholder="Enter listing description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                defaultValue={listing.price}
                placeholder="Enter price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                defaultValue={listing.quantity || ""}
                placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripePaymentLink">Payment Link</Label>
              <Input
                id="stripePaymentLink"
                type="url"
                defaultValue={listing.stripePaymentLink || ""}
                placeholder="Enter payment link"
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 