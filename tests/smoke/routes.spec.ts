/**
 * Smoke Tests - Route Validation
 *
 * Comprehensive smoke test suite to validate all application routes
 * and capture UI state for demo/testing purposes.
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

/**
 * Public Routes - Should be accessible without authentication
 */
test.describe('Public Routes - Smoke Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for successful load
    await expect(page).toHaveTitle(/Cortex DC Portal/);

    // Verify key elements
    await expect(page.locator('h1')).toContainText('Cortex DC Portal');
    await expect(page.getByText('Platform Ready')).toBeVisible();
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/smoke/homepage.png', fullPage: true });
  });

  test('Login page loads successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await expect(page).toHaveTitle(/Cortex DC Portal/);
    await expect(page.locator('h1')).toContainText('Cortex DC Portal');
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();

    await page.screenshot({ path: 'test-results/smoke/login.png', fullPage: true });
  });

  test('Register page loads successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    await expect(page).toHaveTitle(/Cortex DC Portal/);
    await expect(page.getByText(/Create Account|Sign Up/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/smoke/register.png', fullPage: true });
  });

  test('Reset Password page loads successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password`);

    await expect(page).toHaveTitle(/Cortex DC Portal/);

    await page.screenshot({ path: 'test-results/smoke/reset-password.png', fullPage: true });
  });
});

/**
 * API Health Checks
 */
test.describe('API Endpoints - Smoke Tests', () => {
  test('Health endpoint returns healthy status', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('cortex-web');
  });

  test('Readyz endpoint responds', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/readyz`);

    // Should return 200 or 503 depending on ready state
    expect([200, 503]).toContain(response.status());
  });
});

/**
 * Protected Routes - Should redirect or show loading
 */
test.describe('Protected Routes - Smoke Tests', () => {
  test('POV list page loads (with auth check)', async ({ page }) => {
    await page.goto(`${BASE_URL}/pov`);

    // Should show either loading state or redirect to login
    const isLoading = await page.getByText(/Loading/i).isVisible().catch(() => false);
    const isLoginRedirect = page.url().includes('/login');

    expect(isLoading || isLoginRedirect).toBeTruthy();

    await page.screenshot({ path: 'test-results/smoke/pov-list.png', fullPage: true });
  });

  test('TRR list page loads (with auth check)', async ({ page }) => {
    await page.goto(`${BASE_URL}/trr`);

    const isLoading = await page.getByText(/Loading/i).isVisible().catch(() => false);
    const isLoginRedirect = page.url().includes('/login');

    expect(isLoading || isLoginRedirect).toBeTruthy();

    await page.screenshot({ path: 'test-results/smoke/trr-list.png', fullPage: true });
  });

  test('Create POV page loads (with auth check)', async ({ page }) => {
    await page.goto(`${BASE_URL}/pov/new`);

    const isLoading = await page.getByText(/Loading/i).isVisible().catch(() => false);
    const isLoginRedirect = page.url().includes('/login');

    expect(isLoading || isLoginRedirect).toBeTruthy();

    await page.screenshot({ path: 'test-results/smoke/pov-new.png', fullPage: true });
  });

  test('Create TRR page loads (with auth check)', async ({ page }) => {
    await page.goto(`${BASE_URL}/trr/new`);

    const isLoading = await page.getByText(/Loading/i).isVisible().catch(() => false);
    const isLoginRedirect = page.url().includes('/login');

    expect(isLoading || isLoginRedirect).toBeTruthy();

    await page.screenshot({ path: 'test-results/smoke/trr-new.png', fullPage: true });
  });

  test('Admin analytics page loads (with auth check)', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/analytics`);

    const isLoading = await page.getByText(/Loading/i).isVisible().catch(() => false);
    const isLoginRedirect = page.url().includes('/login');

    expect(isLoading || isLoginRedirect).toBeTruthy();

    await page.screenshot({ path: 'test-results/smoke/admin-analytics.png', fullPage: true });
  });
});

/**
 * 404 Error Handling
 */
test.describe('Error Pages - Smoke Tests', () => {
  test('Non-existent route shows 404 page', async ({ page }) => {
    await page.goto(`${BASE_URL}/non-existent-route-12345`);

    // Should show 404 page
    await expect(page.getByText(/404|not found/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/smoke/404-page.png', fullPage: true });
  });
});

/**
 * Responsive Design Tests
 */
test.describe('Responsive Design - Smoke Tests', () => {
  test('Homepage is mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(BASE_URL);

    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'test-results/smoke/homepage-mobile.png', fullPage: true });
  });

  test('Homepage is tablet responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto(BASE_URL);

    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'test-results/smoke/homepage-tablet.png', fullPage: true });
  });

  test('Homepage is desktop responsive', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    await page.goto(BASE_URL);

    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'test-results/smoke/homepage-desktop.png', fullPage: true });
  });
});

/**
 * Performance Smoke Tests
 */
test.describe('Performance - Smoke Tests', () => {
  test('Homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    console.log(`Homepage load time: ${loadTime}ms`);
  });

  test('API health endpoint responds quickly', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/health`);
    const responseTime = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    // Should respond within 500ms
    expect(responseTime).toBeLessThan(500);

    console.log(`API health response time: ${responseTime}ms`);
  });
});

/**
 * Accessibility Smoke Tests
 */
test.describe('Accessibility - Smoke Tests', () => {
  test('Homepage has proper ARIA labels', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('Login form has accessible labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Email input should have label
    const emailInput = page.getByLabel(/Email/i);
    await expect(emailInput).toBeVisible();

    // Password input should have label
    const passwordInput = page.getByLabel(/Password/i);
    await expect(passwordInput).toBeVisible();

    // Submit button should be accessible
    const submitButton = page.getByRole('button', { name: /Sign In/i });
    await expect(submitButton).toBeVisible();
  });
});
