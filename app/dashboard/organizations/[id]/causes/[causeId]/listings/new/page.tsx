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
        <h2 className="text-3xl font-bold tracking-tight">Create New Listing</h2>
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
                placeholder="Enter listing title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter listing description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Enter price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                placeholder="Upload an image"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentLink">Payment Link</Label>
              <Input
                id="paymentLink"
                type="url"
                placeholder="Enter payment link"
              />
            </div>
            <Button type="submit">Create Listing</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 