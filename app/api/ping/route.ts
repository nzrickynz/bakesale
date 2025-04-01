import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Perform a lightweight query to keep the DB warm
    await prisma.user.findFirst({
      select: { id: true }
    });
    
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Ping failed:", error);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
} 