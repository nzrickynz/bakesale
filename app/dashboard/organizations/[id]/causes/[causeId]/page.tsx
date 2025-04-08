import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  params: {
    id: string;
    causeId: string;
  };
}

interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  role: "ADMIN" | "VOLUNTEER";
  organization: {
    id: string;
    name: string;
  };
}

interface Cause {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date;
  listings: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    volunteer: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  }[];
}

export default async function CauseDetailsPage({ params }: PageProps) {
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

  const userOrganization = await prisma.userOrganization.findFirst({
    where: {
      userId: user.id,
      organizationId: params.id,
    },
    include: {
      organization: true,
    },
  }) as UserOrganization | null;

  if (!userOrganization) {
    notFound();
  }

  const cause = await prisma.cause.findUnique({
    where: {
      id: params.causeId,
    },
    include: {
      listings: {
        include: {
          volunteer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  }) as Cause | null;

  if (!cause) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{cause.title}</h2>
          <p className="text-muted-foreground">
            Manage listings for this cause
          </p>
        </div>
        {userOrganization.role === "ADMIN" && (
          <Link href={`/dashboard/organizations/${params.id}/causes/${params.causeId}/listings/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Listing
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cause.listings.map((listing) => (
          <Card key={listing.id}>
            <CardHeader>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                {listing.imageUrl ? (
                  <Image
                    src={listing.imageUrl}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <CardTitle className="mt-4">{listing.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {listing.description || "No description"}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    ${listing.price.toFixed(2)}
                  </span>
                  {listing.volunteer ? (
                    <span className="text-sm text-muted-foreground">
                      {listing.volunteer.name || listing.volunteer.email}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No volunteer assigned
                    </span>
                  )}
                </div>
                <Link href={`/dashboard/organizations/${params.id}/causes/${params.causeId}/listings/${listing.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 