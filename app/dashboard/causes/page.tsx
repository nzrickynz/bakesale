import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
}

interface Cause {
  id: string;
  title: string;
  description: string;
  targetGoal: number | null;
  status: string;
  listings: Listing[];
}

interface Organization {
  id: string;
  name: string;
  causes: Cause[];
}

interface UserOrganization {
  organization: Organization;
}

export default async function CausesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      adminOf: true
    }
  });

  if (!user) {
    return null;
  }

  // Get the user's organizations with their causes and listings
  const userOrganizations = await prisma.userOrganization.findMany({
    where: {
      userId: user.id,
    },
    include: {
      organization: {
        include: {
          causes: {
            include: {
              listings: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  price: true,
                },
                orderBy: {
                  createdAt: 'desc'
                }
              },
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
        },
      },
    },
  }) as UserOrganization[];

  // Log the data for debugging
  console.log('User Organizations:', JSON.stringify(userOrganizations, null, 2));

  // Flatten causes from all organizations
  const allCauses = userOrganizations.flatMap(
    (userOrg) => userOrg.organization.causes
  );

  // Log the flattened causes
  console.log('All Causes:', JSON.stringify(allCauses, null, 2));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Causes</h2>
        <div>
          <Link href={`/dashboard/organizations/${user.adminOf[0].id}/causes/new`}>
            <Button className="bg-[#F15A2B] text-white hover:bg-[#F15A2B]/90">
              <Plus className="mr-2 h-4 w-4" />
              New Cause
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allCauses.map((cause) => (
          <Link
            key={cause.id}
            href={`/dashboard/causes/${cause.id}`}
            className="block"
          >
            <Card className="hover:bg-accent/5 transition-colors cursor-pointer bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">{cause.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {cause.description}
                </p>
                {cause.targetGoal && (
                  <p className="text-sm font-medium mt-2 text-gray-900">
                    Goal: ${cause.targetGoal.toLocaleString()}
                  </p>
                )}
                <p className="text-sm font-medium mt-2 text-gray-900">
                  Status: <span className="capitalize">{cause.status.toLowerCase()}</span>
                </p>
                {cause.listings.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Listings:</p>
                    <div className="space-y-2">
                      {cause.listings.map((listing) => (
                        <div key={listing.id} className="text-sm">
                          <p className="font-medium text-gray-900">{listing.title}</p>
                          <p className="text-gray-600">${listing.price.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 