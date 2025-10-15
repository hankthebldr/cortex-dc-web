/**
 * Custom render utilities for testing UI components
 * Wraps React Testing Library's render with common providers
 */

import * as React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Theme provider for components that need theme context
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

function ThemeProvider({ children, theme = 'light' }: ThemeProviderProps) {
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}

/**
 * Wrapper for all providers needed in tests
 */
interface AllProvidersProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

function AllProviders({ children, theme }: AllProvidersProps) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

/**
 * Custom render options
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark';
}

/**
 * Custom render function that includes common providers
 */
export function render(
  ui: React.ReactElement,
  { theme, ...options }: CustomRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllProviders theme={theme}>{children}</AllProviders>
  );

  const result = rtlRender(ui, { wrapper: Wrapper, ...options });
  const user = userEvent.setup();

  return {
    ...result,
    user,
  };
}

export * from '@testing-library/react';
export { userEvent };
