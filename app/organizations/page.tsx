import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function OrganizationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!dbUser) {
    redirect("/auth/signin");
  }

  const organizations = await prisma.userOrganization.findMany({
    where: {
      userId: dbUser.id,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Organizations</h1>
      {organizations.length === 0 ? (
        <p className="text-gray-600">You are not a member of any organizations yet.</p>
      ) : (
        <div className="grid gap-4">
          {organizations.map((userOrg) => (
            <div
              key={userOrg.organization.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold">{userOrg.organization.name}</h2>
              <p className="text-gray-600">Role: {userOrg.role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 