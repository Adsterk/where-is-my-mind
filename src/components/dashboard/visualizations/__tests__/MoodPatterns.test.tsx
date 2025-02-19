import { render, screen, waitFor } from '@testing-library/react'
import { MoodPatterns } from '../MoodPatterns'
import { useSupabase } from '@/components/providers'
import { createMockSupabaseClient } from '@/lib/test-utils'

// Mock the useSupabase hook
jest.mock('@/components/providers', () => ({
  useSupabase: jest.fn(),
}))

describe('MoodPatterns', () => {
  const mockDateRange = {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-07'),
  }

  const mockMoodData = [
    { mood_score: 7, date: '2024-01-01', is_bipolar_scale: false },
    { mood_score: 8, date: '2024-01-02', is_bipolar_scale: false },
    { mood_score: 6, date: '2024-01-03', is_bipolar_scale: false },
    { mood_score: 7, date: '2024-01-04', is_bipolar_scale: true },
    { mood_score: 5, date: '2024-01-05', is_bipolar_scale: true },
  ]

  beforeEach(() => {
    const mockClient = createMockSupabaseClient()
    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockClient,
      user: { id: 'test-user' },
    })
  })

  it('renders loading state initially', () => {
    render(<MoodPatterns dateRange={mockDateRange} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('analyzes and displays mood patterns', async () => {
    const mockClient = createMockSupabaseClient()
    ;(mockClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockMoodData,
                error: null,
              }),
            }),
          }),
        }),
      }),
    })

    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockClient,
      user: { id: 'test-user' },
    })

    render(<MoodPatterns dateRange={mockDateRange} />)

    await waitFor(() => {
      // Check for trend pattern
      expect(screen.getByText(/trend/i)).toBeInTheDocument()
      // Check for variability pattern
      expect(screen.getByText(/variability/i)).toBeInTheDocument()
      // Check for scale usage pattern
      expect(screen.getByText(/mixed entries/i)).toBeInTheDocument()
    })
  })

  it('handles error state', async () => {
    const mockClient = createMockSupabaseClient()
    ;(mockClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Failed to analyze patterns'),
              }),
            }),
          }),
        }),
      }),
    })

    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockClient,
      user: { id: 'test-user' },
    })

    render(<MoodPatterns dateRange={mockDateRange} />)

    await waitFor(() => {
      expect(screen.getByText(/failed to analyze patterns/i)).toBeInTheDocument()
    })
  })

  it('handles empty data state', async () => {
    const mockClient = createMockSupabaseClient()
    ;(mockClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      }),
    })

    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockClient,
      user: { id: 'test-user' },
    })

    render(<MoodPatterns dateRange={mockDateRange} />)

    await waitFor(() => {
      expect(screen.getByText(/no patterns detected/i)).toBeInTheDocument()
    })
  })
}) 