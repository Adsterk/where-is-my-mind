import {
  renderWithAuth,
  screen,
  waitFor,
  fireEvent,
  createMockSupabaseClient,
  simulateAuthError,
  simulateNetworkError,
} from '@/tests/test-utils';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders password reset form with email field', () => {
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
    renderWithAuth(<ResetPasswordForm supabaseClient={mockClient} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it('handles auth errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateAuthError(mockClient);
    renderWithAuth(<ResetPasswordForm supabaseClient={mockClient} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to send reset link/i)).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateNetworkError(mockClient);
    renderWithAuth(<ResetPasswordForm supabaseClient={mockClient} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
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