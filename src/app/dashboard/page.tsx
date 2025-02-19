'use client'

import { useSupabase } from '@/components/providers'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

export default function DashboardPage() {
  const { user, isLoading } = useSupabase()

  // Show loading state while checking auth
  if (isLoading) {
    return <LoadingScreen message="Loading..." fullScreen />
  }

  // Auth check is handled by middleware, no need for client-side redirect
  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <DashboardContent />
    </div>
  )
} 