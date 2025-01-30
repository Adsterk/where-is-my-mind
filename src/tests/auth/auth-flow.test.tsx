import {
  renderWithAuth,
  screen,
  waitFor,
  fireEvent,
  createMockSupabaseClient,
  simulateAuthError,
  simulateNetworkError,
  mockUser,
} from '@/tests/test-utils'
import { mockRouter } from '@/tests/setup'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'
import { EmailVerification } from '@/components/auth/email-verification'
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

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Registration Flow', () => {
    it('completes successful registration flow', async () => {
      const mockClient = createMockSupabaseClient()
      
      renderWithAuth(<RegisterForm />, {
        client: mockClient,
      })
      
      // Fill registration form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'StrongPass123!' },
      })
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'StrongPass123!' },
      })

      // Submit form
      fireEvent.submit(screen.getByRole('form'))

      await waitFor(() => {
        expect(mockClient.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'StrongPass123!',
        })
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/verify-email')
      })
    })
  })

  describe('Login Flow', () => {
    it('completes successful login flow with redirect', async () => {
      const mockClient = createMockSupabaseClient()
      
      renderWithAuth(<LoginForm />, {
        client: mockClient,
      })
      
      // Fill login form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'StrongPass123!' },
      })

      // Submit form
      fireEvent.submit(screen.getByRole('form'))

      await waitFor(() => {
        expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'StrongPass123!',
        })
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Password Reset Flow', () => {
    it('completes successful password reset flow', async () => {
      const mockClient = createMockSupabaseClient()
      
      // Step 1: Request password reset
      renderWithAuth(<ResetPasswordForm />, {
        client: mockClient,
      })
      
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.submit(screen.getByRole('form'))

      await waitFor(() => {
        expect(mockClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com'
        )
      })

      // Step 2: Update password
      renderWithAuth(<UpdatePasswordForm />, {
        client: mockClient,
      })
      
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'NewStrongPass123!' },
      })
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'NewStrongPass123!' },
      })
      fireEvent.submit(screen.getByRole('form'))

      await waitFor(() => {
        expect(mockClient.auth.updateUser).toHaveBeenCalledWith({
          password: 'NewStrongPass123!',
        })
      })
    })
  })

  describe('Protected Routes', () => {
    it('redirects to login when accessing dashboard without auth', async () => {
      const mockClient = createMockSupabaseClient()
      ;(mockClient.auth.getSession as jest.Mock).mockResolvedValueOnce({ 
        data: { session: null }, 
        error: null 
      })
      
      renderWithAuth(<DashboardPage />, {
        client: mockClient,
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
        client: mockClient,
        initialSession: mockUser,
      })

      await waitFor(() => {
        expect(screen.getByTestId('mock-mood-chart')).toBeInTheDocument()
        expect(screen.getByTestId('mock-mood-overview')).toBeInTheDocument()
        expect(screen.getByTestId('mock-mood-patterns')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const mockClient = createMockSupabaseClient()
      simulateNetworkError(mockClient)
      
      renderWithAuth(<LoginForm />, {
        client: mockClient,
      })
      
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      })
      fireEvent.submit(screen.getByRole('form'))

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('handles invalid credentials', async () => {
      const mockClient = createMockSupabaseClient()
      simulateAuthError(mockClient)
      
      renderWithAuth(<LoginForm />, {
        client: mockClient,
      })
      
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      })
      fireEvent.submit(screen.getByRole('form'))

      await waitFor(() => {
        expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument()
      })
    })
  })
}) 