import { render, screen, waitFor, act } from '@testing-library/react'
import { SessionProvider, useSession } from '../SessionProvider'
import { createMockSupabaseClient, mockUser, mockSession } from '@/lib/test-utils/mocks/supabase/mockSupabaseClient'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}))

jest.mock('@/components/providers/auth/SupabaseProvider', () => ({
  useSupabase: () => ({
    supabase: createMockSupabaseClient(),
    user: mockUser,
  }),
}))

// Test component to access session context
function TestComponent() {
  const { sessionState } = useSession()
  return (
    <div>
      <span data-testid="session-active">{sessionState.isActive.toString()}</span>
      <span data-testid="session-expires">{sessionState.expiresAt}</span>
    </div>
  )
}

describe('SessionProvider', () => {
  const mockRouter = {
    push: jest.fn(),
  }
  const mockToast = {
    toast: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useToast as jest.Mock).mockReturnValue(mockToast)
  })

  it('initializes with inactive session', () => {
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    )

    expect(screen.getByTestId('session-active')).toHaveTextContent('false')
  })

  it('activates session on successful auth', async () => {
    const mockClient = createMockSupabaseClient()
    jest.spyOn(mockClient.auth, 'getSession').mockResolvedValueOnce({
      data: {
        session: {
          ...mockSession,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        },
      },
      error: null,
    })

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('session-active')).toHaveTextContent('true')
    })
  })

  it('handles session expiry', async () => {
    const mockClient = createMockSupabaseClient()
    jest.spyOn(mockClient.auth, 'getSession')
      .mockResolvedValueOnce({
        data: {
          session: {
            ...mockSession,
            expires_at: Math.floor(Date.now() / 1000) - 1, // Expired
          },
        },
        error: null,
      })

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    )

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Session Expired',
          variant: 'destructive',
        })
      )
    })
  })

  it('handles sign out', async () => {
    const mockClient = createMockSupabaseClient()
    const authStateChange = jest.spyOn(mockClient.auth, 'onAuthStateChange')

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    )

    // Simulate sign out
    act(() => {
      const callback = authStateChange.mock.calls[0][0]
      callback('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(screen.getByTestId('session-active')).toHaveTextContent('false')
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('refreshes session before expiry', async () => {
    jest.useFakeTimers()
    const mockClient = createMockSupabaseClient()
    const getSession = jest.spyOn(mockClient.auth, 'getSession')
      .mockResolvedValueOnce({
        data: {
          session: {
            ...mockSession,
            expires_at: Math.floor(Date.now() / 1000) + 300, // 5 minutes
          },
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          session: {
            ...mockSession,
            expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
          },
        },
        error: null,
      })

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    )

    // Fast-forward past the refresh interval
    act(() => {
      jest.advanceTimersByTime(60000) // 1 minute
    })

    await waitFor(() => {
      expect(getSession).toHaveBeenCalledTimes(2)
    })

    jest.useRealTimers()
  })
}) 