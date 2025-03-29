import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organization: true,
      },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ organization: user.organization });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { message: "Error fetching organization" },
      { status: 500 }
    );
  }
} 