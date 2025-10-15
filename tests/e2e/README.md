# E2E Testing with Playwright

This directory contains end-to-end tests for the Cortex DC Web platform using Playwright.

## Directory Structure

```
tests/e2e/
├── specs/                    # Test specifications
│   ├── auth/                # Authentication tests
│   │   ├── login.spec.ts
│   │   └── logout.spec.ts
│   ├── pov/                 # POV management tests
│   │   └── pov-management.spec.ts
│   └── dashboard/           # Dashboard tests
│       └── dashboard.spec.ts
├── fixtures/                 # Test data fixtures
│   └── users.ts             # Test user data
├── helpers/                  # Test helpers
│   ├── auth.ts              # Authentication helpers
│   └── navigation.ts        # Navigation helpers
├── playwright.config.ts      # Playwright configuration
├── global-setup.ts          # Global setup (runs once before all tests)
├── global-teardown.ts       # Global teardown (runs once after all tests)
└── README.md                # This file
```

## Quick Start

### Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run in UI mode (recommended for development)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Run in debug mode
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e tests/e2e/specs/auth/login.spec.ts

# Run tests for specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit

# View HTML report
pnpm report:e2e
```

### Prerequisites

1. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install
   ```

2. **Start dev server** (in separate terminal):
   ```bash
   pnpm dev
   ```

3. **Seed test users** (required for E2E tests):
   ```bash
   # Seed E2E test users specifically
   pnpm seed:e2e

   # Or seed all users (includes E2E + dev users)
   pnpm seed:users
   ```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../../helpers/auth';
