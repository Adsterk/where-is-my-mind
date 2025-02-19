import {
  renderWithAuth,
  screen,
  waitFor,
  fireEvent,
  createMockSupabaseClient,
  simulateAuthError,
  simulateNetworkError,
} from '@/lib/test-utils';
import { RegisterForm } from '../register-form';

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form with all necessary fields', () => {
    renderWithAuth(<RegisterForm />);

    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithAuth(<RegisterForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithAuth(<RegisterForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('validates password requirements', async () => {
    renderWithAuth(<RegisterForm />);
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'weak' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('validates password match', async () => {
    renderWithAuth(<RegisterForm />);
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'DifferentPassword123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('completes successful registration', async () => {
    const mockClient = createMockSupabaseClient();
    renderWithAuth(<RegisterForm />, {
      supabaseClient: mockClient,
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'StrongPass123!' },
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'StrongPass123!',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/verification email sent/i)).toBeInTheDocument();
    });
  });

  it('handles registration errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateAuthError(mockClient);
    renderWithAuth(<RegisterForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'StrongPass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to create account/i)).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateNetworkError(mockClient);
    renderWithAuth(<RegisterForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'StrongPass123!' },
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('provides login link', () => {
    renderWithAuth(<RegisterForm />);
    
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in/i).closest('a')).toHaveAttribute(
      'href',
      '/auth/login'
    );
  });
}); 