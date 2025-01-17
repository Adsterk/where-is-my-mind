'use client'

import { Navigation } from '@/components/shared/Navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto py-6 px-4">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
} 