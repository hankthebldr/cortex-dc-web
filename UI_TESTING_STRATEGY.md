# UI Testing Best Practices for Cortex DC Web Platform

## Executive Summary

Comprehensive UI testing strategy for the Cortex DC Web Platform, covering component testing, integration testing, end-to-end testing, and visual regression testing for React/Next.js applications.

## Current Stack Analysis

### Frontend Stack
- **Framework**: Next.js 14.2 with React 18.2
- **UI Library**: @cortex-dc/ui (custom component library)
- **Component Libraries**: Radix UI, Mantine, Tremor React
- **Styling**: Tailwind CSS
- **State Management**: React hooks, Firebase
- **Build Tool**: Next.js (Turbopack)
- **Current Testing**: Storybook for component documentation

### Testing Gaps
❌ No unit tests for components
❌ No integration tests for user flows
❌ No E2E tests for critical paths
❌ No visual regression tests
❌ No accessibility testing
❌ No performance testing

## Recommended Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E (5%)  │  Playwright
                    │   Critical  │
                    │   Paths     │
                    └─────────────┘
                  ┌─────────────────┐
                  │  Integration    │  React Testing Library
                  │  Tests (25%)    │  + MSW
                  │  User Flows     │
                  └─────────────────┘
              ┌───────────────────────┐
              │   Component Tests     │  Vitest + RTL
              │   (60%)               │
              │   Unit Tests          │
              └───────────────────────┘
          ┌─────────────────────────────┐
          │   Static Analysis (10%)     │  TypeScript, ESLint
          │   Type Checking             │
          └─────────────────────────────┘
```

## Testing Framework Recommendations

### 1. Component & Unit Testing: **Vitest + React Testing Library**

**Why Vitest?**
- ✅ Native ESM support (matches Next.js)
- ✅ Fast execution with watch mode
- ✅ Compatible with Vite/Next.js tooling
- ✅ Jest-compatible API (easy migration)
- ✅ Built-in coverage reporting
- ✅ TypeScript first-class support
- ✅ Parallel test execution

**Why React Testing Library (RTL)?**
- ✅ Tests user behavior, not implementation
- ✅ Encourages accessible markup
- ✅ Excellent Next.js integration
- ✅ Active community and maintenance
- ✅ DOM testing utilities

**Installation:**
```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@cortex-dc/ui': path.resolve(__dirname, './packages/ui/src'),
    },
  },
});
```

### 2. Integration Testing: **React Testing Library + MSW**

**Mock Service Worker (MSW)**
- ✅ Intercepts network requests at service worker level
- ✅ Works in both tests and browser
- ✅ Realistic API mocking
- ✅ Type-safe mocks with TypeScript

**Installation:**
```bash
pnpm add -D msw
```

**Setup:**
```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        users: [
          { id: '1', name: 'John Doe', email: 'john@example.com' },
        ],
      })
    );
  }),
];

// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### 3. End-to-End Testing: **Playwright**

**Why Playwright over Cypress?**
- ✅ Multi-browser support (Chrome, Firefox, Safari, Edge)
- ✅ Better performance and reliability
- ✅ Auto-wait for elements (no manual waits)
- ✅ Network interception built-in
- ✅ Parallel execution
- ✅ Video recording and screenshots
- ✅ Excellent TypeScript support
- ✅ Mobile device emulation
- ✅ Better CI/CD integration

**Installation:**
```bash
pnpm add -D @playwright/test
npx playwright install
```

**Configuration:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 4. Visual Regression Testing: **Playwright + Percy/Chromatic**

**Option A: Playwright Visual Comparisons (Built-in)**
- ✅ Free
- ✅ Fast
- ✅ Built into Playwright
- ❌ Basic diffing
- ❌ No cloud storage

**Option B: Percy by BrowserStack**
- ✅ Advanced diffing algorithms
- ✅ Cloud-based comparison
- ✅ Review UI for teams
- ✅ CI/CD integration
- ❌ Paid service

**Option C: Chromatic (for Storybook)**
- ✅ Perfect for component library
- ✅ Automatic visual testing
- ✅ Review UI
- ✅ Free tier available
- ✅ Storybook integration

**Recommendation:** Use **Chromatic** for component visual testing (you already have Storybook) + **Playwright built-in** for E2E visual testing.

### 5. Accessibility Testing: **axe-core + Playwright**

