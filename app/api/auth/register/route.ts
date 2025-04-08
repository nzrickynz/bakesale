import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { UserRole, User, Organization } from '@prisma/client'
import { UserService } from '@/lib/services/user'
import { OrganizationService } from '@/lib/services/organization'

interface OrganizationResponse {
  id: string;
  name: string;
}

interface UserResponse {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  organization: OrganizationResponse | null;
}

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  invitationToken: z.string().optional(),
  organizationName: z.string().optional(),
  organizationDescription: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  facebookUrl: z.string().url().optional(),
  instagramUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
})

const userService = new UserService()

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const body = registerSchema.parse(json)

    const {
      email,
      password,
      name,
      invitationToken,
      organizationName,
      organizationDescription,
      websiteUrl,
      facebookUrl,
      instagramUrl,
      logoUrl,
    } = body

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new Error('User already exists')
      }

      let existingOrg: Organization | null = null
      let organization: Organization | null = null
      let user: User

      // Create user with organization if organization details are provided
      if (organizationName) {
        const existingOrgCheck = await prisma.organization.findFirst({
          where: { name: organizationName },
        })

        if (existingOrgCheck) {
          throw new Error('Organization already exists')
        }

        const result = await userService.createWithOrganization({
          email,
          password,
          name,
          role: UserRole.ORG_ADMIN,
          organization: {
            name: organizationName,
            description: organizationDescription || '',
            websiteUrl,
            facebookUrl,
            instagramUrl,
            logoUrl,
          },
        })

        user = result.user
        organization = result.organization
      } else {
        // Create user without organization
        const hashedPassword = await hash(password, 12)
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: hashedPassword,
            name,
            role: UserRole.PUBLIC,
          },
        })
      }

      // If there's an invitation token, handle the invitation
      if (invitationToken) {
        const invitation = await prisma.volunteerInvitation.findFirst({
          where: {
            token: invitationToken,
            status: 'PENDING',
            expiresAt: {
              gt: new Date()
            }
          },
          include: {
            organization: true
          }
        })

        if (invitation && invitation.organization) {
          existingOrg = invitation.organization

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

      const response: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: existingOrg ? {
          id: existingOrg.id,
          name: existingOrg.name,
        } : organization ? {
          id: organization.id,
          name: organization.name,
        } : null,
      }

      return NextResponse.json({ user: response });
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
      console.error('[REGISTER]', error)
      return NextResponse.json(
        { 
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create account' 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create account' 
      },
      { status: 500 }
    )
  }
} 