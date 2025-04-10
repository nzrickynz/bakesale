export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { Listing, Order, Cause, Organization, UserRole } from "@prisma/client";
import { ErrorMessage } from "@/components/ui/error-message";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

type CauseWithOrg = Cause & {
  organization: Organization;
};

type ListingWithOrders = Listing & {
  orders: Order[];
  cause: CauseWithOrg;
};

export default async function ListingsPage() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== UserRole.VOLUNTEER) {
      notFound();
    }

    const listings = await prisma.listing.findMany({
      where: {
        volunteerId: user.id,
      },
      include: {
        cause: {
          include: {
            organization: true,
          },
        },
        orders: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (listings.length === 0) {
      return (
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">My Listings</h2>
          </div>
          <EmptyState text="You haven't been assigned any listings yet." />
        </div>
      );
    }

    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">My Listings</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{listing.title}</CardTitle>
                  <Badge variant="default">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={listing.imageUrl || "/placeholder.svg?height=300&width=300"}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-500">{listing.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {listing.orders.length} orders
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      ${listing.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      Created {format(new Date(listing.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {listing.cause.organization.name}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Button asChild>
                      <Link href={`/volunteer-dashboard/orders?listingId=${listing.id}`}>
                        View Orders
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("[VOLUNTEER_LISTINGS_ERROR]", error);
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">My Listings</h2>
        </div>
        <ErrorMessage text="We're having trouble loading your listings. Please try again shortly." />
      </div>
    );
  }
} 