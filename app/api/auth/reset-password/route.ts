import { NextResponse } from 'next/server'
import { resetPassword } from '@/lib/supabase-auth'

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

    await resetPassword(email)

    return NextResponse.json({
      message: 'Password reset email sent',
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send reset email' },
      { status: 500 }
    )
  }
} 