**Installation:**
```bash
pnpm add -D @axe-core/playwright
```

**Usage:**
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Testing Strategy by Layer

### 1. Component Testing (60% of tests)

**What to test:**
- ✅ Component renders correctly
- ✅ Props affect rendering as expected
- ✅ User interactions work (clicks, typing, etc.)
- ✅ Conditional rendering
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Error states
- ✅ Loading states

**What NOT to test:**
- ❌ Implementation details (state variables, function names)
- ❌ Third-party library internals
- ❌ CSS styling (use visual regression instead)
- ❌ Complex integration flows (use integration tests)

**Example: Button Component**
```typescript
// packages/ui/src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('has correct variant styles', () => {
    const { container } = render(<Button variant="primary">Click me</Button>);
    expect(container.firstChild).toHaveClass('bg-cortex-primary');
  });
});
```

**Example: Card Component**
```typescript
// packages/ui/src/components/__tests__/Card.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="Test Card">Content</Card>);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">Content</Card>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('is clickable when onClick is provided', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Card onClick={handleClick}>Content</Card>);

    await user.click(screen.getByText('Content'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### 2. Integration Testing (25% of tests)

**What to test:**
- ✅ User workflows across multiple components
- ✅ API integration with mocked responses
- ✅ Form submissions
- ✅ Navigation flows
- ✅ Data fetching and display
- ✅ Error handling flows

**Example: POV Creation Flow**
```typescript
// apps/web/src/__tests__/integration/pov-creation.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '@/mocks/server';
import { POVCreationWizard } from '@cortex-dc/ui';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('POV Creation Flow', () => {
  it('allows user to create a POV end-to-end', async () => {
    const user = userEvent.setup();

    render(<POVCreationWizard />);

    // Step 1: Basic Info
    await user.type(screen.getByLabelText(/pov name/i), 'Q1 2025 Security Assessment');
    await user.type(screen.getByLabelText(/customer name/i), 'Acme Corp');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: Timeline
    await user.click(screen.getByLabelText(/start date/i));
    await user.click(screen.getByText('15')); // Select day 15
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Scope
    await user.click(screen.getByText('Threat Detection'));
    await user.click(screen.getByText('Incident Response'));
    await user.click(screen.getByRole('button', { name: /create pov/i }));

    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/pov created successfully/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors for incomplete form', async () => {
    const user = userEvent.setup();

    render(<POVCreationWizard />);

    // Try to proceed without filling required fields
    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText(/pov name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/customer name is required/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    server.use(
      rest.post('/api/pov', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    const user = userEvent.setup();
    render(<POVCreationWizard />);

    // Fill form and submit
    await user.type(screen.getByLabelText(/pov name/i), 'Test POV');
    await user.type(screen.getByLabelText(/customer name/i), 'Test Customer');
    await user.click(screen.getByRole('button', { name: /next/i }));
    // ... complete other steps ...
    await user.click(screen.getByRole('button', { name: /create pov/i }));

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/failed to create pov/i)).toBeInTheDocument();
    });
  });
});
```

### 3. End-to-End Testing (5% of tests)

**Critical paths to test:**
1. Authentication flow (login/logout)
2. POV creation and management
3. Document upload and processing
4. Dashboard navigation
5. Data export functionality

**Example: Authentication Flow**
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow user to log in', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify user is logged in
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should allow user to log out', async ({ page, context }) => {
    // Mock authenticated state
    await context.addCookies([
      {
        name: 'auth_token',
        value: 'mock_token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/dashboard');

    // Click logout
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Log out');

    // Verify redirect to login
    await expect(page).toHaveURL('/login');
  });
});
```

