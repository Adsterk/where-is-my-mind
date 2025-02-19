import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'
import { createMockSupabaseClient } from './supabase'
import userEvent from '@testing-library/user-event'

// Create a context for test-specific values
interface TestContextType {
  supabase: SupabaseClient<Database>
  user: any | null
}

const TestContext = React.createContext<TestContextType | undefined>(undefined)

// Props for the test wrapper
interface TestWrapperProps {
  children: React.ReactNode
  supabaseClient?: SupabaseClient<Database>
  initialSession?: any
}

// Loading component for tests
export function LoadingSpinner() {
  return <div role="status" className="animate-spin">Loading...</div>
}

// Test wrapper component
export function TestWrapper({ 
  children,
  supabaseClient = createMockSupabaseClient(),
  initialSession = null,
}: TestWrapperProps) {
  return (
    <TestContext.Provider value={{ 
      supabase: supabaseClient, 
      user: initialSession 
    }}>
      {children}
    </TestContext.Provider>
  )
}

// Custom render function that includes the wrapper
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  supabaseClient?: SupabaseClient<Database>
  initialSession?: any
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    supabaseClient = createMockSupabaseClient(),
    initialSession = null,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Setup user event instance
  const user = userEvent.setup()

  const renderResult = render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper
        supabaseClient={supabaseClient}
        initialSession={initialSession}
      >
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  })

  return {
    user,
    ...renderResult,
  }
}

// Hook to use the test context
export function useTestContext() {
  const context = React.useContext(TestContext)
  if (context === undefined) {
    throw new Error('useTestContext must be used within a TestWrapper')
  }
  return context
} 