import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const organizations = await prisma.userOrganization.findMany({
      where: {
        userId: user.id,
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

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("[ORGANIZATIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 