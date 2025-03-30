import { NextResponse } from 'next/server'
import { signUp } from '@/lib/supabase-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[REGISTER] Received registration request:", { email: body.email, name: body.name })
    
    const { 
      email, 
      password, 
      name,
      role,
      organizationName,
      organizationDescription,
      websiteUrl,
      facebookUrl,
      instagramUrl
    } = body

    if (!email || !password || !name || !organizationName) {
      console.log("[REGISTER] Missing required fields:", { email: !!email, password: !!password, name: !!name, organizationName: !!organizationName })
      return NextResponse.json(
        { error: 'Email, password, name, and organization name are required' },
        { status: 400 }
      )
    }

    // Create user account in Supabase Auth
    console.log("[REGISTER] Creating Supabase user account")
    const authData = await signUp(email, password, name)

    if (!authData.user) {
      console.error("[REGISTER] Failed to create Supabase user account")
      return NextResponse.json(
        { error: 'Failed to create user account in authentication service' },
        { status: 500 }
      )
    }

    console.log("[REGISTER] Created Supabase user:", authData.user.id)

    try {
      // Use a transaction to ensure all database operations succeed or fail together
      console.log("[REGISTER] Starting database transaction")
      const result = await prisma.$transaction(async (tx) => {
        // Create user record in our database
        console.log("[REGISTER] Creating database user record")
        const user = await tx.user.create({
          data: {
            id: authData.user!.id,
            email,
            name,
            passwordHash: '', // We don't store the password hash as Supabase handles it
            role: role || 'ORG_ADMIN',
          },
        })

        // Create organization
        console.log("[REGISTER] Creating organization")
        const organization = await tx.organization.create({
          data: {
            name: organizationName,
            description: organizationDescription || '',
            websiteUrl,
            facebookUrl,
            instagramUrl,
            adminId: user.id,
          },
        })

        // Create user-organization relationship
        console.log("[REGISTER] Creating user-organization relationship")
        await tx.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: role || 'ORG_ADMIN',
          },
        })

        return { user, organization }
      })

      console.log("[REGISTER] Successfully completed registration")
      return NextResponse.json({
        user: result.user,
        organization: result.organization,
        message: 'Registration successful',
      })
    } catch (dbError: any) {
      console.error('[REGISTER] Database error during registration:', dbError)
      // If database operations fail, we should clean up the Supabase user
      // TODO: Add cleanup of Supabase user
      return NextResponse.json(
        { 
          error: 'Failed to create user profile and organization',
          details: dbError.message || dbError.toString()
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[REGISTER] Unexpected error during registration:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Registration failed',
        details: error.stack || error.toString()
      },
      { status: 500 }
    )
  }
} 