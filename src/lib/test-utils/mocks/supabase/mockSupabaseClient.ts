import { AuthError, AuthResponse, Session, User, SupabaseClient } from '@supabase/supabase-js';

export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
};

export const mockSession: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Create mock auth errors
export const mockAuthError = new AuthError('Invalid login credentials', 400);
mockAuthError.code = 'invalid_credentials';

export const createMockSupabaseClient = () => {
  const mockClient = {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn().mockImplementation((callback) => {
        callback('SIGNED_IN', mockSession);
        return { data: { subscription: { unsubscribe: jest.fn() } }, error: null };
      }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ data: {}, error: null }),
      updateUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    update: jest.fn().mockResolvedValue({ data: [], error: null }),
    upsert: jest.fn().mockResolvedValue({ data: [], error: null }),
    delete: jest.fn().mockResolvedValue({ data: [], error: null }),
    eq: jest.fn().mockReturnThis(),
  } as unknown as SupabaseClient;

  return mockClient;
};

// Helper function to simulate auth errors
export const simulateAuthError = (client: ReturnType<typeof createMockSupabaseClient>) => {
  client.auth.signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: mockAuthError });
  client.auth.signUp.mockResolvedValue({ data: { user: null, session: null }, error: mockAuthError });
};

// Helper function to simulate network errors
export const simulateNetworkError = (client: ReturnType<typeof createMockSupabaseClient>) => {
  const networkError = new AuthError('Failed to fetch', 0);
  networkError.name = 'NetworkError';
  networkError.code = 'network_error';
  
  client.auth.signInWithPassword.mockRejectedValue(networkError);
  client.auth.signUp.mockRejectedValue(networkError);
}; 
