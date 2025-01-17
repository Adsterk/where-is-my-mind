import { renderWithProviders } from './test-utils'
import userEvent from '@testing-library/user-event'

export const setupFormTest = (ui: React.ReactElement) => {
  const user = userEvent.setup()
  return {
    user,
    ...renderWithProviders(ui),
  }
} 