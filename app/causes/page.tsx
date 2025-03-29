"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Globe, Facebook, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Volunteer {
  name: string | null;
  image: string | null;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stripePaymentLink: string;
  volunteer: Volunteer;
}

interface Organization {
  id: string;
  name: string;
  description: string;
  websiteUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
}

interface Cause {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  targetGoal: number | null;
  organization: Organization;
  listings: Listing[];
}

const categories = [
  { id: "all", name: "All Categories" },
  { id: "food", name: "Food & Baked Goods" },
  { id: "clothing", name: "Clothing & Accessories" },
  { id: "services", name: "Services" },
];

export default async function CausesPage() {
  // Fetch all active causes with their organizations and listings
  const causes = await prisma.cause.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          description: true,
          websiteUrl: true,
          facebookUrl: true,
          instagramUrl: true,
        },
      },
      listings: {
        include: {
          volunteer: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Active Causes</h1>
          <p className="text-xl text-gray-700">Support local organizations and make a difference in your community</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search causes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E55937] focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="whitespace-nowrap"
              >
                <Filter className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Causes Grid */}
        <div className="grid grid-cols-1 gap-8">
          {causes.map((cause) => (
            <Card key={cause.id} className="overflow-hidden">
              <CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <CardTitle className="text-2xl text-gray-800">{cause.title}</CardTitle>
                    <p className="text-gray-700 mt-2">{cause.description}</p>
                  </div>
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-800">{cause.organization.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{cause.organization.description}</p>
                      <div className="flex gap-4">
                        {cause.organization.websiteUrl && (
                          <Link href={cause.organization.websiteUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-5 h-5 text-gray-600 hover:text-[#E55937]" />
                          </Link>
                        )}
                        {cause.organization.facebookUrl && (
                          <Link href={cause.organization.facebookUrl} target="_blank" rel="noopener noreferrer">
                            <Facebook className="w-5 h-5 text-gray-600 hover:text-[#E55937]" />
                          </Link>
                        )}
                        {cause.organization.instagramUrl && (
                          <Link href={cause.organization.instagramUrl} target="_blank" rel="noopener noreferrer">
                            <Instagram className="w-5 h-5 text-gray-600 hover:text-[#E55937]" />
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Listings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cause.listings.map((listing) => (
                      <Card key={listing.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium text-gray-800">{listing.title}</h3>
                              <p className="text-2xl font-bold text-[#E55937]">
                                ${listing.price.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {listing.description}
                              </p>
                            </div>
                            {listing.volunteer && (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#E55937]" />
                                <span className="text-sm text-gray-700">
                                  by {listing.volunteer.name || "Anonymous"}
                                </span>
                              </div>
                            )}
                            <Button
                              className="w-full bg-[#E55937] hover:bg-[#E55937]/90"
                              asChild
                            >
                              {listing.stripePaymentLink ? (
                                <Link href={listing.stripePaymentLink} target="_blank" rel="noopener noreferrer">
                                  Buy Now
                                </Link>
                              ) : (
                                <span>Payment Link Not Available</span>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 