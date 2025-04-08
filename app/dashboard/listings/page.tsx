"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Edit, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface UserOrganization {
  id: string;
  name: string;
  role: string;
  causes: Array<{
    id: string;
    title: string;
    listings: Array<{
      id: string;
      title: string;
      price: number;
      volunteer: {
        id: string;
        name: string;
        email: string;
      } | null;
    }>;
  }>;
}

export default function ListingsPage() {
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/organizations");
        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }
        const data = await response.json();
        setUserOrganizations(data.organizations);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Listings</h2>
      </div>

      <div className="space-y-8">
        {userOrganizations.map((org) => (
          <div key={org.id} className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-900">
              {org.name}
            </h3>
            {org.causes.map((cause) => (
              <Card key={cause.id} className="bg-white shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">{cause.title}</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white border-none"
                        >
                          Add Listing
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Select Cause</DialogTitle>
                          <DialogDescription>
                            Choose which cause you want to create a listing for
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {org.causes.map((cause) => (
                            <Button
                              key={cause.id}
                              variant="outline"
                              className="w-full justify-start"
                              asChild
                            >
                              <Link href={`/dashboard/organizations/${org.id}/causes/${cause.id}/listings/new`}>
                                {cause.title}
                              </Link>
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
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
                            Volunteer: {listing.volunteer?.name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Price: ${listing.price}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/organizations/${org.id}/causes/${cause.id}/listings/${listing.id}/edit`}>
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
          </div>
        ))}
      </div>
    </div>
  );
} 