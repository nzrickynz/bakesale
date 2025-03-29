import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { sendTempPasswordEmail } from "@/lib/email";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email, causeId, organizationId } = await req.json();

    // Verify the user is an admin of the organization
    const { data: userOrg, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('organization_id', organizationId)
      .eq('role', 'ORG_ADMIN')
      .single();

    if (userOrgError || !userOrg) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the cause belongs to the organization
    const { data: cause, error: causeError } = await supabase
      .from('causes')
      .select('*')
      .eq('id', causeId)
      .eq('organization_id', organizationId)
      .single();

    if (causeError || !cause) {
      return new NextResponse("Cause not found", { status: 404 });
    }

    // Check if the user already exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let userId: string;

    if (userError || !user) {
      // Create a new user with a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await hashPassword(tempPassword);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash: hashedPassword,
            role: 'VOLUNTEER',
          },
        ])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      userId = newUser.id;

      // Send invitation email with temporary password
      await sendTempPasswordEmail({ email, tempPassword });
    } else {
      userId = user.id;
    }

    // Add user to organization if not already added
    const { error: upsertError } = await supabase
      .from('user_organizations')
      .upsert({
        user_id: userId,
        organization_id: organizationId,
        role: 'VOLUNTEER',
      });

    if (upsertError) {
      throw upsertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to add volunteer:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 