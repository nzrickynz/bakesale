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
      throw new Error('Failed to create user account')
    }

    // Create user record in our database
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name,
        passwordHash: '', // We don't store the password hash as Supabase handles it
        role: role || 'ORG_ADMIN',
      },
    })

    // Create organization
    const organization = await prisma.organization.create({
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
    await prisma.userOrganization.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: role || 'ORG_ADMIN',
      },
    })

    return NextResponse.json({
      user,
      organization,
      message: 'Registration successful',
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
} 