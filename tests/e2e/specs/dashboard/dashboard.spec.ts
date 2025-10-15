import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@cortex.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display dashboard', async ({ page }) => {
    await expect(page).toHaveURL('/');

    // Check for dashboard elements
    await expect(page.locator('main, [data-testid="dashboard"]')).toBeVisible();
  });

  test('should display dashboard metrics', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for metrics/stats cards
    const metricCards = page.locator('[data-testid*="metric"], .metric, .stat-card, [role="status"]');

    const count = await metricCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to POV section', async ({ page }) => {
    const povLink = page.locator('a[href="/pov"], button:has-text("POV")').first();

    if (await povLink.isVisible()) {
      await povLink.click();
      await expect(page).toHaveURL(/\/pov/);
    }
  });

  test('should navigate to TRR section', async ({ page }) => {
    const trrLink = page.locator('a[href="/trr"], button:has-text("TRR")').first();

    if (await trrLink.isVisible()) {
      await trrLink.click();
      await expect(page).toHaveURL(/\/trr/);
    }
  });

  test('should display user profile menu', async ({ page }) => {
    const profileButton = page.locator('[data-testid="user-menu"], button[aria-label*="profile"], button[aria-label*="account"]').first();

    if (await profileButton.isVisible()) {
      await profileButton.click();

      // Profile menu should open
      await expect(
        page.locator('text=/Profile|Settings|Logout/i')
      ).toBeVisible();
    }
  });

  test('should display navigation menu', async ({ page }) => {
    // Check for navigation elements
    const nav = page.locator('nav, [role="navigation"]');

    await expect(nav.first()).toBeVisible();

    // Should have links to main sections
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const count = await navLinks.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Dashboard - Responsive', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@cortex.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Look for mobile menu button
    const mobileMenuButton = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu"]').first();

    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();

      // Mobile menu should open
      await page.waitForTimeout(500);

      await expect(
        page.locator('nav, [role="navigation"], [data-testid="mobile-nav"]')
      ).toBeVisible();
    }
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.waitForLoadState('networkidle');

    // Dashboard should render properly
    await expect(page.locator('main')).toBeVisible();
  });
});
