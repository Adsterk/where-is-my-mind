import { act } from '@testing-library/react';

/**
 * Wait for a specified amount of time
 * Useful for testing loading states, animations, etc.
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wait for all pending promises to resolve
 */
export const waitForPromises = () => act(() => Promise.resolve());

/**
 * Generate a random email for testing
 */
export const generateTestEmail = () => `test-${Date.now()}@example.com`;

/**
 * Generate a valid test password
 */
export const generateTestPassword = () => 'Test123!@#';

/**
 * Clear all mocks between tests
 */
export const clearAllMocks = () => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
};

/**
 * Mock console methods to suppress expected errors/warnings during tests
 */
export const mockConsole = () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });
}; 