import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

interface Cause {
  id: string;
  title: string;
  description: string;
  targetGoal: number | null;
  startDate: Date;
  endDate: Date | null;
  status: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
  };
  donations: {
    id: string;
    amount: number;
    createdAt: Date;
    status: string;
  }[];
  listings: {
    id: string;
    title: string;
    description: string;
    price: number;
    status: string;
    createdAt: Date;
  }[];
}

export default async function CausePage({ params }: PageProps) {
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
    where: { id: params.id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      listings: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  }) as Cause | null;

  if (!cause) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {cause.title}
          </h2>
          <p className="text-sm text-gray-600">
            {cause.organization.name}
          </p>
        </div>
        <div className="ml-auto">
          <Button asChild>
            <Link href={`/dashboard/organizations/${cause.organizationId}/causes/${cause.id}/listings/new`}>
              Create Listing
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">About this Cause</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{cause.description}</p>
          </CardContent>
        </Card>

        <Card className="col-span-4 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {cause.listings.length === 0 ? (
              <p className="text-sm text-gray-600">No listings yet.</p>
            ) : (
              <div className="space-y-4">
                {cause.listings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <h3 className="font-medium text-gray-900">{listing.title}</h3>
                      <p className="text-sm text-gray-600">{listing.description}</p>
                      <p className="text-sm font-medium text-gray-900">${listing.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/organizations/${cause.organizationId}/causes/${cause.id}/listings/${listing.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/organizations/${cause.organizationId}/causes/${cause.id}/listings/${listing.id}/delete`}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 