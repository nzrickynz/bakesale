import { NextResponse } from 'next/server'
import { PasswordResetService } from '@/lib/services/password-reset'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || '')
const passwordResetService = new PasswordResetService()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required'
        },
        { status: 400 }
      )
    }

    // Request password reset
    const resetRequest = await passwordResetService.requestReset(email)

    // If a reset was created (user exists), send the email
    if (resetRequest) {
      try {
        await resend.emails.send({
          from: 'Bakesale <noreply@bakesale.co.nz>',
          to: email,
          subject: 'Reset your Bakesale password',
          html: `
            <p>Hello ${resetRequest.user.name || ''},</p>
            <p>Someone requested a password reset for your Bakesale account.</p>
            <p>Click the link below to reset your password:</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetRequest.token}">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `
        })
      } catch (error) {
        console.error('Failed to send reset email:', error)
        // Delete the reset token if email fails
        await passwordResetService.delete({ token: resetRequest.token })
        throw new Error('Failed to send reset email')
      }
    }

    // Always return the same message for security
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link'
    })
  } catch (error) {
    console.error('[RESET_PASSWORD]', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process password reset request'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token and new password are required'
        },
        { status: 400 }
      )
    }

    try {
      const user = await passwordResetService.resetPassword(token, newPassword)
      return NextResponse.json({
        success: true,
        data: {
          email: user.email
        }
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid or expired reset token') {
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
    console.error('[RESET_PASSWORD]', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset password'
      },
      { status: 500 }
    )
  }
}
