'use client'

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useSupabase } from '@/components/providers'
import { useRouter, usePathname } from 'next/navigation'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, user } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If user is authenticated and on an auth page, redirect to dashboard
    if (!isLoading && user && pathname.startsWith('/auth/')) {
      router.replace('/dashboard')
    }
  }, [isLoading, user, router, pathname])

  // Show loading state while checking auth
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." fullScreen />
  }

  // If user is authenticated, don't render auth pages
  if (user) {
    return <LoadingScreen message="Redirecting to dashboard..." fullScreen />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>
    </div>
  )
} 