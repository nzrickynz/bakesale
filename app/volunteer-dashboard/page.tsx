export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { Listing, Order, Cause, Organization, UserOrganization } from "@prisma/client";
import { ErrorMessage } from "@/components/ui/error-message";
import { EmptyState } from "@/components/ui/empty-state";

type CauseWithOrg = Cause & {
  organization: Organization;
};

type ListingWithOrders = Listing & {
  orders: Order[];
  cause: CauseWithOrg;
  isActive: boolean;
  volunteerId: string | null;
};

type UserWithListings = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  managedListings: ListingWithOrders[];
  userOrganizations: (UserOrganization & {
    organization: Organization & {
      causes: (Cause & {
        listings: ListingWithOrders[];
      })[];
    };
  })[];
};

export default async function VolunteerDashboard() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      redirect('/dashboard');
    }

    const user = await prisma.user.findUnique({
      where: { 
        id: session.user.id,
      },
      include: {
        managedListings: {
          include: {
            cause: {
              include: {
                organization: true,
              },
            },
            orders: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    }) as UserWithListings | null;

    if (!user || user.role !== 'VOLUNTEER') {
      redirect('/dashboard');
    }

    // Only show assigned listings
    const listings = user.managedListings;

    if (listings.length === 0) {
      redirect('/dashboard');
    }

    const totalListings = listings.length;
    const pendingOrders = listings.reduce(
      (acc: number, listing: ListingWithOrders) =>
        acc + (listing.orders?.filter(order => order.fulfillmentStatus !== "FULFILLED")?.length || 0),
      0
    );
    const fulfilledOrders = listings.reduce(
      (acc: number, listing: ListingWithOrders) =>
        acc + (listing.orders?.filter(order => order.fulfillmentStatus === "FULFILLED")?.length || 0),
      0
    );

    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Volunteer Dashboard</h2>
            <p className="text-gray-900">
              {user.managedListings.length === 0 ? "Available listings from your organization" : "Manage your assigned listings and orders"}
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.managedListings.length === 0 ? "Available Listings" : "Total Listings"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{totalListings}</p>
                </div>
                <Package className="w-8 h-8 text-[#E55937]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-[#E55937]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Fulfilled Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{fulfilledOrders}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-[#E55937]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.length === 0 ? (
            <div className="col-span-full">
              <EmptyState text="No listings are available at the moment" />
            </div>
          ) : (
            listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden bg-white">
                {listing.imageUrl && (
                  <div className="relative h-48">
                    <Image
                      src={listing.imageUrl}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">{listing.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-900">Cause</p>
                      <p className="font-medium text-gray-900">{listing.cause.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Organization</p>
                      <p className="font-medium text-gray-900">{listing.cause.organization.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Price</p>
                      <p className="font-medium text-gray-900">${listing.price}</p>
                    </div>

                    {/* Orders Section */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">Orders</h3>
                        <span className="px-2 py-1 text-sm rounded-full bg-[#FFE974] border border-[#FFE974] text-gray-900">
                          {listing.orders?.length ?? 0} orders
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading volunteer dashboard:", error);
    return <ErrorMessage />;
  }
} 