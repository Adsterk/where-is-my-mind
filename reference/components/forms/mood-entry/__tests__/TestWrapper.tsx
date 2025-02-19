'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { FormEditProvider } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

interface TestWrapperProps {
  children: ReactNode
  initialEditing?: boolean
}

export function TestMoodEntryWrapper({ 
  children,
  initialEditing = true
}: TestWrapperProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <FormEditProvider initialEditing={initialEditing}>
        {children}
        <Toaster />
      </FormEditProvider>
    </ThemeProvider>
  )
} 