import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'
import { jest } from '@jest/globals'

export const createMockSupabaseClient = () => {
  const mockClient = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    }),
    auth: {
      getSession: jest.fn().mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      }),
      signInWithPassword: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      signUp: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      signOut: jest.fn().mockResolvedValue({ 
        error: null 
      }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ 
        data: {}, 
        error: null 
      }),
      updateUser: jest.fn().mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      }),
      onAuthStateChange: jest.fn().mockImplementation((callback) => {
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      }),
    },
  } as unknown as SupabaseClient<Database>

  return mockClient
}

export const mockSupabaseResponse = <T>(data: T | null = null, error: any = null) => {
  return {
    data,
    error,
    count: data ? (Array.isArray(data) ? data.length : 1) : 0,
  }
}

// Helper to mock specific Supabase query chains
export const mockSupabaseQuery = (
  mockClient: SupabaseClient<Database>, 
  path: string[], 
  response: any
) => {
  let current = mockClient.from(path[0])
  
  for (const method of path.slice(1)) {
    if (typeof current[method] !== 'function') {
      current[method] = jest.fn()
    }
    if (method === path[path.length - 1]) {
      current[method].mockResolvedValue(response)
    } else {
      current[method].mockReturnThis()
    }
    current = current[method]()
  }
  
  return mockClient
}

// Helper to simulate errors
export const simulateAuthError = (client: SupabaseClient<Database>) => {
  const error = { message: 'Invalid login credentials' }
  ;(client.auth.signInWithPassword as jest.Mock).mockRejectedValue(error)
  ;(client.auth.signUp as jest.Mock).mockRejectedValue(error)
  ;(client.auth.resetPasswordForEmail as jest.Mock).mockRejectedValue(error)
  ;(client.auth.updateUser as jest.Mock).mockRejectedValue(error)
}

export const simulateNetworkError = (client: SupabaseClient<Database>) => {
  const error = { message: 'Network error' }
  ;(client.auth.signInWithPassword as jest.Mock).mockRejectedValue(error)
  ;(client.auth.signUp as jest.Mock).mockRejectedValue(error)
  ;(client.auth.resetPasswordForEmail as jest.Mock).mockRejectedValue(error)
  ;(client.auth.updateUser as jest.Mock).mockRejectedValue(error)
} 