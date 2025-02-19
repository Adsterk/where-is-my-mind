import { render, screen, waitFor } from '@testing-library/react'
import { BasicStats } from '../BasicStats'
import { useSupabase } from '@/components/providers'
import { createMockSupabaseClient } from '@/lib/test-utils'

// Mock the useSupabase hook
jest.mock('@/components/providers', () => ({
  useSupabase: jest.fn(),
}))

describe('BasicStats', () => {
  const mockStatsData = [
    { mood_score: 7, is_bipolar_scale: false, created_at: '2024-01-01' },
    { mood_score: 8, is_bipolar_scale: false, created_at: '2024-01-02' },
    { mood_score: 6, is_bipolar_scale: false, created_at: '2024-01-03' },
    { mood_score: 7, is_bipolar_scale: true, created_at: '2024-01-04' },
    { mood_score: 5, is_bipolar_scale: true, created_at: '2024-01-05' },
  ]

  beforeEach(() => {
    const mockClient = createMockSupabaseClient()
    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockClient,
      user: { id: 'test-user' },
    })
  })

  it('renders loading state initially', () => {
    render(<BasicStats />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays basic mood statistics', async () => {
    const mockClient = createMockSupabaseClient()
    ;(mockClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          not: jest.fn().mockResolvedValue({
            data: mockStatsData,
            error: null,
          }),
        }),
      }),
    })

    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockClient,
      user: { id: 'test-user' },
    })

    render(<BasicStats />)

    await waitFor(() => {
      // Check for average mood
      expect(screen.getByText(/average mood/i)).toBeInTheDocument()
      // Check for total entries
      expect(screen.getByText('5')).toBeInTheDocument()
      // Check for regular scale entries
      expect(screen.getByText('3 regular')).toBeInTheDocument()
      // Check for bipolar scale entries
      expect(screen.getByText('2 bipolar')).toBeInTheDocument()
    })
  })

  it('handles error state', async () => {
    const mockClient = createMockSupabaseClient()
    ;(mockClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          not: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Failed to load stats'),
          }),
        }),
      }),
    })

    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockClient,
      user: { id: 'test-user' },
    })

    render(<BasicStats />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load stats/i)).toBeInTheDocument()
    })
  })

  it('handles empty data state', async () => {
    const mockClient = createMockSupabaseClient()
    ;(mockClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          not: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    })

    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockClient,
      user: { id: 'test-user' },
    })

    render(<BasicStats />)

    await waitFor(() => {
      expect(screen.getAllByText(/no data/i)).toHaveLength(4)
    })
  })

  it('calculates correct statistics', async () => {
    const mockClient = createMockSupabaseClient()
    ;(mockClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          not: jest.fn().mockResolvedValue({
            data: mockStatsData,
            error: null,
          }),
        }),
      }),
    })

    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockClient,
      user: { id: 'test-user' },
    })

    render(<BasicStats />)

    await waitFor(() => {
      // Average regular mood should be 7 ((7 + 8 + 6) / 3)
      expect(screen.getByText('7/10')).toBeInTheDocument()
      // Average bipolar mood should be 6 ((7 + 5) / 2)
      expect(screen.getByText('6')).toBeInTheDocument()
      // Total entries should be 5
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })
}) 