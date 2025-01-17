import { createClient } from '@/lib/supabase/client'
import type { AuthError } from '@supabase/supabase-js'

export const authService = {
  async signIn(email: string, password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw this.handleError(error)
    return data
  },

  async signUp(email: string, password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw this.handleError(error)
    return data
  },

  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw this.handleError(error)
  },

  async getSession() {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw this.handleError(error)
    return session
  },

  async getUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw this.handleError(error)
    return user
  },

  handleError(error: AuthError) {
    console.error('Auth error:', error)
    return {
      message: error.message,
      status: error.status || 400
    }
  }
} 