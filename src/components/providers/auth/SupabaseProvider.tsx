'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient, User, AuthError } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { useToast } from '@/components/ui/use-toast'

type AuthState = {
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  error: AuthError | null
}

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  auth: AuthState
  signOut: () => Promise<void>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/reset-password', '/auth/verify-email']

const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  error: null
}

export function SupabaseProvider({ 
  children,
  initialSession,
  supabaseClient
}: { 
  children: React.ReactNode
  initialSession?: User | null
  supabaseClient?: SupabaseClient<Database>
}) {
  const [auth, setAuth] = useState<AuthState>({
    ...initialState,
    isAuthenticated: !!initialSession,
    user: initialSession || null
  })
  const supabase = supabaseClient || createClient()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  const handleAuthStateChange = useCallback(async () => {
    // Skip auth check on public routes unless we have an initial session
    if (isPublicRoute && !initialSession) {
      setAuth(prev => ({ ...prev, isLoading: false }))
      return
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        // Only throw error if we're not on a public route
        if (!isPublicRoute) throw error
        // On public routes, just update state without error
        setAuth({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          error: null
        })
        return
      }

      const isAuthenticated = !!user
      setAuth({
        isLoading: false,
        isAuthenticated,
        user,
        error: null
      })

      // Only redirect on protected routes
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/auth/login')
      }
    } catch (error) {
      // Only log error if we're not on a public route
      if (!isPublicRoute) {
        console.error('Auth state change error:', error)
      }
      
      setAuth({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: error as AuthError
      })
      
      if (!isPublicRoute) {
        router.push('/auth/login')
      }
    }
  }, [supabase.auth, router, pathname, isPublicRoute, initialSession])

  // Initial auth check
  useEffect(() => {
    handleAuthStateChange()
  }, [handleAuthStateChange])

  // Subscribe to auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      await handleAuthStateChange()

      if (event === 'SIGNED_IN') {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        })
        router.push('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: 'Signed out',
          description: 'You have been signed out successfully.',
        })
        router.push('/auth/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, handleAuthStateChange, router, toast])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setAuth({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      })
      console.error('Sign out error:', error)
    }
  }

  return (
    <Context.Provider value={{ supabase, auth, signOut }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}

// Helper hook for protected routes
export const useRequireAuth = () => {
  const { auth } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      router.push('/auth/login')
    }
  }, [auth.isLoading, auth.isAuthenticated, router, pathname])

  return auth
} 