import { screen, waitFor } from '@testing-library/react'
import { RecentEntries } from '../RecentEntries'
import { renderWithProviders } from '@/lib/test-utils/TestWrapper'
import { createMockSupabaseClient } from '@/lib/test-utils/supabase'

// Mock the providers module
jest.mock('@/components/providers', () => {
  const mockSupabase = {
    supabase: null,
    user: null,
  }

  return {
    useSupabase: () => mockSupabase,
    __setMockSupabase: (supabase: any, user: any) => {
      mockSupabase.supabase = supabase
      mockSupabase.user = user
    },
  }
})

// Mock date-fns to ensure consistent date formatting
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'MMM d, yyyy') {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    return new Date(date).toLocaleDateString()
  },
}))

describe('RecentEntries', () => {
  const mockEntries = [
    {
      id: '1',
      user_id: 'test-user',
      mood_score: 7,
      is_bipolar: false,
      date: '2024-02-07',
      tracking_data: {
        mood: {
          notes: 'Feeling good today',
        },
      },
      created_at: '2024-02-07T12:00:00Z',
    },
    {
      id: '2',
      user_id: 'test-user',
      mood_score: 4,
      is_bipolar: true,
      date: '2024-02-06',
      tracking_data: {
        mood: {
          notes: 'Rough day',
        },
      },
      created_at: '2024-02-06T12:00:00Z',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', async () => {
    const mockClient = createMockSupabaseClient()
    // Create a promise that won't resolve immediately
    const loadingPromise = new Promise(resolve => {
      setTimeout(() => {
        resolve({ data: mockEntries, error: null })
      }, 100)
    })

    mockClient.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue(loadingPromise),
          }),
        }),
      }),
    })

    require('@/components/providers').__setMockSupabase(mockClient, { id: 'test-user' })
    renderWithProviders(<RecentEntries />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays recent entries correctly', async () => {
    const mockClient = createMockSupabaseClient()
    mockClient.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: mockEntries, error: null }),
          }),
        }),
      }),
    })

    require('@/components/providers').__setMockSupabase(mockClient, { id: 'test-user' })
    renderWithProviders(<RecentEntries />)

    // First check loading state
    expect(screen.getByRole('status')).toBeInTheDocument()

    // Then check the rendered entries
    await waitFor(() => {
      expect(screen.getByText('Feb 7, 2024')).toBeInTheDocument()
      expect(screen.getByText('Feb 6, 2024')).toBeInTheDocument()
      expect(screen.getByText('7/10')).toBeInTheDocument()
      expect(screen.getByText('Depression Level 4')).toBeInTheDocument()
      expect(screen.getByText('Feeling good today')).toBeInTheDocument()
      expect(screen.getByText('Rough day')).toBeInTheDocument()
    })

    // Verify Supabase was called correctly
    expect(mockClient.from).toHaveBeenCalledWith('daily_entries')
  })

  it('handles error state', async () => {
    const mockClient = createMockSupabaseClient()
    mockClient.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ 
              data: null, 
              error: new Error('Failed to load entries') 
            }),
          }),
        }),
      }),
    })

    require('@/components/providers').__setMockSupabase(mockClient, { id: 'test-user' })
    renderWithProviders(<RecentEntries />)

    // First check loading state
    expect(screen.getByRole('status')).toBeInTheDocument()

    // Then check error state
    await waitFor(() => {
      expect(screen.getByText(/failed to load entries/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })

  it('handles empty entries state', async () => {
    const mockClient = createMockSupabaseClient()
    mockClient.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    })

    require('@/components/providers').__setMockSupabase(mockClient, { id: 'test-user' })
    renderWithProviders(<RecentEntries />)

    // First check loading state
    expect(screen.getByRole('status')).toBeInTheDocument()

    // Then check empty state
    await waitFor(() => {
      expect(screen.getByText(/no entries recorded yet/i)).toBeInTheDocument()
      expect(screen.getByText(/record your first entry/i)).toBeInTheDocument()
    })
  })

  it('returns null when no user is present', async () => {
    require('@/components/providers').__setMockSupabase(createMockSupabaseClient(), null)
    renderWithProviders(<RecentEntries />)

    expect(screen.queryByText(/recent entries/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('allows retrying when error occurs', async () => {
    const mockClient = createMockSupabaseClient()
    const mockSelect = jest.fn()
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ 
              data: null, 
              error: new Error('Failed to load entries') 
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: mockEntries, error: null }),
          }),
        }),
      })

    mockClient.from = jest.fn().mockReturnValue({ select: mockSelect })

    require('@/components/providers').__setMockSupabase(mockClient, { id: 'test-user' })
    const { user } = renderWithProviders(<RecentEntries />)

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed to load entries/i)).toBeInTheDocument()
    })

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i })
    await user.click(retryButton)

    // Check that entries are loaded
    await waitFor(() => {
      expect(screen.getByText('Feeling good today')).toBeInTheDocument()
      expect(screen.getByText('Rough day')).toBeInTheDocument()
    })

    // Verify Supabase was called twice
    expect(mockClient.from).toHaveBeenCalledTimes(2)
    expect(mockClient.from).toHaveBeenCalledWith('daily_entries')
  })

  describe('mood score display', () => {
    it('displays balanced state for bipolar mood score of 5', async () => {
      const balancedEntry = [{
        id: '3',
        user_id: 'test-user',
        mood_score: 5,
        is_bipolar: true,
        date: '2024-02-08',
        tracking_data: { mood: { notes: 'Feeling balanced' } },
        created_at: '2024-02-08T12:00:00Z',
      }]

      const mockClient = createMockSupabaseClient()
      mockClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: balancedEntry, error: null }),
            }),
          }),
        }),
      })

      require('@/components/providers').__setMockSupabase(mockClient, { id: 'test-user' })
      renderWithProviders(<RecentEntries />)

      await waitFor(() => {
        expect(screen.getByText('Balanced')).toBeInTheDocument()
      })
    })

    it('displays depression level for bipolar mood score less than 5', async () => {
      const depressionEntry = [{
        id: '4',
        user_id: 'test-user',
        mood_score: 2,
        is_bipolar: true,
        date: '2024-02-09',
        tracking_data: { mood: { notes: 'Feeling very low' } },
        created_at: '2024-02-09T12:00:00Z',
      }]

      const mockClient = createMockSupabaseClient()
      mockClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: depressionEntry, error: null }),
            }),
          }),
        }),
      })

      require('@/components/providers').__setMockSupabase(mockClient, { id: 'test-user' })
      renderWithProviders(<RecentEntries />)

      await waitFor(() => {
        expect(screen.getByText('Depression Level 2')).toBeInTheDocument()
      })
    })

    it('displays mania level for bipolar mood score greater than 5', async () => {
      const maniaEntry = [{
        id: '5',
        user_id: 'test-user',
        mood_score: 8,
        is_bipolar: true,
        date: '2024-02-10',
        tracking_data: { mood: { notes: 'Feeling very energetic' } },
        created_at: '2024-02-10T12:00:00Z',
      }]

      const mockClient = createMockSupabaseClient()
      mockClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: maniaEntry, error: null }),
            }),
          }),
        }),
      })

      require('@/components/providers').__setMockSupabase(mockClient, { id: 'test-user' })
      renderWithProviders(<RecentEntries />)

      await waitFor(() => {
        expect(screen.getByText('Mania Level 8')).toBeInTheDocument()
      })
    })

    it('displays "No mood recorded" when mood score is missing', async () => {
      const noMoodEntry = [{
        id: '6',
        user_id: 'test-user',
        mood_score: null,
        is_bipolar: false,
        date: '2024-02-11',
        tracking_data: { mood: { notes: 'No mood recorded today' } },
        created_at: '2024-02-11T12:00:00Z',
      }]

      const mockClient = createMockSupabaseClient()
      mockClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: noMoodEntry, error: null }),
            }),
          }),
        }),
      })

      require('@/components/providers').__setMockSupabase(mockClient, { id: 'test-user' })
      renderWithProviders(<RecentEntries />)

      await waitFor(() => {
        expect(screen.getByText('No mood recorded')).toBeInTheDocument()
      })
    })
  })
}) 