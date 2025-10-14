# UI Testing Quick Start Guide

Get started with UI testing in the Cortex DC Web Platform in 5 minutes.

## Installation

```bash
# From the root of the monorepo
cd packages/ui

# Install dependencies (if not already installed)
pnpm install
```

## Run Your First Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (recommended for development)
pnpm test:watch

# Run tests with UI (opens browser interface)
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

## Writing Your First Test

### 1. Component Test Example

Create a test file next to your component:

```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<MyComponent onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Run Your Test

```bash
pnpm test MyComponent
```

## Common Testing Patterns

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('handles form submission', async () => {
  const handleSubmit = vi.fn();
  const user = userEvent.setup();

  render(<Form onSubmit={handleSubmit} />);

  // Type into input
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');

  // Click button
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
  });
});
```

### Testing Async Behavior

```typescript
import { waitFor } from '@testing-library/react';

it('loads data asynchronously', async () => {
  render(<DataComponent />);

  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Using Mock Data

```typescript
import { createMockPOV } from '@/test-utils';

it('displays POV information', () => {
  const mockPOV = createMockPOV({
    name: 'Custom POV',
    status: 'active',
  });

  render(<POVCard pov={mockPOV} />);

  expect(screen.getByText('Custom POV')).toBeInTheDocument();
  expect(screen.getByText('active')).toBeInTheDocument();
});
```

## Useful Queries

### Query Priority (use in this order)

1. **getByRole** - Most accessible and robust
   ```typescript
   screen.getByRole('button', { name: /submit/i })
   screen.getByRole('textbox', { name: /email/i })
   ```

2. **getByLabelText** - For form fields
   ```typescript
   screen.getByLabelText(/email address/i)
   ```

3. **getByPlaceholderText** - For inputs with placeholders
   ```typescript
   screen.getByPlaceholderText(/enter your email/i)
   ```

4. **getByText** - For non-interactive content
   ```typescript
   screen.getByText(/welcome back/i)
   ```

5. **getByTestId** - Last resort only
   ```typescript
   screen.getByTestId('custom-element')
   ```

## Debugging Tests

### 1. Use screen.debug()

```typescript
it('debugs component output', () => {
  render(<Component />);
  screen.debug(); // Prints DOM to console
});
```

### 2. Use Testing Playground

```typescript
import { screen } from '@testing-library/react';

it('suggests better queries', () => {
  render(<Component />);
  screen.logTestingPlaygroundURL(); // Opens browser with suggestions
});
```

### 3. Check What Queries Are Available

```typescript
it('shows available queries', () => {
  const { container } = render(<Component />);
  console.log(screen);
  // Shows all getBy*, queryBy*, findBy* methods
});
```

## Common Pitfalls and Solutions

### ❌ Problem: Test fails with "not wrapped in act()"

```typescript
// Bad
it('updates state', () => {
  render(<Component />);
  fireEvent.click(screen.getByRole('button'));
  // State update happens after assertion
});
```

✅ **Solution:** Use `userEvent` and `await`

```typescript
// Good
it('updates state', async () => {
  const user = userEvent.setup();
  render(<Component />);
  await user.click(screen.getByRole('button'));
});
```

### ❌ Problem: Can't find element

```typescript
// Bad - element might not be in DOM yet
expect(screen.getByText('Loaded')).toBeInTheDocument();
```

✅ **Solution:** Use `findBy` for async elements

```typescript
// Good
expect(await screen.findByText('Loaded')).toBeInTheDocument();
```

### ❌ Problem: Testing implementation details

```typescript
// Bad - tests internal state
expect(component.state.count).toBe(5);
```

✅ **Solution:** Test what user sees

```typescript
// Good - tests user-visible behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

## Test Coverage

### View Coverage Report

```bash
pnpm test:coverage
```

### Coverage is saved to:
- HTML report: `coverage/index.html`
- LCOV format: `coverage/lcov.info`

### Minimum Coverage Thresholds

- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

## Next Steps

1. **Read the full strategy**: `UI_TESTING_STRATEGY.md`
2. **Write tests for your components**: Start with Button and Card examples
3. **Set up CI/CD**: Add tests to GitHub Actions
4. **Add E2E tests**: Install Playwright for critical user journeys

## Cheat Sheet

```typescript
// Imports
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Render
render(<Component prop="value" />);

// Queries
screen.getByRole('button')                    // Throws if not found
screen.queryByRole('button')                  // Returns null if not found
await screen.findByRole('button')             // Async, waits for element

// User Events
const user = userEvent.setup();
await user.click(element);
await user.type(input, 'text');
await user.selectOptions(select, 'option1');
await user.upload(fileInput, file);

// Assertions
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('text');
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveAttribute('href', '/link');
expect(element).toHaveClass('class-name');

// Mocks
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg');
expect(mockFn).toHaveBeenCalledTimes(2);

// Async
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Custom Render with Providers
import { render } from '@/test-utils';
render(<Component />); // Wrapped with all providers

// Test Data
import { createMockPOV, createMockUser } from '@/test-utils';
const pov = createMockPOV({ name: 'Custom' });
```

## Help and Resources

- **Full Testing Strategy**: `UI_TESTING_STRATEGY.md`
- **Example Tests**: `packages/ui/src/components/__tests__/`
- **Vitest Docs**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/react
- **Testing Library Queries**: https://testing-library.com/docs/queries/about

## Questions?

Contact the development team or check the testing strategy document for more details.

---

**Happy Testing! 🎉**
