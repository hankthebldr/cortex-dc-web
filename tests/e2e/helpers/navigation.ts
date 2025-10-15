/**
 * Navigation Helpers for E2E Tests
 *
 * Common navigation actions
 */

import { Page } from '@playwright/test';

/**
 * Navigate to dashboard
 */
export async function goToDashboard(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to POV list
 */
export async function goToPOVList(page: Page): Promise<void> {
  await page.goto('/pov');
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to TRR list
 */
export async function goToTRRList(page: Page): Promise<void> {
  await page.goto('/trr');
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to scenarios
 */
export async function goToScenarios(page: Page): Promise<void> {
  await page.goto('/scenarios');
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to settings
 */
export async function goToSettings(page: Page): Promise<void> {
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to login page
 */
export async function goToLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate back
 */
export async function goBack(page: Page): Promise<void> {
  await page.goBack();
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate forward
 */
export async function goForward(page: Page): Promise<void> {
  await page.goForward();
  await page.waitForLoadState('networkidle');
}

/**
 * Reload page
 */
export async function reload(page: Page): Promise<void> {
  await page.reload();
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}
