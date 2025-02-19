import {
  renderWithAuth,
  screen,
  waitFor,
  fireEvent,
  createMockSupabaseClient,
  simulateAuthError,
  simulateNetworkError,
} from '@/lib/test-utils';
import { UpdatePasswordForm } from '../update-password-form';

describe('UpdatePasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders update password form with all fields', () => {
    renderWithAuth(<UpdatePasswordForm />);

    expect(screen.getByRole('heading', { name: /update password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithAuth(<UpdatePasswordForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
    });
  });

  it('validates password requirements', async () => {
    renderWithAuth(<UpdatePasswordForm />);
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'weak' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('validates password match', async () => {
    renderWithAuth(<UpdatePasswordForm />);
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'DifferentPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('handles successful password update', async () => {
    const mockClient = createMockSupabaseClient();
    renderWithAuth(<UpdatePasswordForm />, {
      supabaseClient: mockClient,
    });
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'NewPassword123!' },
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockClient.auth.updateUser).toHaveBeenCalledWith({
        password: 'NewPassword123!',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateNetworkError(mockClient);
    
    renderWithAuth(<UpdatePasswordForm />, {
      supabaseClient: mockClient,
    });
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'NewPassword123!' },
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('handles auth errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateAuthError(mockClient);
    
    renderWithAuth(<UpdatePasswordForm />, {
      supabaseClient: mockClient,
    });
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'NewPassword123!' },
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
    });
  });

  it('provides back to login link', () => {
    renderWithAuth(<UpdatePasswordForm />);
    
    expect(screen.getByText(/back to login/i).closest('a')).toHaveAttribute(
      'href',
      '/auth/login'
    );
  });
}); 