import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import Link from "next/link";
import { Facebook, Instagram, Globe } from "lucide-react";

interface Cause {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  organization: {
    id: string;
    name: string;
    description: string;
    logoUrl: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    websiteUrl: string | null;
  };
  listings: {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string | null;
    volunteer: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
    paymentLink: string | null;
  }[];
}

interface PageProps {
  params: {
    causeId: string;
  };
}

export default async function CausePage({ params }: PageProps) {
  const cause = await prisma.cause.findUnique({
    where: { 
      id: params.causeId,
      status: "ACTIVE"
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          facebookUrl: true,
          instagramUrl: true,
          websiteUrl: true,
        },
      },
      listings: {
        include: {
          volunteer: {
            select: {
              id: true,
              name: true,
              image: true,
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
    <div className="min-h-screen bg-[#F7F6F3] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cause Header */}
        <div className="mb-12">
          <div className="relative h-96 rounded-lg overflow-hidden mb-8">
            {cause.imageUrl ? (
              <Image
                src={cause.imageUrl}
                alt={cause.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {cause.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {cause.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Listings */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Available Items
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cause.listings.map((listing) => (
                <Card key={listing.id} className="bg-white">
                  <CardHeader className="p-0">
                    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                      {listing.imageUrl ? (
                        <Image
                          src={listing.imageUrl}
                          alt={listing.title}
                          fill
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-xl font-bold text-gray-900 mt-4">
                      {listing.title}
                    </CardTitle>
                    <p className="text-gray-600 mb-4">{listing.description}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-4">
                      ${listing.price.toFixed(2)}
                    </p>
                    <Button
                      asChild
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <a href={listing.paymentLink || "#"} target="_blank" rel="noopener noreferrer">
                        Buy Now
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar - Organization Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    {cause.organization.logoUrl ? (
                      <Image
                        src={cause.organization.logoUrl}
                        alt={cause.organization.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No logo</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-gray-900">{cause.organization.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Organization
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 mb-6">
                  {cause.organization.description}
                </p>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Connect with {cause.organization.name}
                  </h3>
                  <div className="flex gap-4">
                    {cause.organization.facebookUrl && (
                      <a
                        href={cause.organization.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#E55937]"
                      >
                        <Facebook className="w-6 h-6" />
                      </a>
                    )}
                    {cause.organization.instagramUrl && (
                      <a
                        href={cause.organization.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#E55937]"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                    )}
                    {cause.organization.websiteUrl && (
                      <a
                        href={cause.organization.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#E55937]"
                      >
                        <Globe className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 