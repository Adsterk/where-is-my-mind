export const sessionConfig = {
  timeoutDuration: 30 * 60 * 1000, // 30 minutes
  warningDuration: 5 * 60 * 1000,  // Show warning 5 minutes before timeout
  checkInterval: 60 * 1000,        // Check session every minute
  refreshInterval: 5 * 60 * 1000,  // Refresh session every 5 minutes if active
  redirectPath: '/auth/signin',
  cookieOptions: {
    sameSite: 'lax' as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  }
}

export interface SessionState {
  lastActivity: number
  warningShown: boolean
  timeoutId?: NodeJS.Timeout
  checkId?: NodeJS.Timeout
}

export const authConfig = {
  publicRoutes: [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/callback',
  ],
  protectedRoutes: [
    '/dashboard',
    '/dashboard/settings',
    '/form'
  ],
  defaultRedirectPath: '/dashboard'
} 