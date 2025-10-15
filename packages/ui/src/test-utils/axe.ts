/**
 * Accessibility testing utilities using axe-core
 *
 * Note: axe-core is optional. Install with:
 * pnpm add -D axe-core jest-axe
 */

/**
 * Placeholder for axe accessibility tests
 * To enable, install axe-core and jest-axe:
 *
 * ```bash
 * pnpm add -D axe-core jest-axe
 * ```
 *
 * Then update this file with:
 *
 * ```typescript
 * import { configureAxe } from 'jest-axe';
 *
 * export const axe = configureAxe({
 *   rules: {
 *     // Disable rules if needed for specific tests
 *     'color-contrast': { enabled: false },
 *   },
 * });
 * ```
 *
 * Usage in tests:
 *
 * ```typescript
 * import { axe } from '@/test-utils/axe';
 *
 * it('should have no accessibility violations', async () => {
 *   const { container } = render(<Button>Click me</Button>);
 *   const results = await axe(container);
 *   expect(results).toHaveNoViolations();
 * });
 * ```
 */

export const axeHelper = {
  info: 'Install axe-core and jest-axe to enable accessibility testing',
  install: 'pnpm add -D axe-core jest-axe',
};
