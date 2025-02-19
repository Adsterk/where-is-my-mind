'use client'

import { useSupabase } from '@/components/providers'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import dynamic from 'next/dynamic'

// Lazy load the form component
const MoodEntryForm = dynamic(
  () => import('@/components/form/mood-entry/MoodEntryForm').then(mod => ({ default: mod.MoodEntryForm })),
  {
    loading: () => <LoadingScreen message="Loading form..." size="sm" />,
    ssr: false
  }
)

export default function MoodEntryPage() {
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
    <div className="lg:container lg:mx-auto lg:p-6">
      <MoodEntryForm />
    </div>
  )
} 