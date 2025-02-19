import { LoginForm } from '../login-form';
import {
  renderWithAuth,
  screen,
  waitFor,
  fireEvent,
  mockUser,
  createMockSupabaseClient,
  simulateAuthError,
  simulateNetworkError,
} from '@/lib/test-utils';

describe('LoginForm', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('renders login form with all necessary fields', () => {
    renderWithAuth(<LoginForm />);

    // Check for form elements
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithAuth(<LoginForm />);
    
    // Try to submit without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithAuth(<LoginForm />);
    
    // Enter invalid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });

    // Try to submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check for validation message
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    const mockClient = createMockSupabaseClient();
    renderWithAuth(<LoginForm supabaseClient={mockClient} />);
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check loading state
    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();

    // Verify successful login
    await waitFor(() => {
      expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles login errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateAuthError(mockClient);
    renderWithAuth(<LoginForm supabaseClient={mockClient} />);
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateNetworkError(mockClient);
    renderWithAuth(<LoginForm supabaseClient={mockClient} />);
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('provides password reset link', () => {
    renderWithAuth(<LoginForm />);
    
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i).closest('a')).toHaveAttribute(
      'href',
      '/auth/reset-password'
    );
  });

  it('provides registration link', () => {
    renderWithAuth(<LoginForm />);
    
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i).closest('a')).toHaveAttribute(
      'href',
      '/auth/register'
    );
  });
}); 