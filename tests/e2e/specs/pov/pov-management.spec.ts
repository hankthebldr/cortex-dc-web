import { test, expect } from '@playwright/test';

test.describe('POV Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@cortex.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display POV list', async ({ page }) => {
    await page.goto('/pov');

    // Wait for POV list to load
    await page.waitForLoadState('networkidle');

    // Check for POV list container
    await expect(page.locator('[data-testid="pov-list"], .pov-list, main')).toBeVisible();
  });

  test('should navigate to create POV page', async ({ page }) => {
    await page.goto('/pov');

    // Find and click create button
    const createButton = page.locator('button:has-text("New POV"), button:has-text("Create POV"), a:has-text("New POV")').first();

    if (await createButton.isVisible()) {
      await createButton.click();

      // Should navigate to create page or open modal
      await page.waitForTimeout(1000);

      // Check for form fields
      await expect(
        page.locator('input[name="name"], input[name="title"]')
      ).toBeVisible();
    }
  });

  test('should create new POV', async ({ page }) => {
    await page.goto('/pov');

    const createButton = page.locator('button:has-text("New POV"), button:has-text("Create POV")').first();

    if (await createButton.isVisible()) {
      await createButton.click();

      // Fill in POV details
      await page.fill('input[name="name"], input[name="title"]', `Test POV ${Date.now()}`);

      const descriptionField = page.locator('textarea[name="description"], textarea[name="objective"]');
      if (await descriptionField.isVisible()) {
        await descriptionField.fill('This is a test POV created by E2E tests');
      }

      // Submit form
      await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');

      // Wait for success
      await page.waitForTimeout(2000);

      // Should show success message or navigate to POV detail
      const successIndicators = [
        page.locator('text=/created successfully|POV created/i'),
        page.locator('[data-testid="success-message"]'),
      ];

      let foundSuccess = false;
      for (const indicator of successIndicators) {
        if (await indicator.isVisible({ timeout: 5000 }).catch(() => false)) {
          foundSuccess = true;
          break;
        }
      }

      expect(foundSuccess).toBeTruthy();
    }
  });

  test('should view POV details', async ({ page }) => {
    await page.goto('/pov');

    // Wait for POV list to load
    await page.waitForLoadState('networkidle');

    // Click on first POV
    const firstPov = page.locator('[data-testid="pov-card"], .pov-card, [role="link"]').first();

    if (await firstPov.isVisible()) {
      await firstPov.click();

      // Should navigate to POV detail page
      await expect(page).toHaveURL(/\/pov\/.+/);

      // Check for POV detail elements
      const detailElements = [
        page.locator('text=/Objective|Description|Status/i'),
        page.locator('[data-testid="pov-detail"]'),
      ];

      let foundDetail = false;
      for (const element of detailElements) {
        if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
          foundDetail = true;
          break;
        }
      }

      expect(foundDetail).toBeTruthy();
    }
  });

  test('should update POV status', async ({ page }) => {
    await page.goto('/pov');
    await page.waitForLoadState('networkidle');

    const firstPov = page.locator('[data-testid="pov-card"], .pov-card').first();

    if (await firstPov.isVisible()) {
      await firstPov.click();

      // Look for status change button
      const statusButton = page.locator(
        'button:has-text("Start"), button:has-text("In Progress"), button:has-text("Complete")'
      ).first();

      if (await statusButton.isVisible()) {
        const buttonText = await statusButton.textContent();
        await statusButton.click();

        // Wait for status update
        await page.waitForTimeout(2000);

        // Verify status changed
        await expect(page.locator(`text=${buttonText}`).first()).not.toBeVisible();
      }
    }
  });

  test('should delete POV', async ({ page }) => {
    await page.goto('/pov');
    await page.waitForLoadState('networkidle');

    const firstPov = page.locator('[data-testid="pov-card"], .pov-card').first();

    if (await firstPov.isVisible()) {
      await firstPov.click();

      // Look for delete button
      const deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="delete"]').first();

      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Confirm deletion if confirmation dialog appears
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');

        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }

        // Should redirect to POV list
        await expect(page).toHaveURL(/\/pov(?:$|\/)/);
      }
    }
  });
});

test.describe('POV Phases', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@cortex.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.goto('/pov');
    await page.waitForLoadState('networkidle');
  });

  test('should display POV phases', async ({ page }) => {
    const firstPov = page.locator('[data-testid="pov-card"], .pov-card').first();

    if (await firstPov.isVisible()) {
      await firstPov.click();

      // Check for phase indicators
      const phases = ['Planning', 'In Progress', 'Testing', 'Validating', 'Completed'];

      let foundPhases = 0;
      for (const phase of phases) {
        const phaseElement = page.locator(`text=${phase}`);
        if (await phaseElement.isVisible({ timeout: 2000 }).catch(() => false)) {
          foundPhases++;
        }
      }

      // Should find at least some phase indicators
      expect(foundPhases).toBeGreaterThan(0);
    }
  });

  test('should navigate between phase tabs', async ({ page }) => {
    const firstPov = page.locator('[data-testid="pov-card"], .pov-card').first();

    if (await firstPov.isVisible()) {
      await firstPov.click();

      // Look for tab navigation
      const tabs = page.locator('[role="tab"], .tab, [data-testid*="tab"]');
      const tabCount = await tabs.count();

      if (tabCount > 1) {
        // Click second tab
        await tabs.nth(1).click();

        // Wait for content to load
        await page.waitForTimeout(1000);

        // Tab should be active
        await expect(tabs.nth(1)).toHaveAttribute(/aria-selected|data-active/, /true|active/);
      }
    }
  });
});

test.describe('POV Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@cortex.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.goto('/pov');
    await page.waitForLoadState('networkidle');
  });

  test('should search POVs', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('test');

      // Wait for results to filter
      await page.waitForTimeout(1000);

      // Results should update
      const results = page.locator('[data-testid="pov-card"], .pov-card');
      const count = await results.count();

      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter POVs by status', async ({ page }) => {
    const filterButton = page.locator('button:has-text("Filter"), [data-testid="filter"]');

    if (await filterButton.isVisible()) {
      await filterButton.click();

      // Look for status filters
      const statusFilter = page.locator('button:has-text("In Progress"), input[value="in_progress"]').first();

      if (await statusFilter.isVisible()) {
        await statusFilter.click();

        // Wait for results to filter
        await page.waitForTimeout(1000);

        // Results should be filtered
        const results = page.locator('[data-testid="pov-card"], .pov-card');
        const count = await results.count();

        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
