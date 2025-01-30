import {
  renderWithAuth,
  screen,
  waitFor,
  fireEvent,
  createMockSupabaseClient,
  simulateAuthError,
  simulateNetworkError,
} from '@/tests/test-utils';
import { EmailVerification } from '@/components/auth/email-verification';

describe('EmailVerification', () => {
  const mockEmail = 'test@example.com';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email verification page with instructions', () => {
    renderWithAuth(<EmailVerification email={mockEmail} />);

    expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
    expect(screen.getByText(/verification link has been sent to/i)).toBeInTheDocument();
    expect(screen.getByText(mockEmail)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend email/i })).toBeInTheDocument();
  });

  it('handles resending verification email successfully', async () => {
    const mockClient = createMockSupabaseClient();
    renderWithAuth(<EmailVerification email={mockEmail} supabaseClient={mockClient} />);
    
    fireEvent.click(screen.getByRole('button', { name: /resend email/i }));

    expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockClient.auth.signUp).toHaveBeenCalledWith({
        email: mockEmail,
        password: expect.any(String),
      });
      expect(screen.getByText(/verification email has been resent/i)).toBeInTheDocument();
    });
  });

  it('handles auth errors when resending verification', async () => {
    const mockClient = createMockSupabaseClient();
    simulateAuthError(mockClient);
    renderWithAuth(<EmailVerification email={mockEmail} supabaseClient={mockClient} />);
    
    fireEvent.click(screen.getByRole('button', { name: /resend email/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to resend verification email/i)).toBeInTheDocument();
    });
  });

  it('handles network errors when resending verification', async () => {
    const mockClient = createMockSupabaseClient();
    simulateNetworkError(mockClient);
    renderWithAuth(<EmailVerification email={mockEmail} supabaseClient={mockClient} />);
    
    fireEvent.click(screen.getByRole('button', { name: /resend email/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('enforces resend cooldown period', async () => {
    const mockClient = createMockSupabaseClient();
    renderWithAuth(<EmailVerification email={mockEmail} supabaseClient={mockClient} />);
    
    // First click should work
    fireEvent.click(screen.getByRole('button', { name: /resend email/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/verification email has been resent/i)).toBeInTheDocument();
    });

    // Second immediate click should be disabled
    expect(screen.getByRole('button', { name: /resend email/i })).toBeDisabled();
    expect(screen.getByText(/please wait/i)).toBeInTheDocument();
  });

  it('provides back to login link', () => {
    renderWithAuth(<EmailVerification email={mockEmail} />);
    
    expect(screen.getByText(/back to login/i).closest('a')).toHaveAttribute(
      'href',
      '/auth/login'
    );
  });

  it('displays error when email prop is missing', () => {
    renderWithAuth(<EmailVerification />);
    
    expect(screen.getByText(/email address is missing/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend email/i })).toBeDisabled();
  });
}); 