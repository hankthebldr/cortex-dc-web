/**
 * Playwright Global Setup
 *
 * Runs once before all tests
 * Sets up test environment, seeds data, etc.
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('\n🚀 Starting E2E test suite setup...\n');

  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';

  console.log(`📍 Base URL: ${baseURL}`);

  // Launch browser to check if server is running
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('⏳ Waiting for server to be ready...');

    // Wait for server to be ready (with retries)
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        const response = await page.goto(baseURL, {
          timeout: 5000,
          waitUntil: 'domcontentloaded',
        });

        if (response && response.ok()) {
          console.log('✅ Server is ready!');
          break;
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`Server not ready after ${maxAttempts} attempts`);
        }
        console.log(`   Attempt ${attempts}/${maxAttempts}... retrying in 2s`);
        await page.waitForTimeout(2000);
      }
    }

    // Optional: Seed test data
    console.log('\n📦 Test data setup:');
    console.log('   ℹ️  Using existing test users (admin@cortex.com, user@cortex.com)');
    console.log('   ℹ️  Test data should be seeded via: pnpm seed:users');

    // Optional: Clear test data from previous runs
    // await clearTestData(page);

    // Optional: Create test users if not exist
    // await createTestUsers(page);

    console.log('\n✅ Global setup complete!\n');
  } catch (error) {
    console.error('\n❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
