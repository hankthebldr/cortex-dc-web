# React Testing Guide
**Last Updated**: 2025-10-15
**Testing Stack**: Vitest + React Testing Library + Playwright

## Table of Contents
- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Test Types](#test-types)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Best Practices](#best-practices)
- [Running Tests](#running-tests)
- [Coverage Requirements](#coverage-requirements)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Testing Philosophy

Our testing strategy follows the **Testing Trophy** model:

```
       /\
      /  \ E2E Tests (Few)
     /____\
    /      \ Integration Tests (Some)
   /________\
  /          \ Unit Tests (Many)
 /____________\
   Static Analysis (TypeScript)
```

**Core Principles**:
1. **Test behavior, not implementation** - Test what users see and do
2. **Accessibility-first** - Use queries that promote accessible markup
3. **Confidence over coverage** - High coverage with meaningful tests
4. **Fast feedback** - Unit tests should run in milliseconds
5. **Maintainable** - Tests should be easy to understand and update

---

## Testing Stack

### Unit & Component Tests
- **Vitest** - Fast test runner with HMR
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - Realistic user interactions
- **@testing-library/jest-dom** - Custom DOM matchers
- **jsdom** - DOM implementation for Node

### E2E Tests
- **Playwright** - Cross-browser end-to-end testing
- **@playwright/test** - Test runner and utilities

### Coverage
- **@vitest/coverage-v8** - Code coverage reports
- **Target**: 80%+ lines, 80%+ functions, 75%+ branches

---

## Test Types

### 1. Unit Tests
Test individual functions, hooks, and utilities in isolation.

**Location**: `*.test.ts` files next to source code

**Example**:
```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('should format ISO string to readable date', () => {
    expect(formatDate('2025-10-15')).toBe('Oct 15, 2025');
  });
});
```

### 2. Component Tests
Test React components with user interactions.

**Location**: `**/__tests__/*.test.tsx` files

**Example**:
```typescript
// src/components/Button/__tests__/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Integration Tests
Test multiple components working together.

**Location**: `**/__tests__/integration/*.test.tsx`

**Example**:
```typescript
describe('POV Creation Flow', () => {
  it('should create POV with all steps', async () => {
    render(<POVCreationWizard />);

    // Step 1: Fill form
    await user.type(screen.getByLabelText(/pov name/i), 'Test POV');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: Configure
    // ... more steps

    // Verify POV created
    expect(await screen.findByText(/pov created/i)).toBeInTheDocument();
  });
});
```

### 4. E2E Tests
Test complete user flows in a real browser.

**Location**: `tests/e2e/**/*.spec.ts`

**Example**:
```typescript
// tests/e2e/pov-creation.spec.ts
import { test, expect } from '@playwright/test';

test('user can create a POV', async ({ page }) => {
  await page.goto('/povs/new');

  await page.fill('[name="name"]', 'Test POV');
  await page.click('button:has-text("Create")');

  await expect(page.locator('text=POV created')).toBeVisible();
});
```

---

## Writing Tests

### Test Structure

Follow the **Arrange-Act-Assert** (AAA) pattern:

```typescript
describe('Component', () => {
  it('should do something when action happens', async () => {
    // Arrange - Set up test data and render
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);

    // Act - Perform user action
    await user.click(screen.getByRole('button'));

    // Assert - Verify expected outcome
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Query Priority

Use queries in this order (most to least preferred):

1. **Accessible Queries** (Best - what users experience)
   - `getByRole` - Buttons, links, headings, etc.
   - `getByLabelText` - Form inputs
   - `getByPlaceholderText` - Form inputs with placeholder
   - `getByText` - Non-interactive text
   - `getByDisplayValue` - Form inputs with value

2. **Semantic Queries**
   - `getByAltText` - Images
   - `getByTitle` - Title attribute

3. **Test IDs** (Last resort - for complex cases)
   - `getByTestId` - data-testid attribute

**Example**:
```typescript
// ✅ Good - Accessible
const button = screen.getByRole('button', { name: /submit/i });
const input = screen.getByLabelText(/email/i);

// ❌ Bad - Not accessible
const button = screen.getByTestId('submit-button');
const input = screen.getByClassName('email-input');
```

### User Interactions

Always use `@testing-library/user-event` for interactions:

```typescript
import userEvent from '@testing-library/user-event';

it('should handle user interactions', async () => {
  const user = userEvent.setup();
  render(<Form />);

  // Typing
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');

  // Clicking
  await user.click(screen.getByRole('button', { name: /submit/i }));

  // Keyboard navigation
  await user.tab();
  await user.keyboard('{Enter}');

  // Selecting
  await user.selectOptions(screen.getByLabelText(/country/i), 'US');

  // Checking
  await user.click(screen.getByRole('checkbox', { name: /agree/i }));
});
```

### Async Testing

Use `findBy` queries for elements that appear asynchronously:

```typescript
it('should show success message after API call', async () => {
  render(<CreateForm />);

  await user.click(screen.getByRole('button', { name: /create/i }));

  // Wait for success message to appear
  expect(await screen.findByText(/created successfully/i)).toBeInTheDocument();
});
```

### Testing Accessibility

Verify ARIA attributes and keyboard navigation:

```typescript
it('should be accessible', async () => {
  const user = userEvent.setup();
  render(<Dialog title="Confirm">Are you sure?</Dialog>);

  // Check ARIA attributes
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(dialog).toHaveAttribute('aria-labelledby');

  // Check keyboard navigation
  const closeButton = screen.getByRole('button', { name: /close/i });
  closeButton.focus();
  expect(closeButton).toHaveFocus();

  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

---

## Test Utilities

### Custom Render

Use custom render from `@/test-utils` for components that need providers:

```typescript
import { render } from '@/test-utils';

it('should render with theme', () => {
  render(<Button>Click me</Button>, { theme: 'dark' });
  // Component is rendered with ThemeProvider
});
```

### Custom Matchers

Use jest-dom matchers for better assertions:

```typescript
// Check visibility
expect(element).toBeVisible();
expect(element).not.toBeInTheDocument();

// Check disabled state
expect(button).toBeDisabled();
expect(button).toBeEnabled();

// Check form values
expect(input).toHaveValue('test');
expect(checkbox).toBeChecked();

// Check attributes
expect(link).toHaveAttribute('href', '/about');
expect(element).toHaveClass('active');

// Check text content
expect(element).toHaveTextContent(/hello/i);
```

### Mocking

```typescript
import { vi } from 'vitest';

// Mock functions
const mockFn = vi.fn();
mockFn.mockReturnValue('result');
mockFn.mockResolvedValue('async result');

// Mock modules
vi.mock('./api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: [] })),
}));

// Mock timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.runAllTimers();
vi.useRealTimers();
```

---

## Best Practices

### DO ✅

1. **Test user-visible behavior**
   ```typescript
   // ✅ Good
   await user.click(screen.getByRole('button', { name: /add item/i }));
   expect(screen.getByText(/item added/i)).toBeInTheDocument();
   ```

2. **Use semantic queries**
   ```typescript
   // ✅ Good
   const button = screen.getByRole('button', { name: /submit/i });
   const input = screen.getByLabelText(/email/i);
   ```

3. **Test accessibility**
   ```typescript
   // ✅ Good
   expect(input).toHaveAttribute('aria-invalid', 'true');
   expect(input).toHaveAttribute('aria-describedby', 'error-message');
   ```

4. **Use descriptive test names**
   ```typescript
   // ✅ Good
   it('should show error message when email is invalid', () => {});
   ```

5. **Wait for async updates**
   ```typescript
   // ✅ Good
   expect(await screen.findByText(/success/i)).toBeInTheDocument();
   ```

### DON'T ❌

1. **Don't test implementation details**
   ```typescript
   // ❌ Bad - testing internal state
   expect(wrapper.state().isOpen).toBe(true);

   // ✅ Good - testing user-visible behavior
   expect(screen.getByRole('dialog')).toBeVisible();
   ```

2. **Don't use non-semantic selectors**
   ```typescript
   // ❌ Bad
   const button = screen.getByClassName('submit-btn');

   // ✅ Good
   const button = screen.getByRole('button', { name: /submit/i });
   ```

3. **Don't forget to await user events**
   ```typescript
   // ❌ Bad
   user.click(button); // Missing await!

   // ✅ Good
   await user.click(button);
   ```

4. **Don't use `waitFor` with non-deterministic checks**
   ```typescript
   // ❌ Bad
   await waitFor(() => expect(mockFn).toHaveBeenCalled());

   // ✅ Good
   expect(await screen.findByText(/success/i)).toBeInTheDocument();
   ```

5. **Don't test third-party libraries**
   ```typescript
   // ❌ Bad - testing React Router
   it('should navigate when Link is clicked', () => {});

   // ✅ Good - test your component's behavior
   it('should show user profile when profile link is clicked', () => {});
   ```

---

## Running Tests

### Unit & Component Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test Button.test.tsx

# Run tests matching pattern
pnpm test --grep="should render"
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run E2E tests in headed mode
pnpm test:e2e:headed

# Run E2E tests in debug mode
pnpm test:e2e:debug

# Run against local dev server
pnpm e2e:local
```

### Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
open coverage/index.html
```

---

## Coverage Requirements

### Thresholds

```javascript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 80,        // 80% of lines covered
    functions: 80,    // 80% of functions covered
    branches: 75,     // 75% of branches covered
    statements: 80,   // 80% of statements covered
  },
}
```

### What to Cover

**High Priority (aim for 100%)**:
- Business logic
- Form validation
- State management
- Error handling
- Edge cases

**Medium Priority (aim for 80%+)**:
- UI components
- Data transformations
- API clients
- Utility functions

**Low Priority (optional)**:
- Type definitions
- Constants
- Simple getters/setters
- Trivial wrappers

### Ignoring from Coverage

```typescript
/* istanbul ignore next */
function debugOnlyFunction() {
  // This function won't be counted in coverage
}
```

---

## Common Patterns

### Testing Forms

```typescript
it('should validate email on blur', async () => {
  const user = userEvent.setup();
  render(<SignupForm />);

  const emailInput = screen.getByLabelText(/email/i);

  await user.type(emailInput, 'invalid-email');
  await user.tab(); // Trigger blur

  expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email/i);
});
```

### Testing Modals

```typescript
it('should close modal on Escape key', async () => {
  const user = userEvent.setup();
  render(<Modal isOpen onClose={mockClose}>Content</Modal>);

  expect(screen.getByRole('dialog')).toBeInTheDocument();

  await user.keyboard('{Escape}');

  expect(mockClose).toHaveBeenCalledTimes(1);
});
```

### Testing Loading States

```typescript
it('should show loading spinner while fetching', async () => {
  render(<DataList />);

  // Loading state
  expect(screen.getByRole('progressbar')).toBeInTheDocument();

  // Loaded state
  expect(await screen.findByText(/data loaded/i)).toBeInTheDocument();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
```

### Testing Error States

```typescript
it('should show error message on API failure', async () => {
  vi.mocked(fetchData).mockRejectedValueOnce(new Error('API Error'));

  render(<DataList />);

  expect(await screen.findByRole('alert')).toHaveTextContent(/failed to load/i);
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});
```

### Testing Lists

```typescript
it('should render list of items', () => {
  const items = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ];

  render(<ItemList items={items} />);

  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  expect(screen.getByText('Item 1')).toBeInTheDocument();
  expect(screen.getByText('Item 2')).toBeInTheDocument();
});
```

---

## Troubleshooting

### "Cannot read properties of undefined"

**Problem**: `user` object is undefined

**Solution**: Ensure you're calling `userEvent.setup()`:
```typescript
const user = userEvent.setup();
await user.click(button);
```

### "Unable to find accessible element"

**Problem**: Element not found by role/label

**Solution**: Use `screen.logTestingPlaygroundURL()` to debug:
```typescript
render(<Component />);
screen.logTestingPlaygroundURL();
// Opens browser with query suggestions
```

### "Act warnings"

**Problem**: State updates not wrapped in `act()`

**Solution**: Use `await` with user events and `findBy` queries:
```typescript
await user.click(button);
expect(await screen.findByText(/success/i)).toBeInTheDocument();
```

### "Test timeout"

**Problem**: Async operation taking too long

**Solution**: Increase timeout or check for infinite loops:
```typescript
it('should load data', async () => {
  // ...
}, { timeout: 10000 }); // 10 second timeout
```

---

## Resources

- **React Testing Library**: https://testing-library.com/react
- **Vitest**: https://vitest.dev
- **Playwright**: https://playwright.dev
- **Testing Playground**: https://testing-playground.com
- **Common Mistakes**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

**Next Steps**:
1. Review existing tests and apply these patterns
2. Write tests for new features before implementation (TDD)
3. Run tests in CI/CD pipeline
4. Monitor coverage trends over time
5. Refactor tests as components evolve
