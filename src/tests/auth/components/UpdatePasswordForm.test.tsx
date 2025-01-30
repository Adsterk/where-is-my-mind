import {
  renderWithAuth,
  screen,
  waitFor,
  fireEvent,
  createMockSupabaseClient,
  simulateAuthError,
  simulateNetworkError,
} from '@/tests/test-utils';
import { UpdatePasswordForm } from '@/components/auth/update-password-form';

describe('UpdatePasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders update password form with all necessary fields', () => {
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
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'DifferentPass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('handles successful password update', async () => {
    const mockClient = createMockSupabaseClient();
    renderWithAuth(<UpdatePasswordForm supabaseClient={mockClient} />);
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'StrongPass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    expect(screen.getByRole('button', { name: /updating/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockClient.auth.updateUser).toHaveBeenCalledWith({
        password: 'StrongPass123!',
      });
    });
  });

  it('handles auth errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateAuthError(mockClient);
    renderWithAuth(<UpdatePasswordForm supabaseClient={mockClient} />);
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'StrongPass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to update password/i)).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    const mockClient = createMockSupabaseClient();
    simulateNetworkError(mockClient);
    renderWithAuth(<UpdatePasswordForm supabaseClient={mockClient} />);
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'StrongPass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
}); 