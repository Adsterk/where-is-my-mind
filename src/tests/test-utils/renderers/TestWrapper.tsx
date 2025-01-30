import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';

interface TestWrapperProps {
  children: ReactNode;
}

/**
 * TestWrapper provides necessary context providers for testing components
 * Includes:
 * - ThemeProvider
 * - Toaster
 * Additional providers (e.g., AuthProvider) can be added as needed
 */
export function TestWrapper({ children }: TestWrapperProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
    </ThemeProvider>
  );
} 