import { goToDashboard } from '../../helpers/navigation';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginAsAdmin(page);
  });

  test('should do something', async ({ page }) => {
    // Navigate
    await goToDashboard(page);

    // Interact
    await page.click('[data-testid="action-button"]');

    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### Using Fixtures and Helpers

```typescript
import { test, expect } from '@playwright/test';
import { getAdminUser, getRegularUser } from '../../fixtures/users';
import { login, logout, assertLoggedIn } from '../../helpers/auth';
import { goToPOVList } from '../../helpers/navigation';

test('should access admin features', async ({ page }) => {
  const admin = getAdminUser();

  // Login with admin credentials
  await login(page, admin);

  // Verify logged in
  await assertLoggedIn(page);

  // Navigate to POV list
  await goToPOVList(page);

  // Check admin-only features are visible
  await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible();
});
```

### Best Practices

#### 1. Use Test IDs

Always use `data-testid` attributes for reliable selectors:

```typescript
// ✅ Good - uses data-testid
await page.click('[data-testid="submit-button"]');

// ❌ Bad - brittle CSS selector
await page.click('.btn.btn-primary.submit');
```

#### 2. Wait for Elements

Always wait for elements to be ready:

```typescript
// ✅ Good - waits for element
await page.waitForSelector('[data-testid="result"]');
await expect(page.locator('[data-testid="result"]')).toBeVisible();

// ❌ Bad - may fail if element not ready
await page.click('[data-testid="button"]');
```

#### 3. Use Page Object Pattern (for complex flows)

```typescript
class POVPage {
  constructor(private page: Page) {}

  async create(name: string, description: string) {
    await this.page.click('[data-testid="create-pov"]');
    await this.page.fill('[data-testid="pov-name"]', name);
    await this.page.fill('[data-testid="pov-description"]', description);
    await this.page.click('[data-testid="submit"]');
  }

  async assertCreated(name: string) {
    await expect(this.page.locator(`text=${name}`)).toBeVisible();
  }
}

// In test
test('should create POV', async ({ page }) => {
  const povPage = new POVPage(page);
  await povPage.create('Test POV', 'Description');
  await povPage.assertCreated('Test POV');
});
```

#### 4. Make Tests Independent

Each test should be able to run in isolation:

```typescript
// ✅ Good - test is self-contained
test('should create POV', async ({ page }) => {
  await loginAsAdmin(page);
  await goToPOVList(page);
  // ... test logic
});

// ❌ Bad - depends on previous test
test('should list POVs', async ({ page }) => {
  // Assumes already logged in from previous test
  await goToPOVList(page);
});
```

#### 5. Clean Up Test Data

```typescript
test('should create and delete POV', async ({ page }) => {
  await loginAsAdmin(page);

  // Create
  const povName = `Test POV ${Date.now()}`;
  await createPOV(page, povName);

  // Verify
  await expect(page.locator(`text=${povName}`)).toBeVisible();

  // Clean up
  await deletePOV(page, povName);
});
```

## Test Users

Test users are defined in `fixtures/users.ts`:

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@cortex.com | admin123 | admin |
| User | user@cortex.com | user123 | user |
| Viewer | viewer@cortex.com | viewer123 | viewer |
| Test | test@example.com | test123 | user |

**Note**: These users must be seeded in the test database using `pnpm seed:users`.

## Available Helpers

### Authentication Helpers (`helpers/auth.ts`)

- `login(page, user)` - Login with specific user
- `loginAsAdmin(page)` - Login as admin
- `loginAsUser(page)` - Login as regular user
- `logout(page)` - Logout
- `assertLoggedIn(page)` - Assert user is logged in
- `assertLoggedOut(page)` - Assert user is logged out
- `clearAuth(page)` - Clear all auth state

### Navigation Helpers (`helpers/navigation.ts`)

- `goToDashboard(page)` - Navigate to dashboard
- `goToPOVList(page)` - Navigate to POV list
- `goToTRRList(page)` - Navigate to TRR list
- `goToScenarios(page)` - Navigate to scenarios
- `goToSettings(page)` - Navigate to settings
- `goToLogin(page)` - Navigate to login page
- `goBack(page)` - Navigate back
- `goForward(page)` - Navigate forward
- `reload(page)` - Reload page
- `waitForPageLoad(page)` - Wait for page to fully load

## Debugging Tests

### 1. Use Playwright Inspector

```bash
pnpm test:e2e:debug
```

This opens the Playwright Inspector, allowing you to:
- Step through tests
- Inspect page state
- Try selectors
- View network requests

### 2. Use console.log

```typescript
test('debug test', async ({ page }) => {
  console.log('Current URL:', page.url());

  const element = await page.locator('[data-testid="button"]');
  console.log('Element visible:', await element.isVisible());
});
```

### 3. Take Screenshots

```typescript
test('debug test', async ({ page }) => {
  await page.screenshot({ path: 'debug.png' });
});
```

### 4. Pause Execution

```typescript
test('debug test', async ({ page }) => {
  await page.pause(); // Opens Playwright Inspector
});
```

## CI/CD Integration

E2E tests run automatically in CI/CD on:
- Push to main/develop branches
- Pull requests
- Daily scheduled runs (2 AM UTC)

Test results are uploaded as artifacts and viewable in the GitHub Actions UI.

## Test Configuration

Configuration is in `playwright.config.ts`:

- **Timeout**: 90 seconds per test
- **Retries**: 2 retries in CI, 0 locally
- **Workers**: 4 parallel workers in CI
- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop + Mobile (Pixel 5, iPhone 12)

## Troubleshooting

### Issue: Tests timing out

**Solution**: Increase timeout or optimize test:

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  // ... test logic
});
```

### Issue: Element not found

**Solution**: Add explicit waits:

```typescript
await page.waitForSelector('[data-testid="element"]', { timeout: 10000 });
```

### Issue: Flaky tests

**Solution**:
1. Use better selectors (data-testid)
2. Add explicit waits
3. Use `page.waitForLoadState('networkidle')`
4. Avoid hard-coded delays

### Issue: Server not responding

**Solution**: Ensure dev server is running:

```bash
pnpm dev
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Testing Quick Start](../../TESTING_QUICK_START.md)
- [Comprehensive Testing Strategy](../../COMPREHENSIVE_TESTING_STRATEGY.md)

## Contributing

When adding new tests:

1. Follow existing patterns
2. Use helpers and fixtures
3. Add data-testid attributes to UI components
4. Keep tests independent
5. Clean up test data
6. Document complex test scenarios

---

**Questions?** Create an issue or ask in the team Slack channel.
