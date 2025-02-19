import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { NextRequest } from 'next/server'

const CSRF_TOKEN_NAME = '__Host-csrf-token'

export class ServerCSRFManager {
  static generateToken(): string {
    return randomBytes(32).toString('hex')
  }

  static setCSRFCookie(token: string) {
    const cookieStore = cookies()
    cookieStore.set(CSRF_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
  }

  static getCSRFCookie(): string | undefined {
    const cookieStore = cookies()
    return cookieStore.get(CSRF_TOKEN_NAME)?.value
  }

  static validateRequest(request: NextRequest): boolean {
    const cookieToken = this.getCSRFCookie()
    const headerToken = request.headers.get('X-CSRF-Token')

    if (!cookieToken || !headerToken) {
      return false
    }

    return cookieToken === headerToken
  }

  static clearCSRFCookie() {
    const cookieStore = cookies()
    cookieStore.delete(CSRF_TOKEN_NAME)
  }
} 