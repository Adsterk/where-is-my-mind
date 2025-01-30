import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/update-password',
]

// Define routes that are only accessible to non-authenticated users
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    // Check auth status using getUser for better security
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error

    const pathname = new URL(request.url).pathname

    // Handle protected routes
    const isPublicRoute = publicRoutes.includes(pathname)
    const isAuthRoute = authRoutes.includes(pathname)

    if (!user) {
      // If user is not logged in and trying to access a protected route
      if (!isPublicRoute) {
        const redirectUrl = new URL('/auth/login', request.url)
        // Add the original URL as a query parameter to redirect back after login
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      // If user is logged in and trying to access auth routes (login, register, etc.)
      if (isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return response
  } catch (error) {
    console.error('Auth error in middleware:', error)
    // If there's an error checking the session, treat it as not authenticated
    if (!publicRoutes.includes(new URL(request.url).pathname)) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
} 