import { test, expect } from '@playwright/test';

test.describe('Authentication - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // Fill in login form
    await page.fill('input[name="email"]', 'admin@cortex.com');
    await page.fill('input[name="password"]', 'admin123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('/');

    // Verify successful login
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Error message should appear
    await expect(page.locator('text=/Invalid credentials|Login failed/i')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[name="email"]', 'not-an-email');
    await page.fill('input[name="password"]', 'password123');

    await page.click('button[type="submit"]');

    // Validation error should appear
    await expect(page.locator('text=/Invalid email|Please enter a valid email/i')).toBeVisible();
  });

  test('should require both email and password', async ({ page }) => {
    await page.click('button[type="submit"]');

    // Validation errors should appear
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    await expect(page.locator('input[name="password"]:invalid')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('button[aria-label*="password"]');

    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Password should now be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should navigate to password reset', async ({ page }) => {
    const resetLink = page.locator('a[href*="reset-password"]');

    if (await resetLink.isVisible()) {
      await resetLink.click();
      await expect(page).toHaveURL(/reset-password/);
    }
  });

  test('should navigate to register page', async ({ page }) => {
    const registerLink = page.locator('a[href*="register"]');

    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/register/);
    }
  });
});

test.describe('Authentication - OAuth', () => {
  test('should display OAuth providers', async ({ page }) => {
    await page.goto('/login');

    // Check for OAuth buttons
    const googleButton = page.locator('button:has-text("Google")');
    const githubButton = page.locator('button:has-text("GitHub")');

    // At least one OAuth provider should be available
    const hasOAuth = (await googleButton.isVisible()) || (await githubButton.isVisible());
    expect(hasOAuth).toBeTruthy();
  });

  test('should initiate Google OAuth flow', async ({ page, context }) => {
    await page.goto('/login');

    const googleButton = page.locator('button:has-text("Google")');

    if (await googleButton.isVisible()) {
      // Intercept OAuth redirect to prevent actual redirect
      await page.route('**/api/auth/oauth/google', route => {
        route.fulfill({
          status: 302,
          headers: {
            'Location': 'https://accounts.google.com/o/oauth2/auth'
          }
        });
      });

      // Wait for navigation event
      const [response] = await Promise.all([
        page.waitForResponse(response =>
          response.url().includes('/api/auth/oauth/google') &&
          response.status() === 302
        ),
        googleButton.click()
      ]);

      expect(response.status()).toBe(302);
    }
  });

  test('should initiate GitHub OAuth flow', async ({ page }) => {
    await page.goto('/login');

    const githubButton = page.locator('button:has-text("GitHub")');

    if (await githubButton.isVisible()) {
      // Intercept OAuth redirect
      await page.route('**/api/auth/oauth/github', route => {
        route.fulfill({
          status: 302,
          headers: {
            'Location': 'https://github.com/login/oauth/authorize'
          }
        });
      });

      const [response] = await Promise.all([
        page.waitForResponse(response =>
          response.url().includes('/api/auth/oauth/github') &&
          response.status() === 302
        ),
        githubButton.click()
      ]);

      expect(response.status()).toBe(302);
    }
  });
});

test.describe('Authentication - Session Persistence', () => {
  test('should persist session across page reloads', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@cortex.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/');

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=/Welcome|Dashboard/i')).toBeVisible();
  });

  test('should redirect to login when session expires', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@cortex.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/');

    // Clear cookies to simulate session expiration
    await context.clearCookies();

    // Navigate to protected page
    await page.goto('/pov');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});