**Example: Critical User Journey**
```typescript
// e2e/pov-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('POV Workflow', () => {
  test.use({ storageState: 'auth.json' }); // Reuse authentication

  test('complete POV lifecycle', async ({ page }) => {
    // 1. Navigate to POV page
    await page.goto('/pov');
    await expect(page).toHaveTitle(/POV Management/);

    // 2. Create new POV
    await page.click('button:has-text("Create POV")');
    await page.fill('input[name="povName"]', 'E2E Test POV');
    await page.fill('input[name="customerName"]', 'Test Customer');
    await page.click('button:has-text("Next")');

    // 3. Set timeline
    await page.click('input[name="startDate"]');
    await page.click('button:has-text("15")'); // Pick date
    await page.click('button:has-text("Next")');

    // 4. Select scope
    await page.click('text=Threat Detection');
    await page.click('button:has-text("Create POV")');

    // 5. Verify creation
    await expect(page.locator('text=POV created successfully')).toBeVisible();

    // 6. View POV details
    await page.click('text=E2E Test POV');
    await expect(page.locator('h1:has-text("E2E Test POV")')).toBeVisible();

    // 7. Update POV status
    await page.click('button:has-text("Update Status")');
    await page.click('text=In Progress');
    await expect(page.locator('text=Status updated')).toBeVisible();

    // 8. Delete POV
    await page.click('button[aria-label="More actions"]');
    await page.click('text=Delete');
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('text=POV deleted')).toBeVisible();
  });
});
```

### 4. Visual Regression Testing

**Playwright Visual Comparisons**
```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('dashboard matches baseline', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('dashboard.png');
  });

  test('POV card matches baseline', async ({ page }) => {
    await page.goto('/pov');
    const card = page.locator('.pov-card').first();
    await expect(card).toHaveScreenshot('pov-card.png');
  });

  test('button states match baseline', async ({ page }) => {
    await page.goto('/components/buttons');

    // Normal state
    await expect(page.locator('button.primary')).toHaveScreenshot('button-primary.png');

    // Hover state
    await page.hover('button.primary');
    await expect(page.locator('button.primary')).toHaveScreenshot('button-primary-hover.png');

    // Disabled state
    await expect(page.locator('button.primary:disabled')).toHaveScreenshot('button-primary-disabled.png');
  });
});
```

**Chromatic for Storybook**
```typescript
// .storybook/main.ts
export default {
  addons: [
    // ... other addons
    '@chromatic-com/storybook',
  ],
};

// package.json scripts
{
  "scripts": {
    "chromatic": "npx chromatic --project-token=YOUR_TOKEN"
  }
}
```

## Test Organization

### Directory Structure

```
cortex-dc-web/
├── packages/
│   └── ui/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Button.tsx
│       │   │   └── __tests__/
│       │   │       └── Button.test.tsx
│       │   └── __tests__/
│       │       └── integration/
│       ├── vitest.config.ts
│       └── vitest.setup.ts
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   └── __tests__/
│       │       ├── unit/
│       │       └── integration/
│       ├── e2e/
│       │   ├── auth.spec.ts
│       │   ├── pov.spec.ts
│       │   └── visual.spec.ts
│       ├── vitest.config.ts
│       └── playwright.config.ts
├── vitest.workspace.ts (monorepo config)
└── playwright.config.ts (global E2E config)
```

### Naming Conventions

```
Component tests:   ComponentName.test.tsx
Integration tests: feature-name.test.tsx
E2E tests:        feature-name.spec.ts
Mocks:            ComponentName.mock.ts
Fixtures:         feature-name.fixture.ts
```

## Testing Utilities

### Custom Render Function

```typescript
// packages/ui/src/test-utils/render.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineProvider>
      {children}
    </MantineProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Test Factories

```typescript
// packages/ui/src/test-utils/factories.ts
import { POV, User } from '../types';

export const createMockPOV = (overrides?: Partial<POV>): POV => ({
  id: '1',
  name: 'Test POV',
  customerName: 'Test Customer',
  status: 'active',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-03-31'),
  scope: ['Threat Detection'],
  ...overrides,
});

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: '1',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'user',
  ...overrides,
});
```

### Page Object Models (E2E)

```typescript
// e2e/pages/LoginPage.ts
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage() {
    return this.page.locator('[role="alert"]').textContent();
  }
}

// Usage in tests
test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
});
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: pnpm install

      - name: Run integration tests
        run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

      - name: Upload videos
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos
          path: test-results/

  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required for Chromatic

      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: pnpm install

      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: build-storybook
```

## Coverage Requirements

### Minimum Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
      exclude: [
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
        '**/__tests__/**',
        '**/mocks/**',
      ],
    },
  },
});
```

### Coverage by Component Type

- **Utility Functions**: 100% coverage
- **UI Components**: 85% coverage
- **Feature Components**: 80% coverage
- **Pages**: 70% coverage (E2E tests cover the rest)
- **API Routes**: 90% coverage

