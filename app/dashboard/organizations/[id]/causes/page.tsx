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
  }[];
}

export default async function CausesPage({ params }: PageProps) {
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

  const causes = await prisma.cause.findMany({
    where: {
      organizationId: params.id,
    },
    include: {
      listings: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  }) as Cause[];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Causes</h2>
          <p className="text-muted-foreground">
            Manage causes for {userOrganization.organization.name}
          </p>
        </div>
        {userOrganization.role === "ADMIN" && (
          <Link href={`/dashboard/organizations/${params.id}/causes/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Cause
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {causes.map((cause) => (
          <Card key={cause.id}>
            <CardHeader>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                {cause.imageUrl ? (
                  <Image
                    src={cause.imageUrl}
                    alt={cause.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <CardTitle className="mt-4">{cause.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {cause.description || "No description"}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {cause.listings.length} listings
                </span>
                <Link href={`/dashboard/organizations/${params.id}/causes/${cause.id}`}>
                  <Button variant="outline" size="sm">
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