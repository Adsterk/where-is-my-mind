import React from 'react'
import SupabaseProvider from '@/components/providers/SupabaseProvider'
import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mood Tracker',
  description: 'Track and analyze your daily moods',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
