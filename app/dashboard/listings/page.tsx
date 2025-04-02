import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

export default async function ListingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }

  // Get all organizations the user has access to
  const userOrganizations = await prisma.userOrganization.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: {
        include: {
          causes: {
            include: {
              listings: {
                include: {
                  volunteer: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Listings</h2>
      </div>

      <div className="space-y-8">
        {userOrganizations.map((userOrg) => (
          <div key={userOrg.organization.id} className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-900">
              {userOrg.organization.name}
            </h3>
            {userOrg.organization.causes.map((cause) => (
              <Card key={cause.id} className="bg-white shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">{cause.title}</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/listings/new?causeId=${cause.id}`}>
                        Add Listing
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cause.listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {listing.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            Volunteer: {listing.volunteer.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Price: ${listing.price}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/listings/${listing.id}/edit`}>
                              <Edit className="h-4 w-4 text-gray-700" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/listings/${listing.id}`}>
                              <ArrowRight className="h-4 w-4 text-gray-700" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    {cause.listings.length === 0 && (
                      <p className="text-sm text-gray-600 text-center py-4">
                        No listings for this cause yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {userOrg.organization.causes.length === 0 && (
              <p className="text-sm text-gray-600">
                No causes for this organization yet.
              </p>
            )}
          </div>
        ))}
        {userOrganizations.length === 0 && (
          <p className="text-sm text-gray-600">
            You don't have access to any organizations yet.
          </p>
        )}
      </div>
    </div>
  );
} 