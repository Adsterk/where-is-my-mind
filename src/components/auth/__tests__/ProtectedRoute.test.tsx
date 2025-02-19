import {
  renderWithAuth,
  screen,
  waitFor,
  createMockSupabaseClient,
  mockUser,
} from '@/lib/test-utils'
import { mockRouter } from '@/lib/test-utils/setup'
import DashboardPage from '@/app/dashboard/page'

// Mock the charts components to avoid ResizeObserver issues
jest.mock('@/components/dashboard/charts/MoodChart', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-mood-chart">Mood Chart</div>,
}))

jest.mock('@/components/dashboard/charts/MoodOverview', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-mood-overview">Mood Overview</div>,
}))

jest.mock('@/components/dashboard/charts/MoodPatterns', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-mood-patterns">Mood Patterns</div>,
}))

describe('Protected Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to login when accessing dashboard without auth', async () => {
    const mockClient = createMockSupabaseClient()
    ;(mockClient.auth.getSession as jest.Mock).mockResolvedValueOnce({ 
      data: { session: null }, 
      error: null 
    })
    
    renderWithAuth(<DashboardPage />, {
      supabaseClient: mockClient,
    })

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('allows access to dashboard when authenticated', async () => {
    const mockClient = createMockSupabaseClient()
    ;(mockClient.auth.getSession as jest.Mock).mockResolvedValueOnce({ 
      data: { 
        session: { 
          user: mockUser,
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
        }
      }, 
      error: null 
    })
    
    renderWithAuth(<DashboardPage />, {
      supabaseClient: mockClient,
      initialSession: mockUser,
    })

    await waitFor(() => {
      expect(screen.getByTestId('mock-mood-chart')).toBeInTheDocument()
      expect(screen.getByTestId('mock-mood-overview')).toBeInTheDocument()
      expect(screen.getByTestId('mock-mood-patterns')).toBeInTheDocument()
    })
  })

  it('handles session expiry', async () => {
    const mockClient = createMockSupabaseClient()
    ;(mockClient.auth.getSession as jest.Mock)
      .mockResolvedValueOnce({ 
        data: { 
          session: { 
            user: mockUser,
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
          }
        }, 
        error: null 
      })
      .mockResolvedValueOnce({ 
        data: { session: null }, 
        error: { message: 'Session expired' } 
      })
    
    renderWithAuth(<DashboardPage />, {
      supabaseClient: mockClient,
      initialSession: mockUser,
    })

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
    })
  })
}) 