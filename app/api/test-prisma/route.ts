import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test the database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ status: "ok", message: "Database connection successful" });
  } catch (error) {
    console.error("Database connection test failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
