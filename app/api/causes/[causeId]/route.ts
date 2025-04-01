import { NextResponse } from "next/server";
import { CauseService } from "@/lib/services/cause";
import prisma from "@/lib/prisma";

const causeService = new CauseService();

export async function GET(
  request: Request,
  { params }: { params: { causeId: string } }
) {
  try {
    const cause = await causeService.findUnique({
      where: { id: params.causeId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
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