import { expect, test, type Page } from '@playwright/test';

const quickLinks = [
  { name: 'Investigation Workbench', target: '#investigation' },
  { name: 'Genkit AI Analyst', target: '#ai-insights' },
  { name: 'Automation Designer', target: '#automation' },
  { name: 'Detection Catalog', target: '#detection' },
  { name: 'Intel Research Hub', target: '#intel' },
] as const;

async function expectAnchorInView(page: Page, selector: string) {
  const locator = page.locator(selector);
  await expect(locator).toBeVisible();

  const inView = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  });

  expect(inView, `${selector} should be within the viewport`).toBeTruthy();
}

test.describe('Quick link navigation', () => {
  for (const { name, target } of quickLinks) {
    test(`scrolls to ${name}`, async ({ page }) => {
      await page.goto('/');

      const link = page.getByRole('link', { name });
      await link.click();

      await expectAnchorInView(page, target);
    });
  }
});