## Performance Testing

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: pnpm install

      - name: Build app
        run: pnpm build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/dashboard
            http://localhost:3000/pov
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Web Vitals Testing

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test('Core Web Vitals', async ({ page }) => {
  await page.goto('/');

  // Measure Web Vitals
  const webVitals = await page.evaluate(() => {
    return new Promise((resolve) => {
      const vitals = {};
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          vitals[entry.name] = entry.value;
        }
        if (Object.keys(vitals).length >= 3) {
          resolve(vitals);
        }
      }).observe({ entryTypes: ['web-vitals'] });
    });
  });

  // Assert thresholds
  expect(webVitals.LCP).toBeLessThan(2500); // Largest Contentful Paint
  expect(webVitals.FID).toBeLessThan(100);  // First Input Delay
  expect(webVitals.CLS).toBeLessThan(0.1);  // Cumulative Layout Shift
});
```

## Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad:**
```typescript
test('button changes color when clicked', () => {
  const { container } = render(<Button />);
  const button = container.querySelector('.button');
  expect(button.style.backgroundColor).toBe('blue');
});
```

✅ **Good:**
```typescript
test('button shows loading state when clicked', async () => {
  const handleClick = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
  render(<Button onClick={handleClick}>Submit</Button>);

  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
});
```

### 2. Use Accessible Queries

**Query Priority:**
1. `getByRole` (best)
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByDisplayValue`
6. `getByAltText`
7. `getByTitle`
8. `getByTestId` (last resort)

✅ **Good:**
```typescript
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email address/i)
screen.getByText(/welcome back/i)
```

### 3. Avoid Testing Library Implementation

❌ **Bad:**
```typescript
expect(mockSetState).toHaveBeenCalledWith(expect.anything());
```

✅ **Good:**
```typescript
expect(screen.getByText('Updated value')).toBeInTheDocument();
```

### 4. Clean Up After Tests

```typescript
afterEach(() => {
  vi.clearAllMocks();
  cleanup(); // RTL does this automatically
});

afterAll(() => {
  server.close(); // MSW server
});
```

### 5. Use Fake Timers for Time-Dependent Code

```typescript
test('shows success message after delay', async () => {
  vi.useFakeTimers();

  render(<Component />);
  await userEvent.click(screen.getByRole('button'));

  vi.advanceTimersByTime(2000);

  expect(screen.getByText('Success!')).toBeInTheDocument();

  vi.useRealTimers();
});
```

## Testing Checklist

### Before Merging a PR

- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Coverage meets minimum thresholds
- [ ] No console errors or warnings
- [ ] Accessibility tests pass
- [ ] Visual regression tests pass
- [ ] E2E tests for critical paths updated
- [ ] Test documentation updated

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Install Vitest and React Testing Library
- [ ] Create vitest.config.ts
- [ ] Set up test utilities (custom render, factories)
- [ ] Write first 5 component tests
- [ ] Configure CI/CD for unit tests

### Phase 2: Component Coverage (Weeks 2-3)
- [ ] Test all Button variants
- [ ] Test all Card components
- [ ] Test Form components
- [ ] Test Layout components
- [ ] Achieve 60% coverage on @cortex-dc/ui

### Phase 3: Integration Tests (Week 4)
- [ ] Install and configure MSW
- [ ] Create API mocks
- [ ] Write POV creation flow tests
- [ ] Write authentication flow tests
- [ ] Write data fetching tests

### Phase 4: E2E Tests (Week 5)
- [ ] Install Playwright
- [ ] Configure Playwright
- [ ] Create page object models
- [ ] Write critical path tests (auth, POV, dashboard)
- [ ] Add visual regression tests

### Phase 5: Advanced Testing (Week 6)
- [ ] Set up Chromatic
- [ ] Add accessibility tests
- [ ] Add performance tests
- [ ] Configure coverage reporting
- [ ] Document testing practices

## Resources

### Documentation
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [MSW](https://mswjs.io/)
- [Chromatic](https://www.chromatic.com/)

### Learning Resources
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

---

**Next Steps:**
1. Review this strategy with the team
2. Install dependencies (Phase 1)
3. Start with component tests for Button and Card
4. Gradually increase coverage
5. Add E2E tests for critical paths
6. Integrate into CI/CD pipeline

**Questions? Contact:** Development Team Lead
