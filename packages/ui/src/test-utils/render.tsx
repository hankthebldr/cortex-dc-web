/**
 * Custom Render Function for Testing
 * Wraps components with necessary providers for testing
 */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

/**
 * All providers needed for testing UI components
 */
interface AllProvidersProps {
  children: ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  return (
    <MantineProvider>
      {children}
    </MantineProvider>
  );
};

/**
 * Custom render function that includes all necessary providers
 * Use this instead of @testing-library/react's render
 *
 * @example
 * import { render, screen } from '@/test-utils/render';
 *
 * test('component renders', () => {
 *   render(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeInTheDocument();
 * });
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render with our custom version
export { customRender as render };
