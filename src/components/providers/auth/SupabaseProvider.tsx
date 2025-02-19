'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { cache } from '@/lib/cache'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { sessionConfig, type SessionState } from '@/lib/auth/config'

interface SupabaseContextType {
  supabase: ReturnType<typeof createBrowserClient<Database>>
  user: User | null
  isLoading: boolean
  revalidate: () => void
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const isInitialized = useRef(false)
  const { toast } = useToast()
  const sessionState = useRef<SessionState>({
    lastActivity: Date.now(),
    warningShown: false
  })

  // Function to force revalidation of all data
  const revalidate = () => {
    cache.clear()
    router.refresh()
  }

  // Auth initialization
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setIsLoading(false)
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            const currentUser = session?.user ?? null
            setUser(currentUser)
            setIsLoading(false)

            // Handle auth state changes
            if (event === 'SIGNED_IN') {
              cache.clear()
              if (pathname.startsWith('/auth/')) {
                router.push('/dashboard')
              } else {
                router.refresh()
              }
            } else if (event === 'SIGNED_OUT') {
              cache.clear()
              if (!pathname.startsWith('/auth/')) {
                router.push('/auth/signin')
              }
            } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              cache.clear()
              router.refresh()
            }
          }
        )

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [supabase, router, pathname])

  // Session timeout management
  useEffect(() => {
    if (!user) return

    const updateActivity = () => {
      sessionState.current.lastActivity = Date.now()
      sessionState.current.warningShown = false
    }

    // Activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'mousemove', 'touchstart']
    events.forEach(event => {
      window.addEventListener(event, updateActivity)
    })

    // Session check interval
    const checkSession = async () => {
      const now = Date.now()
      const timeSinceActivity = now - sessionState.current.lastActivity

      // Show warning before timeout
      if (timeSinceActivity >= (sessionConfig.timeoutDuration - sessionConfig.warningDuration) && 
          !sessionState.current.warningShown) {
        sessionState.current.warningShown = true
        toast({
          title: 'Session Expiring Soon',
          description: 'Your session will expire in 5 minutes due to inactivity.',
          duration: 0,
          action: (
            <ToastAction 
              altText="Keep session active"
              onClick={() => {
                updateActivity()
                supabase.auth.refreshSession()
              }}
            >
              Keep Session
            </ToastAction>
          )
        })
      }

      // Check for timeout
      if (timeSinceActivity >= sessionConfig.timeoutDuration) {
        await supabase.auth.signOut()
        router.push(sessionConfig.redirectPath)
        toast({
          title: 'Session Expired',
          description: 'Your session has expired due to inactivity. Please sign in again.',
          variant: 'destructive'
        })
        return
      }

      // Refresh session if needed
      if (timeSinceActivity >= sessionConfig.refreshInterval) {
        try {
          const { error } = await supabase.auth.refreshSession()
          if (error) throw error
          updateActivity()
        } catch (error) {
          console.error('Failed to refresh session:', error)
        }
      }
    }

    // Start session check interval
    const intervalId = setInterval(checkSession, sessionConfig.checkInterval)
    sessionState.current.checkId = intervalId

    // Visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (sessionState.current.checkId) {
        clearInterval(sessionState.current.checkId)
      }
    }
  }, [user, supabase, router, toast])

  return (
    <SupabaseContext.Provider value={{ supabase, user, isLoading, revalidate }}>
      {children}
    </SupabaseContext.Provider>
  )
} 