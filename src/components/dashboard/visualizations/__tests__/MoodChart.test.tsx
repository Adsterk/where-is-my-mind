import { render, screen, waitFor } from '@testing-library/react'
import { MoodChart } from '../MoodChart'
import { useSupabase } from '@/components/providers'
import { createMockSupabaseClient } from '@/lib/test-utils'

// Mock the Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

// Mock the useSupabase hook
jest.mock('@/components/providers', () => ({
  useSupabase: jest.fn(),
}))

describe('MoodChart', () => {
  const mockDateRange = {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-07'),
  }

  const mockMoodData = [
    { mood_score: 7, created_at: '2024-01-01', is_bipolar: false },
    { mood_score: 8, created_at: '2024-01-02', is_bipolar: false },
    { mood_score: 6, created_at: '2024-01-03', is_bipolar: false },
  ]

  beforeEach(() => {
    const mockClient = createMockSupabaseClient()
    ;(useSupabase as jest.Mock).mockReturnValue({
      supabase: mockClient,
      user: { id: 'test-user' },
    })
  })

  it('renders loading state initially', () => {
    render(<MoodChart dateRange={mockDateRange} />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders chart with mood data', async () => {
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

    render(<MoodChart dateRange={mockDateRange} />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
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
                error: new Error('Failed to load data'),
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

    render(<MoodChart dateRange={mockDateRange} />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load data/i)).toBeInTheDocument()
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

    render(<MoodChart dateRange={mockDateRange} />)

    await waitFor(() => {
      expect(screen.getByText(/no mood data available/i)).toBeInTheDocument()
    })
  })
}) 