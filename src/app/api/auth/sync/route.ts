import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Specify runtime for consistent behavior
export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { event, session } = await request.json()
    
    // Initialize Supabase client with cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            try {
              const cookieStore = await cookies()
              const cookie = cookieStore.get(name)
              return cookie?.value
            } catch (error) {
              console.error('Error getting cookie:', error)
              return undefined
            }
          },
          async set(name: string, value: string, options: CookieOptions) {
            try {
              const { sameSite, secure, ...restOptions } = options
              const cookieStore = await cookies()
              cookieStore.set({
                name,
                value,
                sameSite: sameSite ?? 'lax',
                secure: secure ?? process.env.NODE_ENV === 'production',
                ...restOptions
              })
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          async remove(name: string, options: CookieOptions) {
            try {
              const { sameSite, secure, ...restOptions } = options
              const cookieStore = await cookies()
              cookieStore.set({
                name,
                value: '',
                maxAge: 0,
                sameSite: sameSite ?? 'lax',
                secure: secure ?? process.env.NODE_ENV === 'production',
                ...restOptions
              })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          }
        }
      }
    )
    
    // If we have a session, set the auth cookie
    if (session) {
      const { data: { session: serverSession }, error } = await supabase.auth.setSession(session)
      if (error) throw error
      
      return NextResponse.json({ 
        message: 'Session synced successfully',
        user: serverSession?.user ?? null 
      })
    }
    
    return NextResponse.json({ message: 'No session to sync' })
  } catch (error) {
    console.error('Error syncing session:', error)
    return NextResponse.json(
      { error: 'Failed to sync session' },
      { status: 500 }
    )
  }
}

// Disable response caching
export const dynamic = 'force-dynamic' 