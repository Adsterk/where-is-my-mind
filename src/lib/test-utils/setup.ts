import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import React from 'react'
import userEvent from '@testing-library/user-event'

// Setup userEvent
beforeEach(() => {
  userEvent.setup()
})

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock fetch
global.fetch = jest.fn()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock console.error to fail tests on React errors
const originalError = console.error
console.error = (...args) => {
  originalError(...args)
  if (args[0]?.includes?.('Warning: ReactDOM.render is no longer supported')) {
    return
  }
  if (args[0]?.includes?.('Error: Uncaught [')) {
    throw new Error(args[0])
  }
}

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
      refresh: jest.fn(),
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

// Mock recharts
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

// Create a complete Storage mock implementation
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    length: 0,
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    // Additional methods to help with testing
    __getStore: () => store
  }
})()

// Cast the mock to Storage type to satisfy TypeScript
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.confirm
global.confirm = jest.fn(() => false)

// Reset all mocks and storage before each test
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
})

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
}

const mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
}))

// Export for use in tests
export { mockRouter, mockSearchParams, localStorageMock } 