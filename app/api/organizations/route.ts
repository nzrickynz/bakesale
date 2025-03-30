import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("[ORGANIZATIONS_GET] Auth error:", authError);
      return NextResponse.json({ organizations: [] });
    }

    if (!user) {
      console.log("[ORGANIZATIONS_GET] No authenticated user");
      return NextResponse.json({ organizations: [] });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      console.log("[ORGANIZATIONS_GET] No database user found for auth user:", user.id);
      return NextResponse.json({ organizations: [] });
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

    console.log("[ORGANIZATIONS_GET] Found organizations:", organizations.length);
    return NextResponse.json({ organizations: organizations || [] });
  } catch (error) {
    console.error("[ORGANIZATIONS_GET] Unexpected error:", error);
    return NextResponse.json({ organizations: [] });
  }
} 