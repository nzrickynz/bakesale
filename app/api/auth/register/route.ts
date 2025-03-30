import { NextResponse } from 'next/server'
import { signUp } from '@/lib/supabase-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
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
      return NextResponse.json(
        { error: 'Email, password, name, and organization name are required' },
        { status: 400 }
      )
    }

    // Create user account in Supabase Auth
    const authData = await signUp(email, password, name)

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account in authentication service' },
        { status: 500 }
      )
    }

    try {
      // Use a transaction to ensure all database operations succeed or fail together
      const result = await prisma.$transaction(async (tx) => {
        // Create user record in our database
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
        await tx.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: role || 'ORG_ADMIN',
          },
        })

        return { user, organization }
      })

      return NextResponse.json({
        user: result.user,
        organization: result.organization,
        message: 'Registration successful',
      })
    } catch (dbError: any) {
      console.error('Database error during registration:', dbError)
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Registration failed',
        details: error.stack || error.toString()
      },
      { status: 500 }
    )
  }
} 