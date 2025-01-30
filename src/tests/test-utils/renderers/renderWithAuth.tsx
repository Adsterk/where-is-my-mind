import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { TestWrapper } from './TestWrapper';

/**
 * Custom render function that includes auth-related providers
 * @param ui - The component to render
 * @param options - Additional render options
 */
export function renderWithAuth(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: TestWrapper,
    ...options,
  });
}

/**
 * Re-export everything from @testing-library/react
 */
export * from '@testing-library/react'; 