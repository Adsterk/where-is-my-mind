// Re-export renderers
export { TestWrapper } from './renderers/TestWrapper';
export { renderWithAuth } from './renderers/renderWithAuth';

// Re-export helpers
export {
  wait,
  waitForPromises,
  generateTestEmail,
  generateTestPassword,
  clearAllMocks,
  mockConsole,
} from './helpers/testHelpers';

export {
  setupFormTest,
  testHydration,
} from './helpers/formTestUtils';

// Re-export mock data and utilities
export {
  mockUser,
  mockSession,
  mockAuthError,
  createMockSupabaseClient,
  simulateAuthError,
  simulateNetworkError,
} from '../mocks/supabase/mockSupabaseClient';

// Re-export testing-library utilities we commonly use
export {
  screen,
  within,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react'; 