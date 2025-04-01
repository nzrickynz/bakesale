import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      adminOf: {
        include: {
          causes: {
            include: {
              listings: {
                include: {
                  orders: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const organization = user.adminOf[0];
  if (!organization) {
    return null;
  }

  const totalCauses = organization.causes.length;
  const activeCauses = organization.causes.filter(cause => cause.status === "ACTIVE").length;
  const totalListings = organization.causes.reduce((acc, cause) => acc + cause.listings.length, 0);
  const totalOrders = organization.causes.reduce(
    (acc, cause) => acc + cause.listings.reduce((acc2, listing) => acc2 + listing.orders.length, 0),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Causes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCauses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Causes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeCauses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalListings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 