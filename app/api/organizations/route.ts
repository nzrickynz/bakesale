import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ organizations: [] });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
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

    return NextResponse.json({ organizations: organizations || [] });
  } catch (error) {
    console.error("[ORGANIZATIONS_GET]", error);
    return NextResponse.json({ organizations: [] });
  }
} 