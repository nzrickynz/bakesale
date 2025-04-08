import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cause, Listing, User } from "@prisma/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface CauseCardProps {
  cause: Cause & {
    listings: (Listing & {
      volunteer: User;
    })[];
  };
}

export function CauseCard({ cause }: CauseCardProps) {
  const activeListings = cause.listings;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          {cause.imageUrl ? (
            <Image
              src={cause.imageUrl}
              alt={cause.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-gray-600">No image</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900">{cause.title}</h3>
          <p className="text-sm text-gray-700 line-clamp-2">
            {cause.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{activeListings?.length} active listings</span>
            <span>•</span>
            <span>
              Started {formatDistanceToNow(cause.startDate, { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Active Volunteers</h4>
            <div className="flex -space-x-2">
              {activeListings?.slice(0, 3).map((listing) => (
                <Avatar key={listing.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={listing.volunteer.image || undefined} />
                  <AvatarFallback>
                    {listing.volunteer.name?.[0] || listing.volunteer.email[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              {activeListings?.length > 3 && (
                <p className="text-sm text-gray-600">
                  +{activeListings.length - 3} more
                </p>
              )}
            </div>
          </div>
          <Button asChild className="w-full">
            <Link href={`/causes/${cause.id}`}>View Cause</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 