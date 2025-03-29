import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, Users, Calendar } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return null;
  }

  const userOrganizations = await prisma.userOrganization.findMany({
    where: {
      userId: user.id,
    },
    include: {
      organization: {
        include: {
          causes: {
            include: {
              donations: true,
              listings: true,
            },
          },
        },
      },
    },
  });

  // Calculate analytics
  const totalDonations = userOrganizations.reduce(
    (sum, userOrg) =>
      sum +
      userOrg.organization.causes.reduce(
        (causeSum, cause) =>
          causeSum +
          cause.donations.reduce(
            (donationSum, donation) => donationSum + donation.amount,
            0
          ),
        0
      ),
    0
  );

  const totalListings = userOrganizations.reduce(
    (sum, userOrg) =>
      sum +
      userOrg.organization.causes.reduce(
        (causeSum, cause) => causeSum + cause.listings.length,
        0
      ),
    0
  );

  const totalCauses = userOrganizations.reduce(
    (sum, userOrg) => sum + userOrg.organization.causes.length,
    0
  );

  const activeCauses = userOrganizations.reduce(
    (sum, userOrg) =>
      sum +
      userOrg.organization.causes.filter(
        (cause) => cause.status === "ACTIVE"
      ).length,
    0
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalDonations.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Total amount raised across all causes</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Total Listings</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalListings}</div>
            <p className="text-xs text-gray-600">Active listings across all causes</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Total Causes</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalCauses}</div>
            <p className="text-xs text-gray-600">Total number of causes</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Active Causes</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeCauses}</div>
            <p className="text-xs text-gray-600">Currently active causes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 