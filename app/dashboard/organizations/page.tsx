import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function OrganizationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  // First find the user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return null;
  }

  // Then get their organizations through the UserOrganization model
  const userOrganizations = await prisma.userOrganization.findMany({
    where: { userId: user.id },
    include: {
      organization: true,
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Organizations</h2>
        <div>
          <Link href="/dashboard/organizations/new">
            <Button className="bg-[#F15A2B] text-white hover:bg-[#F15A2B]/90">
              <Plus className="mr-2 h-4 w-4" />
              New Organization
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userOrganizations.map(({ organization }) => (
          <Link
            key={organization.id}
            href={`/dashboard/organizations/${organization.id}`}
            className="block"
          >
            <Card className="hover:bg-accent/5 transition-colors cursor-pointer bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">{organization.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {organization.description}
                </p>
                {organization.websiteUrl && (
                  <p className="text-sm text-gray-600 mt-2">
                    {organization.websiteUrl}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 