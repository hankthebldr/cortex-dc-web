/**
 * Playwright Global Teardown
 *
 * Runs once after all tests complete
 * Cleans up test environment, generates reports, etc.
 */

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Starting E2E test suite teardown...\n');

  try {
    // Optional: Clean up test data
    console.log('📊 Test results:');
    console.log('   ℹ️  View HTML report: pnpm report:e2e');
    console.log('   ℹ️  Reports saved to: playwright-report/');

    // Optional: Generate coverage report
    // await generateCoverageReport();

    // Optional: Upload test results
    // await uploadTestResults();

    // Optional: Clean up test database
    // console.log('🗑️  Cleaning up test data...');
    // await cleanupTestData();

    console.log('\n✅ Global teardown complete!\n');
  } catch (error) {
    console.error('\n❌ Global teardown failed:', error);
    // Don't throw - teardown failures shouldn't fail the test suite
  }
}

export default globalTeardown;
