import '@testing-library/jest-dom'

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