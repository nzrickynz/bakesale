import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Organization, UserOrganization } from "@prisma/client";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

type UserOrgWithOrg = UserOrganization & {
  organization: Organization;
};

export default async function OrganizationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const organizations = await prisma.userOrganization.findMany({
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
          href="/organizations/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
        >
          Create Organization
        </Link>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            You are not a member of any organizations yet.
          </p>
          <Link
            href="/organizations/new"
            className="inline-block mt-4 text-primary hover:underline"
          >
            Create your first organization
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {organizations.map((userOrg: UserOrgWithOrg) => (
            <div
              key={userOrg.organization.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {userOrg.organization.logoUrl && (
                  <img
                    src={userOrg.organization.logoUrl}
                    alt={userOrg.organization.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold">
                    {userOrg.organization.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {userOrg.organization.description}
                  </p>
                </div>
                <div className="ml-auto">
                  <Link
                    href={`/organizations/${userOrg.organization.id}`}
                    className="text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 