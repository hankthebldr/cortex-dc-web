import { expect, test } from '@playwright/test';

test.describe('homepage smoke', () => {
  test('renders the hero headline @smoke', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Command the entire detection-to-response lifecycle');
  });
});
