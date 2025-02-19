import React from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { SupabaseClient, User, Session, AuthError } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'
import { default as SupabaseProvider } from '@/components/providers/auth/SupabaseProvider'
import { createContext, useContext } from 'react'

export * from '@testing-library/react'

export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
}

type MockSupabaseClient = jest.Mocked<SupabaseClient<Database>>

interface TestContextType {
  supabase: MockSupabaseClient
  user: User | null
}

const TestContext = createContext<TestContextType | undefined>(undefined)

// Define the custom options we want to pass to renderWithAuth
interface CustomOptions {
  supabaseClient?: MockSupabaseClient
  initialSession?: User | null
  router?: {
    query?: Record<string, string>
    push?: jest.Mock
    replace?: jest.Mock
  }
}

// Create a type that includes both the custom options and the base render options
type RenderWithAuthOptions = Omit<RenderOptions, 'wrapper'> & CustomOptions

export function createMockSupabaseClient(): MockSupabaseClient {
  const mockSignUp = jest.fn()
  const mockSignIn = jest.fn()
  const mockSignOut = jest.fn()
  const mockResetPassword = jest.fn()
  const mockUpdateUser = jest.fn()
  const mockGetSession = jest.fn()
  const mockOnAuthStateChange = jest.fn()

  return {
    auth: {
      getSession: mockGetSession.mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
      signUp: mockSignUp.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      }),
      signInWithPassword: mockSignIn.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      }),
      signOut: mockSignOut.mockResolvedValue({ error: null }),
      resetPasswordForEmail: mockResetPassword.mockResolvedValue({ 
        data: {}, 
        error: null 
      }),
      updateUser: mockUpdateUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      }),
      onAuthStateChange: mockOnAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_IN', { user: mockUser })
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      }),
    },
  } as unknown as MockSupabaseClient
}

export function simulateAuthError(client: MockSupabaseClient) {
  const error = { name: 'AuthError', message: 'Invalid login credentials' }
  ;(client.auth.signInWithPassword as jest.Mock).mockRejectedValue(error)
  ;(client.auth.signUp as jest.Mock).mockRejectedValue(error)
  ;(client.auth.resetPasswordForEmail as jest.Mock).mockRejectedValue(error)
  ;(client.auth.updateUser as jest.Mock).mockRejectedValue(error)
}

export function simulateNetworkError(client: MockSupabaseClient) {
  const error = { name: 'NetworkError', message: 'Network error' }
  ;(client.auth.signInWithPassword as jest.Mock).mockRejectedValue(error)
  ;(client.auth.signUp as jest.Mock).mockRejectedValue(error)
  ;(client.auth.resetPasswordForEmail as jest.Mock).mockRejectedValue(error)
  ;(client.auth.updateUser as jest.Mock).mockRejectedValue(error)
}

// Test Provider component
function TestProvider({ 
  children,
  supabaseClient,
  user = null,
}: { 
  children: React.ReactNode
  supabaseClient: MockSupabaseClient
  user?: User | null
}) {
  return (
    <TestContext.Provider value={{ supabase: supabaseClient, user }}>
      {children}
    </TestContext.Provider>
  )
}

// Hook to use the test context
export const useTestContext = () => {
  const context = useContext(TestContext)
  if (context === undefined) {
    throw new Error('useTestContext must be used within a TestProvider')
  }
  return context
}

type RenderWithAuthFunction = {
  (
    ui: React.ReactElement,
    options?: RenderWithAuthOptions
  ): RenderResult & {
    rerender: (ui: React.ReactElement) => void
  }
}

export const renderWithAuth: RenderWithAuthFunction = (
  ui: React.ReactElement,
  {
    supabaseClient = createMockSupabaseClient(),
    initialSession = null,
    router = {
      push: jest.fn(),
      replace: jest.fn(),
      query: {},
    },
    ...renderOptions
  }: RenderWithAuthOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProvider supabaseClient={supabaseClient} user={initialSession}>
      {children}
    </TestProvider>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
} 