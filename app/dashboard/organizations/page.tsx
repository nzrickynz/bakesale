import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Organization, UserOrganization } from "@prisma/client";
import Link from "next/link";
import { Card } from "@/components/ui/card";

type UserOrgWithOrg = UserOrganization & {
  organization: Organization;
};

export default async function OrganizationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const userOrganizations = await prisma.userOrganization.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: true,
    },
  }) as UserOrgWithOrg[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <Link
          href="/dashboard/organizations/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
        >
          Create Organization
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userOrganizations.map(({ organization }: UserOrgWithOrg) => (
          <Link
            key={organization.id}
            href={`/dashboard/organizations/${organization.id}`}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                {organization.logoUrl && (
                  <img
                    src={organization.logoUrl}
                    alt={organization.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold">{organization.name}</h2>
                  <p className="text-sm text-gray-500">
                    {organization.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 