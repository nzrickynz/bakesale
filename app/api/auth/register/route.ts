import { NextResponse } from 'next/server'
import { z } from 'zod'
import { UserService } from '@/lib/services/user'
import { OrganizationService } from '@/lib/services/organization'
import { UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

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
  invitationToken: z.string().optional(),
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
      logoUrl,
      invitationToken
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

      // Hash password
      const hashedPassword = await hash(password, 12)

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: role === UserRole.ORG_ADMIN ? UserRole.ORG_ADMIN : UserRole.VOLUNTEER,
          organization: {
            connectOrCreate: {
              where: { name: organizationName },
              create: {
                name: organizationName,
                description: organizationDescription,
                websiteUrl,
                facebookUrl,
                instagramUrl,
                logoUrl,
              }
            }
          }
        }
      })

      // If there's an invitation token, handle the invitation
      if (invitationToken) {
        const invitation = await prisma.volunteerInvitation.findFirst({
          where: {
            token: invitationToken,
            status: 'PENDING',
            expiresAt: {
              gt: new Date()
            }
          }
        })

        if (invitation) {
          // Add user to organization
          await prisma.userOrganization.create({
            data: {
              userId: user.id,
              organizationId: invitation.organizationId,
              role: invitation.role
            }
          })

          // Update invitation
          await prisma.volunteerInvitation.update({
            where: { id: invitation.id },
            data: {
              status: 'ACCEPTED',
              acceptedAt: new Date(),
              invitedUserId: user.id
            }
          })
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          organization: {
            id: existingOrg.id,
            name: existingOrg.name
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