import { test, expect } from '@playwright/test';

test.describe('Authentication - Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@cortex.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should logout successfully', async ({ page }) => {
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")').first();

    await logoutButton.click();

    // Should redirect to login page
    await expect(page).toHaveURL(/login/);
  });

  test('should clear session after logout', async ({ page, context }) => {
    // Logout
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")').first();
    await logoutButton.click();

    await page.waitForURL(/login/);

    // Try to access protected page
    await page.goto('/pov');

    // Should redirect back to login
    await expect(page).toHaveURL(/login/);
  });

  test('should not access protected routes after logout', async ({ page }) => {
    // Logout
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")').first();
    await logoutButton.click();

    await page.waitForURL(/login/);

    // Try to access various protected routes
    const protectedRoutes = ['/pov', '/trr', '/scenarios', '/admin'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/login/);
    }
  });

  test('should handle logout errors gracefully', async ({ page }) => {
    // Intercept logout API call to simulate error
    await page.route('**/api/auth/logout', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")').first();
    await logoutButton.click();

    // Should still clear local session and redirect to login
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });
});
