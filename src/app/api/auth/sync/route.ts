import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { event, session } = await request.json()
    
    // Initialize Supabase client with cookies
    const supabase = createRouteHandlerClient({ cookies })
    
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