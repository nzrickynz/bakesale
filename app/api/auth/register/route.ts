import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Log the raw request
    console.log("[REGISTER] Raw request headers:", Object.fromEntries(request.headers.entries()))
    
    // Validate request content type
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      console.error("[REGISTER] Invalid content type:", contentType)
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[REGISTER] Failed to parse request body:", parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Log the parsed request body
    console.log("[REGISTER] Parsed request body:", { 
      email: body.email, 
      name: body.name,
      hasPassword: !!body.password,
      hasOrgName: !!body.organizationName,
      organizationData: {
        name: body.organizationName,
        description: body.organizationDescription,
        websiteUrl: body.websiteUrl,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl
      }
    })
    
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

    // Validate required fields
    const missingFields = []
    if (!email) missingFields.push('email')
    if (!password) missingFields.push('password')
    if (!name) missingFields.push('name')
    if (!organizationName) missingFields.push('organizationName')

    if (missingFields.length > 0) {
      console.log("[REGISTER] Missing required fields:", missingFields)
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("[REGISTER] Invalid email format:", email)
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      console.log("[REGISTER] Password too short")
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    try {
      // Use a transaction to ensure all database operations succeed or fail together
      console.log("[REGISTER] Starting database transaction")
      const result = await prisma.$transaction(async (tx) => {
        // Check if user already exists
        const existingUser = await tx.user.findUnique({
          where: { email },
        })

        if (existingUser) {
          console.log("[REGISTER] User already exists:", email)
          throw new Error("User with this email already exists")
        }

        // Check if organization name already exists
        const existingOrg = await tx.organization.findUnique({
          where: { name: organizationName },
        })

        if (existingOrg) {
          console.log("[REGISTER] Organization already exists:", organizationName)
          throw new Error("Organization with this name already exists")
        }

        // Hash password
        console.log("[REGISTER] Hashing password")
        const hashedPassword = await hash(password, 12)

        // Create user record in our database
        console.log("[REGISTER] Creating database user record")
        const user = await tx.user.create({
          data: {
            email,
            name,
            passwordHash: hashedPassword,
            role: role || 'ORG_ADMIN',
          },
        })
        console.log("[REGISTER] Created database user:", { id: user.id, email: user.email })

        // Create organization with a default description if none provided
        console.log("[REGISTER] Creating organization with data:", {
          name: organizationName,
          description: organizationDescription || `${organizationName} is a charitable organization dedicated to making a positive impact in the community.`,
          websiteUrl,
          facebookUrl,
          instagramUrl,
          adminId: user.id,
        })

        const organization = await tx.organization.create({
          data: {
            name: organizationName,
            description: organizationDescription || `${organizationName} is a charitable organization dedicated to making a positive impact in the community.`,
            websiteUrl: websiteUrl || null,
            facebookUrl: facebookUrl || null,
            instagramUrl: instagramUrl || null,
            adminId: user.id,
          },
        })
        console.log("[REGISTER] Created organization:", { id: organization.id, name: organization.name })

        // Create user-organization relationship
        console.log("[REGISTER] Creating user-organization relationship")
        await tx.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: role || 'ORG_ADMIN',
          },
        })
        console.log("[REGISTER] Created user-organization relationship")

        return { user, organization }
      })

      console.log("[REGISTER] Successfully completed registration")
      return NextResponse.json({
        user: result.user,
        organization: result.organization,
        message: 'Registration successful',
      })
    } catch (dbError: any) {
      console.error('[REGISTER] Database error during registration:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
        stack: dbError.stack,
        name: dbError.name,
        cause: dbError.cause,
        target: dbError.target,
        clientVersion: dbError.clientVersion,
        prismaError: dbError
      })

      // Handle specific Prisma errors
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { 
            error: 'A user or organization with these details already exists',
            details: dbError.message
          },
          { status: 409 }
        )
      }

      if (dbError.code === 'P2003') {
        return NextResponse.json(
          { 
            error: 'Invalid reference to related record',
            details: dbError.message
          },
          { status: 400 }
        )
      }

      // Log the full error object for debugging
      console.error('[REGISTER] Full database error object:', JSON.stringify(dbError, null, 2))

      return NextResponse.json(
        { 
          error: 'Failed to create user profile and organization',
          details: dbError.message || dbError.toString(),
          code: dbError.code
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[REGISTER] Unexpected error during registration:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      error: JSON.stringify(error, null, 2)
    })
    return NextResponse.json(
      { 
        error: error.message || 'Registration failed',
        details: error.stack || error.toString()
      },
      { status: 500 }
    )
  }
} 