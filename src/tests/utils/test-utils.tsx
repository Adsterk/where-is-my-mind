import React from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {ui}
      <Toaster />
    </ThemeProvider>
  )
} 