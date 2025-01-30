import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SupabaseClient, User, Session, AuthError } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'
import { SupabaseProvider } from '@/components/providers'

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

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  client?: MockSupabaseClient;
  initialSession?: User | null;
  router?: {
    query?: Record<string, string>;
    push?: jest.Mock;
    replace?: jest.Mock;
  };
}

type GetSessionResponse = {
  data: {
    session: Session | null;
  };
  error: AuthError | null;
}

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

export function renderWithAuth(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const mockPush = jest.fn()
  const mockReplace = jest.fn()

  const { 
    client = createMockSupabaseClient(), 
    initialSession = null,
    router = {
      push: mockPush,
      replace: mockReplace,
      query: {},
    }, 
    ...renderOptions 
  } = options

  // Create a wrapper component that includes all required providers
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
    <SupabaseProvider supabaseClient={client} initialSession={initialSession}>
      {children}
    </SupabaseProvider>
  )

  return render(ui, {
    wrapper: AllTheProviders,
    ...renderOptions,
  })
} 