import { NextResponse } from 'next/server'
import { z } from 'zod'
import { UserService } from '@/lib/services/user'
import { OrganizationService } from '@/lib/services/organization'
import { UserRole } from '@prisma/client'

// Validation schema for registration input
const registerSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .max(100, 'Password must be less than 100 characters'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  role: z.enum([UserRole.ORG_ADMIN, UserRole.VOLUNTEER]).optional(),
  organizationName: z.string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be less than 100 characters'),
  organizationDescription: z.string()
    .min(1, 'Organization description is required')
    .max(1000, 'Organization description must be less than 1000 characters'),
  websiteUrl: z.string().url().optional().nullable(),
  facebookUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
})

const userService = new UserService()
const organizationService = new OrganizationService()

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Validate request content type
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Content-Type must be application/json' 
        },
        { status: 400 }
      )
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON in request body' 
        },
        { status: 400 }
      )
    }

    // Validate input using Zod schema
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors?.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    const {
      email,
      password,
      name,
      role = UserRole.ORG_ADMIN,
      organizationName,
      organizationDescription,
      websiteUrl,
      facebookUrl,
      instagramUrl,
      logoUrl
    } = validationResult.data

    try {
      // Check if user already exists
      const existingUser = await userService.findByEmail(email)
      if (existingUser) {
        return NextResponse.json(
          { 
            success: false,
            error: 'User already exists' 
          },
          { status: 400 }
        )
      }

      // Check if organization name already exists
      const existingOrg = await organizationService.findByName(organizationName)
      if (existingOrg) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Organization already exists' 
          },
          { status: 400 }
        )
      }

      // Create user and organization
      const result = await userService.createWithOrganization({
        email,
        password,
        name,
        role,
        organization: {
          name: organizationName,
          description: organizationDescription,
          websiteUrl,
          facebookUrl,
          instagramUrl,
          logoUrl,
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role
          },
          organization: {
            id: result.organization.id,
            name: result.organization.name
          }
        }
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User already exists') {
          return NextResponse.json(
            { 
              success: false,
              error: error.message 
            },
            { status: 400 }
          )
        }
        if (error.message === 'Organization already exists') {
          return NextResponse.json(
            { 
              success: false,
              error: error.message 
            },
            { status: 400 }
          )
        }
      }
      throw error
    }
  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create account' 
      },
      { status: 500 }
    )
  }
} 