import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, Settings, ArrowRight } from "lucide-react";

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
    description: string | null;
    website: string | null;
  };
}

interface Cause {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
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
    amount: number;
    status: string;
  }[];
}

interface CauseWithAmount extends Cause {
  currentAmount: number;
}

export default async function OrganizationPage({ params }: PageProps) {
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
      organization: true,
      donations: {
        where: {
          status: "COMPLETED"
        }
      }
    },
  }) as Cause[];

  // Calculate current amount for each cause
  const causesWithAmounts = causes.map(cause => ({
    ...cause,
    currentAmount: cause.donations.reduce((sum: number, donation: { amount: number }) => sum + donation.amount, 0)
  })) as CauseWithAmount[];

  const totalDonations = await prisma.donation.aggregate({
    where: {
      causeId: {
        in: causes.map((cause) => cause.id),
      },
    },
    _sum: {
      amount: true,
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {userOrganization.organization.name}
          </h2>
          <p className="text-muted-foreground">
            {userOrganization.role.toLowerCase()}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {userOrganization.role === "ADMIN" && (
            <Button asChild>
              <Link href={`/dashboard/organizations/${params.id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href={`/dashboard/organizations/${params.id}/causes/new`}>
              New Cause
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">
              Active Causes
            </CardTitle>
            <Heart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {causes.filter((cause) => cause.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-gray-600">
              {causes.filter((cause) => cause.status === "ACTIVE").length} active
              cause
              {causes.filter((cause) => cause.status === "ACTIVE").length !== 1
                ? "s"
                : ""}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">
              Total Donations
            </CardTitle>
            <Heart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${totalDonations._sum.amount?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-gray-600">
              Total amount raised across all causes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Active Causes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {causesWithAmounts
                .filter((cause) => cause.status === "ACTIVE")
                .slice(0, 5)
                .map((cause) => (
                  <div
                    key={cause.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium leading-none text-gray-900">
                        {cause.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${cause.currentAmount.toFixed(2)} raised of $
                        {cause.targetGoal?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/causes/${cause.id}`}>
                        <ArrowRight className="h-4 w-4 text-gray-600" />
                      </Link>
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Organization Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {userOrganization.organization.description ||
                    "No description provided"}
                </p>
              </div>
              {userOrganization.organization.website && (
                <div>
                  <h4 className="text-sm font-medium">Website</h4>
                  <a
                    href={userOrganization.organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {userOrganization.organization.website}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 