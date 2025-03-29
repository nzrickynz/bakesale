import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { causeId: string } }
) {
  try {
    const cause = await prisma.cause.findUnique({
      where: { id: params.causeId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            stripeAccountId: true,
          },
        },
      },
    });

    if (!cause) {
      return NextResponse.json(
        { message: "Cause not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ cause });
  } catch (error) {
    console.error("Error fetching cause:", error);
    return NextResponse.json(
      { message: "Error fetching cause" },
      { status: 500 }
    );
  }
} 