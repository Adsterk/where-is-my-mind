import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { type User, type Session } from '@supabase/supabase-js'
import { type Database } from '@/lib/supabase/types'

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  return {
    supabase,
    user,
    session,
    loading,
  }
} 