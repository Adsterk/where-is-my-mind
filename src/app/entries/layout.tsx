'use client'

import { useEffect } from 'react'
import { useSupabase } from '@/components/providers'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared/Navigation'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

export default function EntriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/signin?redirectedFrom=/entries')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <LoadingScreen message="Loading..." fullScreen />
  }

  if (!user) {
    return <LoadingScreen message="Redirecting to sign in..." fullScreen />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 