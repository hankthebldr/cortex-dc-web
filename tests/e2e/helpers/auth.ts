/**
 * Authentication Helpers for E2E Tests
 *
 * Common authentication actions and assertions
 */

import { Page, expect } from '@playwright/test';
import { TestUser, getAdminUser, getRegularUser } from '../fixtures/users';

/**
 * Login with email and password
 */
export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');

  // Fill in credentials
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('/', { timeout: 10000 });

  // Verify login success
  await expect(page.locator('text=/Welcome|Dashboard/i')).toBeVisible({ timeout: 10000 });
}

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, getAdminUser());
}

/**
 * Login as regular user
 */
export async function loginAsUser(page: Page): Promise<void> {
  await login(page, getRegularUser());
}

/**
 * Logout
 */
export async function logout(page: Page): Promise<void> {
  // Find logout button (may be in dropdown/menu)
  const logoutButton = page.locator(
    'button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")'
  ).first();

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else {
    // Try to open user menu first
    const userMenu = page.locator(
      '[data-testid="user-menu"], button[aria-label*="profile"], button[aria-label*="account"]'
    ).first();

    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.waitForTimeout(500);

      const logoutInMenu = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
      await logoutInMenu.click();
    }
  }

  // Verify redirect to login
  await page.waitForURL(/login/, { timeout: 10000 });
}

/**
 * Assert user is logged in
 */
export async function assertLoggedIn(page: Page): Promise<void> {
  // Should not be on login page
  expect(page.url()).not.toContain('/login');

  // Should see user profile or dashboard elements
  const loggedInIndicators = [
    page.locator('text=/Welcome|Dashboard/i'),
    page.locator('[data-testid="user-menu"]'),
    page.locator('button:has-text("Logout")'),
  ];

  let foundIndicator = false;
  for (const indicator of loggedInIndicators) {
    if (await indicator.isVisible({ timeout: 2000 }).catch(() => false)) {
      foundIndicator = true;
      break;
    }
  }

  expect(foundIndicator).toBeTruthy();
}

/**
 * Assert user is logged out
 */
export async function assertLoggedOut(page: Page): Promise<void> {
  // Should be on login page or redirected to login
  const isLoginPage = page.url().includes('/login');
  expect(isLoginPage).toBeTruthy();
}

/**
 * Clear authentication state
 */
export async function clearAuth(page: Page): Promise<void> {
  // Clear cookies
  await page.context().clearCookies();

  // Clear local storage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
