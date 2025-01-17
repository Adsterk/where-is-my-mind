import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { type Database } from './supabase/types'

export type AuthError = {
  message: string
  status?: number
}

export const createAuthClient = () => createClientComponentClient<Database>()

export async function signIn(email: string, password: string) {
  const supabase = createAuthClient()
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    if (!data.session) {
      throw new Error('No session returned')
    }

    // Verify the session immediately
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Failed to verify user')
    }
    
    return { session: data.session, user }
  } catch (error: any) {
    console.error('Sign in error:', error)
    throw {
      message: error.message || 'Authentication failed',
      status: error.status || 400
    }
  }
}

export async function signUp(email: string, password: string) {
  const supabase = createAuthClient()
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Sign up error:', error)
    throw {
      message: error.message || 'Registration failed',
      status: error.status || 400
    }
  }
}

export async function signOut() {
  const supabase = createAuthClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error: any) {
    console.error('Sign out error:', error)
    throw {
      message: error.message || 'Sign out failed',
      status: error.status || 400
    }
  }
}

export async function getUser() {
  const supabase = createAuthClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!user) throw new Error('No user found')
    return user
  } catch (error: any) {
    console.error('Get user error:', error)
    throw {
      message: error.message || 'Failed to get user',
      status: error.status || 401
    }
  }
}

export async function getSession() {
  const supabase = createAuthClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error: any) {
    console.error('Get session error:', error)
    throw {
      message: error.message || 'Failed to get session',
      status: error.status || 401
    }
  }
} 