'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { useSupabase } from '@/components/providers'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { auth } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      router.push('/dashboard')
    }
  }, [auth.isLoading, auth.isAuthenticated, router])

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    )
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