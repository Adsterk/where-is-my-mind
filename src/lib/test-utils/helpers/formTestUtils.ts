import { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';
import { renderWithAuth } from '../renderers/renderWithAuth';
import React from 'react';

/**
 * Setup utility for form testing that includes user event setup
 * and all necessary providers
 */
export const setupFormTest = (ui: ReactElement) => {
  const user = userEvent.setup();
  return {
    user,
    ...renderWithAuth(ui),
  };
};

/**
 * Hydration test utility for server components
 */
export const testHydration = (
  Component: React.ComponentType,
  props: Record<string, unknown>
) => {
  const { renderToString } = require('react-dom/server');
  const element = React.createElement(Component, props);
  const serverHTML = renderToString(element);
  const { container } = renderWithAuth(element);
  
  const serverTree = normalizeHTML(serverHTML);
  const clientTree = normalizeHTML(container.innerHTML);
  
  return {
    matches: serverTree === clientTree,
    serverTree,
    clientTree,
  };
};

/**
 * Helper function to normalize HTML for comparison
 */
function normalizeHTML(html: string) {
  return html
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
} 