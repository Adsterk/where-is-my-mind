import {
  renderWithAuth,
  screen,
  waitFor,
  fireEvent,
  createMockSupabaseClient,
  simulateAuthError,
  simulateNetworkError,
} from '@/lib/test-utils';
import { ResetPasswordForm } from '../reset-password-form';

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reset password form with email field', () => {
    renderWithAuth(<ResetPasswordForm />);

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('validates required email field', async () => {
    renderWithAuth(<ResetPasswordForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithAuth(<ResetPasswordForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('handles successful password reset request', async () => {
    const mockClient = createMockSupabaseClient();
    renderWithAuth(<ResetPasswordForm />, {
      supabaseClient: mockClient,
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/reset link sent/i)).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateNetworkError(mockClient);
    
    renderWithAuth(<ResetPasswordForm />, {
      supabaseClient: mockClient,
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('handles auth errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateAuthError(mockClient);
    
    renderWithAuth(<ResetPasswordForm />, {
      supabaseClient: mockClient,
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
    });
  });

  it('provides back to login link', () => {
    renderWithAuth(<ResetPasswordForm />);
    
    expect(screen.getByText(/back to login/i).closest('a')).toHaveAttribute(
      'href',
      '/auth/login'
    );
  });
}); 