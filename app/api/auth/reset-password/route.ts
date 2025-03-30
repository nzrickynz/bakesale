import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Return success even if user not found for security
      return NextResponse.json({
        message: 'If an account exists with this email, you will receive a password reset link'
      })
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expires
      }
    })

    // Send reset email
    await resend.emails.send({
      from: 'Bakesale <noreply@bakesale.co.nz>',
      to: email,
      subject: 'Reset your Bakesale password',
      html: `
        <p>Hello,</p>
        <p>Someone requested a password reset for your Bakesale account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `
    })

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link'
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to send reset email' },
      { status: 500 }
    )
  }
} 