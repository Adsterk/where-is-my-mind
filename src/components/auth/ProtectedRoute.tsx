'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useSupabase()

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login')
    }
  }, [user, router])

  // Show loading state while checking auth
  if (!user) {
    return <LoadingSpinner />
  }

  return <>{children}</>
} 