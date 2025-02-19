import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { TextEncoder, TextDecoder } from 'util'
import React from 'react'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }
  },
  headers() {
    return new Headers()
  },
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme() {
    return {
      theme: 'light',
      setTheme: jest.fn(),
      themes: ['light', 'dark'],
    }
  },
}))

// Mock date-fns
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

// Mock recharts for chart components
jest.mock('recharts', () => {
  const MockComponent = ({ children }: { children?: React.ReactNode }) => 
    React.createElement('div', {}, children)

  return {
    ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => 
      React.createElement('div', { 'data-testid': 'responsive-container' }, children),
    LineChart: ({ children }: { children?: React.ReactNode }) => 
      React.createElement('div', { 'data-testid': 'line-chart' }, children),
    Line: () => React.createElement('div', { 'data-testid': 'line' }),
    XAxis: () => React.createElement('div', { 'data-testid': 'x-axis' }),
    YAxis: () => React.createElement('div', { 'data-testid': 'y-axis' }),
    Tooltip: () => React.createElement('div', { 'data-testid': 'tooltip' }),
    CartesianGrid: () => React.createElement('div', { 'data-testid': 'cartesian-grid' }),
  }
})

// Setup environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Cleanup after each test
afterEach(() => {
  cleanup()
  jest.clearAllMocks()
}) 