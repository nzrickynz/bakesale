import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SettingsForm } from "./settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TeamMembers } from "@/components/team-members";
import { Listing, Organization, User, UserRole, UserOrganization } from "@prisma/client";

type ListingWithCause = Listing & {
  cause: {
    title: string;
  };
};

type UserWithOrgs = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  adminOf: (UserOrganization & {
    organization: Organization;
  })[];
  managedListings: ListingWithCause[];
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userOrganizations: {
        where: {
          role: {
            in: ["ORG_ADMIN", "SUPER_ADMIN"],
          },
        },
        include: {
          organization: true,
        },
      },
      managedListings: {
        include: {
          cause: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  // Transform the user data to match the expected type
  const transformedUser: UserWithOrgs = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    adminOf: user.userOrganizations,
    managedListings: user.managedListings,
  };

  const organization = transformedUser.adminOf[0]?.organization;
  if (!organization) {
    return null;
  }

  // Get all listings for the organization
  const listings = await prisma.listing.findMany({
    where: {
      cause: {
        organizationId: organization.id,
      },
    },
    include: {
      cause: {
        select: {
          title: true,
        },
      },
    },
  });

  // Get all causes for the organization
  const causes = await prisma.cause.findMany({
    where: {
      organizationId: organization.id,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsForm user={transformedUser} causes={causes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamMembers 
              organizationId={organization.id}
              listings={listings}
              organizations={[organization]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 