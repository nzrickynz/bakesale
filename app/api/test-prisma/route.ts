import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        managedListings: true,
        userOrganizations: {
          include: {
            organization: {
              include: {
                causes: {
                  include: {
                    listings: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[TEST_PRISMA_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
