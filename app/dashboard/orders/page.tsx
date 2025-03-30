import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserOrganization, Donation } from "@prisma/client";
import { DataTable } from "./data-table";
import { columns } from "./columns";

type DonationWithRelations = Donation & {
  cause: {
    title: string;
    organization: {
      name: string;
    };
  };
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const userOrganizations = await prisma.userOrganization.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const orders = await prisma.donation.findMany({
    where: {
      cause: {
        organizationId: {
          in: userOrganizations.map((uo: UserOrganization) => uo.organizationId),
        },
      },
    },
    include: {
      cause: {
        include: {
          organization: true,
        },
      },
    },
  }) as DonationWithRelations[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <DataTable columns={columns} data={orders} />
    </div>
  );
} 