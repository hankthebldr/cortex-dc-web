import { test, expect, devices } from '@playwright/test';
import { signIn, signOut } from '../utils/auth-helpers';

test.describe('Cross-Browser and Visual Regression Testing', () => {
  
  test.describe('Cross-Browser Compatibility', () => {
    // Test across multiple browsers
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test.describe(`${browserName} Browser`, () => {
        test.use({ 
          browserName: browserName as 'chromium' | 'firefox' | 'webkit',
          // Disable web security for emulator testing
          ...(browserName === 'chromium' && { 
            launchOptions: { 
              args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'] 
            }
          })
        });

        test(`Dashboard loads and functions correctly in ${browserName}`, async ({ page }) => {
          await page.goto('/');
          await signIn(page, 'user1@dev.local', 'Password123!');

          // Verify main dashboard elements
          await expect(page.getByTestId('user-dashboard')).toBeVisible();
          await expect(page.getByTestId('navigation-menu')).toBeVisible();
          await expect(page.getByTestId('user-profile')).toBeVisible();
          
          // Test interactive elements
          await page.getByTestId('create-pov-button').click();
          await expect(page.getByTestId('pov-creation-wizard')).toBeVisible();
          await page.getByTestId('close-wizard-button').click();
          
          await page.getByTestId('create-trr-button').click();
          await expect(page.getByTestId('trr-creation-dialog')).toBeVisible();
          await page.getByTestId('cancel-trr-creation').click();

          await signOut(page);
          console.log(`✅ Dashboard functionality verified in ${browserName}`);
        });

        test(`POV Creation Wizard cross-browser in ${browserName}`, async ({ page }) => {
          await page.goto('/');
          await signIn(page, 'manager1@dev.local', 'Password123!');

          await page.getByTestId('create-pov-button').click();
          await expect(page.getByTestId('pov-creation-wizard')).toBeVisible();
          
          // Test wizard navigation
          await page.getByTestId('pov-title-input').fill(`Cross-Browser Test POV - ${browserName}`);
          await page.getByTestId('pov-description-textarea').fill('Testing POV creation across browsers');
          await page.getByTestId('next-step-button').click();
          
          // Objectives step
          await expect(page.getByTestId('objectives-step')).toBeVisible();
          await page.getByTestId('add-objective-button').click();
          await page.getByTestId('objective-title-0').fill('Browser Compatibility Test');
          await page.getByTestId('objective-description-0').fill('Verify POV works across all supported browsers');
          await page.getByTestId('next-step-button').click();
          
          // Summary step
          await expect(page.getByTestId('summary-step')).toBeVisible();
          await expect(page.getByTestId('pov-summary')).toContainText(`Cross-Browser Test POV - ${browserName}`);
          
          await page.getByTestId('cancel-wizard-button').click();
          await signOut(page);
          
          console.log(`✅ POV Creation Wizard verified in ${browserName}`);
        });
      });
    });
  });

  test.describe('Mobile and Tablet Responsiveness', () => {
    // Test responsive design across device types
    const deviceConfigs = [
      { name: 'Mobile Portrait', ...devices['iPhone 12'] },
      { name: 'Mobile Landscape', ...devices['iPhone 12 landscape'] },
      { name: 'Tablet Portrait', ...devices['iPad'] },
      { name: 'Tablet Landscape', ...devices['iPad landscape'] },
      { name: 'Desktop HD', viewport: { width: 1920, height: 1080 } },
    ];

    deviceConfigs.forEach(device => {
      test.describe(`${device.name} Layout`, () => {
        test.use(device);

        test(`Dashboard responsive layout on ${device.name}`, async ({ page }) => {
          await page.goto('/');
          await signIn(page, 'user1@dev.local', 'Password123!');

          // Wait for layout stabilization
          await page.waitForTimeout(1000);

          // Check responsive navigation
          if (device.name.includes('Mobile')) {
            // Mobile should show hamburger menu
            await expect(page.getByTestId('mobile-menu-toggle')).toBeVisible();
            await page.getByTestId('mobile-menu-toggle').click();
            await expect(page.getByTestId('mobile-navigation-menu')).toBeVisible();
          } else {
            // Desktop/Tablet should show full navigation
            await expect(page.getByTestId('desktop-navigation-menu')).toBeVisible();
          }

          // Check main content areas are accessible
          await expect(page.getByTestId('main-content-area')).toBeVisible();
          
          // Test project cards layout
          const projectCards = page.getByTestId('project-card');
          const cardCount = await projectCards.count();
          
          if (cardCount > 0) {
            // Verify cards are properly sized for viewport
            const firstCard = projectCards.first();
            await expect(firstCard).toBeVisible();
            
            const cardBox = await firstCard.boundingBox();
            const viewportSize = page.viewportSize();
            
            // Card should not exceed viewport width
            expect(cardBox?.width).toBeLessThanOrEqual(viewportSize?.width || 1920);
          }

          await signOut(page);
          console.log(`✅ Responsive layout verified on ${device.name}`);
        });

        test(`POV Creation responsive design on ${device.name}`, async ({ page }) => {
          await page.goto('/');
          await signIn(page, 'manager1@dev.local', 'Password123!');

          await page.getByTestId('create-pov-button').click();
          
          // Check wizard responsiveness
          const wizard = page.getByTestId('pov-creation-wizard');
          await expect(wizard).toBeVisible();
          
          const wizardBox = await wizard.boundingBox();
          const viewportSize = page.viewportSize();
          
          // Wizard should adapt to viewport
          if (device.name.includes('Mobile')) {
            // Mobile wizard should use most of screen width
            expect(wizardBox?.width).toBeGreaterThan((viewportSize?.width || 375) * 0.8);
          } else {
            // Desktop wizard should have reasonable max width
            expect(wizardBox?.width).toBeLessThanOrEqual(800);
          }

          // Test form input accessibility
          await page.getByTestId('pov-title-input').fill('Mobile Test POV');
          await expect(page.getByTestId('pov-title-input')).toHaveValue('Mobile Test POV');
          
          await page.getByTestId('cancel-wizard-button').click();
          await signOut(page);
          
          console.log(`✅ POV Creation responsive design verified on ${device.name}`);
        });
      });
    });
  });

  test.describe('Visual Regression Testing', () => {
    test.beforeEach(async ({ page }) => {
      // Configure for consistent visual testing
      await page.goto('/');
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `
      });
    });

    test('Dashboard visual regression test', async ({ page }) => {
      await signIn(page, 'user1@dev.local', 'Password123!');
      
      // Wait for dashboard to fully load
      await page.waitForTimeout(2000);
      await expect(page.getByTestId('user-dashboard')).toBeVisible();
      
      // Hide dynamic content that changes between runs
      await page.addStyleTag({
        content: `
          [data-testid*="timestamp"], 
          [data-testid*="date"],
          .loading-spinner,
          .pulse-animation {
            visibility: hidden !important;
          }
        `
      });

      // Take full page screenshot
      await expect(page).toHaveScreenshot('dashboard-user-view.png', {
        fullPage: true,
        animations: 'disabled'
      });

      await signOut(page);
      console.log('✅ Dashboard visual regression test completed');
    });

    test('Manager dashboard visual regression test', async ({ page }) => {
      await signIn(page, 'manager1@dev.local', 'Password123!');
      
      await page.waitForTimeout(2000);
      await expect(page.getByTestId('manager-dashboard')).toBeVisible();
      
      // Hide dynamic elements
      await page.addStyleTag({
        content: `
          [data-testid*="timestamp"], 
          [data-testid*="date"],
          [data-testid*="live-data"],
          .chart-animation {
            visibility: hidden !important;
          }
        `
      });

      await expect(page).toHaveScreenshot('dashboard-manager-view.png', {
        fullPage: true,
        animations: 'disabled'
      });

      await signOut(page);
      console.log('✅ Manager dashboard visual regression test completed');
    });

    test('Admin dashboard visual regression test', async ({ page }) => {
      await signIn(page, 'admin1@dev.local', 'Password123!');
      
      await page.waitForTimeout(2000);
      await expect(page.getByTestId('admin-dashboard')).toBeVisible();

      await page.addStyleTag({
        content: `
          [data-testid*="timestamp"], 
          [data-testid*="date"],
          [data-testid*="metric"],
          .real-time-indicator {
            visibility: hidden !important;
          }
        `
      });

      await expect(page).toHaveScreenshot('dashboard-admin-view.png', {
        fullPage: true,
        animations: 'disabled'
      });

      await signOut(page);
      console.log('✅ Admin dashboard visual regression test completed');
    });

    test('POV Creation Wizard visual regression test', async ({ page }) => {
      await signIn(page, 'manager1@dev.local', 'Password123!');
      
      await page.getByTestId('create-pov-button').click();
      await expect(page.getByTestId('pov-creation-wizard')).toBeVisible();

      // Screenshot each step of the wizard
      await expect(page.getByTestId('pov-creation-wizard')).toHaveScreenshot('pov-wizard-step-1.png');

      // Fill first step and go to next
      await page.getByTestId('pov-title-input').fill('Visual Test POV');
      await page.getByTestId('pov-description-textarea').fill('Testing visual consistency of POV wizard');
      await page.getByTestId('next-step-button').click();

      await expect(page.getByTestId('objectives-step')).toBeVisible();
      await expect(page.getByTestId('pov-creation-wizard')).toHaveScreenshot('pov-wizard-step-2.png');

      // Add an objective and go to next step
      await page.getByTestId('add-objective-button').click();
      await page.getByTestId('objective-title-0').fill('Visual Regression Objective');
      await page.getByTestId('objective-description-0').fill('Ensure wizard appearance is consistent');
      await page.getByTestId('next-step-button').click();

      await expect(page.getByTestId('timeline-step')).toBeVisible();
      await expect(page.getByTestId('pov-creation-wizard')).toHaveScreenshot('pov-wizard-step-3.png');

      await page.getByTestId('cancel-wizard-button').click();
      await signOut(page);
      console.log('✅ POV Creation Wizard visual regression test completed');
    });

    test('TRR Creation Dialog visual regression test', async ({ page }) => {
      await signIn(page, 'user1@dev.local', 'Password123!');
      
      await page.getByTestId('create-trr-button').click();
      await expect(page.getByTestId('trr-creation-dialog')).toBeVisible();

      // Screenshot empty dialog
      await expect(page.getByTestId('trr-creation-dialog')).toHaveScreenshot('trr-creation-empty.png');

      // Fill some fields and screenshot
      await page.getByTestId('trr-title-input').fill('Visual Regression TRR');
      await page.getByTestId('trr-description-textarea').fill('Testing TRR dialog visual consistency');
      await page.getByTestId('overall-risk-score').fill('7');

      // Add a risk category
      await page.getByTestId('add-risk-category-button').click();
      await page.getByTestId('risk-category-name-0').fill('Visual Testing Risk');
      await page.getByTestId('risk-category-score-0').fill('7');

      await expect(page.getByTestId('trr-creation-dialog')).toHaveScreenshot('trr-creation-filled.png');

      await page.getByTestId('cancel-trr-creation').click();
      await signOut(page);
      console.log('✅ TRR Creation Dialog visual regression test completed');
    });
  });

  test.describe('Performance and Accessibility Testing', () => {
    test('Dashboard performance metrics', async ({ page }) => {
      // Start performance monitoring
      await page.coverage.startJSCoverage();
      await page.coverage.startCSSCoverage();

      const startTime = Date.now();
      
      await page.goto('/');
      await signIn(page, 'user1@dev.local', 'Password123!');
      
      // Wait for dashboard to fully load
      await expect(page.getByTestId('user-dashboard')).toBeVisible();
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Stop coverage and get metrics
      const jsCoverage = await page.coverage.stopJSCoverage();
      const cssCoverage = await page.coverage.stopCSSCoverage();

      // Calculate coverage percentages
      let totalJSBytes = 0;
      let usedJSBytes = 0;
      for (const entry of jsCoverage) {
        totalJSBytes += entry.text.length;
        for (const range of entry.ranges) {
          usedJSBytes += range.end - range.start - 1;
        }
      }

      const jsUsagePercentage = totalJSBytes > 0 ? (usedJSBytes / totalJSBytes) * 100 : 0;

      console.log(`Dashboard Performance Metrics:
      - Load Time: ${loadTime}ms
      - JavaScript Usage: ${jsUsagePercentage.toFixed(2)}%
      - Total JS Files: ${jsCoverage.length}
      - Total CSS Files: ${cssCoverage.length}`);

      // Assert reasonable performance
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      expect(jsUsagePercentage).toBeGreaterThan(10); // Should use reasonable amount of JS

      await signOut(page);
      console.log('✅ Dashboard performance metrics validated');
    });

    test('Accessibility compliance check', async ({ page }) => {
      // Note: This would typically use @axe-core/playwright for full a11y testing
      await page.goto('/');
      await signIn(page, 'user1@dev.local', 'Password123!');

      // Basic accessibility checks
      const mainContent = page.getByRole('main');
      await expect(mainContent).toBeVisible();

      // Check for proper heading hierarchy
      const h1Elements = page.getByRole('heading', { level: 1 });
      expect(await h1Elements.count()).toBeGreaterThan(0);

      // Check for proper navigation landmarks
      const navElements = page.getByRole('navigation');
      expect(await navElements.count()).toBeGreaterThan(0);

      // Check form accessibility
      await page.getByTestId('create-pov-button').click();
      
      const titleInput = page.getByTestId('pov-title-input');
      await expect(titleInput).toHaveAttribute('aria-label');
      
      const descriptionInput = page.getByTestId('pov-description-textarea');
      await expect(descriptionInput).toHaveAttribute('aria-label');

      await page.getByTestId('cancel-wizard-button').click();
      await signOut(page);
      console.log('✅ Basic accessibility compliance verified');
    });

    test('Error handling and resilience', async ({ page }) => {
      await page.goto('/');
      
      // Test network failure resilience
      await page.route('**/api/**', route => route.abort());
      
      await signIn(page, 'user1@dev.local', 'Password123!');
      
      // Should show error states gracefully
      await page.waitForTimeout(3000);
      
      // Check for error boundaries and fallback UI
      const errorMessages = page.getByTestId('error-message');
      const loadingSpinners = page.getByTestId('loading-spinner');
      
      // Either error messages or loading states should be present
      const errorCount = await errorMessages.count();
      const loadingCount = await loadingSpinners.count();
      
      expect(errorCount + loadingCount).toBeGreaterThan(0);
      
      console.log(`Error Handling Test Results:
      - Error Messages: ${errorCount}
      - Loading States: ${loadingCount}
      - Total Fallback UI Elements: ${errorCount + loadingCount}`);

      // Restore network and verify recovery
      await page.unroute('**/api/**');
      await page.reload();
      await expect(page.getByTestId('user-dashboard')).toBeVisible();
      
      console.log('✅ Error handling and resilience validated');
    });
  });
});