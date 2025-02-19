import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { applySecurityHeaders } from '@/lib/auth/security-headers-config'

// Auth routes configuration
const AUTH_ROUTES = {
  signIn: '/auth/signin',
  signUp: '/auth/signup',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyEmail: '/auth/verify-email',
  callback: '/auth/callback',
} as const

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // Skip auth check for public routes and static files
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  let response = NextResponse.next()

  try {
    // Create a new supabase client with cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // Debug logging
    console.log('Middleware - Path:', pathname)
    console.log('Middleware - Session exists:', !!session)
    if (sessionError) console.log('Middleware - Session error:', sessionError)

    // If no session and not on an auth page, redirect to signin
    if (!session && !pathname.startsWith('/auth/')) {
      const redirectUrl = new URL(AUTH_ROUTES.signIn, req.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If has session and on an auth page, redirect to dashboard
    if (session && pathname.startsWith('/auth/')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // On error, redirect to signin without redirectedFrom to prevent loops
    const redirectUrl = new URL(AUTH_ROUTES.signIn, req.url)
    return NextResponse.redirect(redirectUrl)
  }
}

// Public routes that don't require authentication
function isPublicRoute(pathname: string): boolean {
  // Check if the path starts with any of these prefixes
  const publicPrefixes = [
    '/auth/',
    '/_next/',
    '/api/auth',
    '/api/health',
    '/api/webhook',
    '/favicon.ico',
    '/manifest.json',
    '/icons/',
    '/images/',
    '/robots.txt',
    '/sitemap.xml'
  ]

  if (pathname === '/') return true
  return publicPrefixes.some(prefix => pathname.startsWith(prefix))
}

// Configure middleware matching
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - public files with known extensions (.ico, .json, .svg, etc)
     */
    '/((?!_next/static|_next/image|manifest.json|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 