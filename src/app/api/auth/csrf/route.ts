import { NextResponse } from 'next/server'
import { ServerCSRFManager } from '@/lib/auth/csrf-server'

export async function GET() {
  try {
    const token = ServerCSRFManager.generateToken()
    ServerCSRFManager.setCSRFCookie(token)
    
    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error generating CSRF token:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' 