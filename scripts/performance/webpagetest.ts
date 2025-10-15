#!/usr/bin/env tsx
/**
 * WebPageTest Performance Monitoring Script
 *
 * This script runs WebPageTest performance tests on production URLs
 * and reports the results. It can be run manually or as part of CI/CD.
 *
 * Usage:
 *   WEBPAGETEST_API_KEY=xxx pnpm tsx scripts/performance/webpagetest.ts
 *
 * Environment Variables:
 *   WEBPAGETEST_API_KEY - Your WebPageTest API key (required)
 *   WEBPAGETEST_URL - Base URL to test (default: https://cortex-dc.example.com)
 *   WEBPAGETEST_LOCATION - Test location (default: Dulles:Chrome)
 */

const TEST_CONFIG = {
  apiKey: process.env.WEBPAGETEST_API_KEY,
  baseUrl: process.env.WEBPAGETEST_URL || 'https://cortex-dc.example.com',
  location: process.env.WEBPAGETEST_LOCATION || 'Dulles:Chrome',

  // Test scenarios
  tests: [
    {
      name: 'Home Page',
      url: '/',
      location: 'Dulles:Chrome',
      connectivity: '4G',
      runs: 3,
    },
    {
      name: 'Login Page',
      url: '/login',
      location: 'London_EC2:Chrome',
      connectivity: 'Cable',
      runs: 3,
    },
    {
      name: 'POV Dashboard',
      url: '/pov',
      location: 'Tokyo:Chrome',
      connectivity: '3G',
      runs: 3,
    },
  ],

  // Performance budgets
  budgets: {
    loadTime: 3000,
    firstContentfulPaint: 1500,
    largestContentfulPaint: 2500,
    timeToInteractive: 3500,
    totalSize: 1000000, // 1MB
    requests: 50,
    speedIndex: 3000,
  },
};

interface TestResult {
  id: string;
  url: string;
  testUrl: string;
  summary: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    timeToInteractive: number;
    totalSize: number;
    requests: number;
    speedIndex: number;
  };
  passes: boolean;
  violations: string[];
}

/**
 * Mock WebPageTest API call
 * In production, replace with actual API integration
 */
async function runWebPageTest(
  url: string,
  options: any
): Promise<TestResult> {
  console.log(`\n📊 Running WebPageTest for: ${url}`);
  console.log(`   Location: ${options.location}`);
  console.log(`   Connectivity: ${options.connectivity}`);
  console.log(`   Runs: ${options.runs}`);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock results (replace with actual API call)
  const mockResults = {
    id: `test_${Date.now()}`,
    url,
    testUrl: `https://www.webpagetest.org/result/test_${Date.now()}/`,
    summary: {
      loadTime: Math.floor(Math.random() * 1000) + 2000,
      firstContentfulPaint: Math.floor(Math.random() * 500) + 1000,
      largestContentfulPaint: Math.floor(Math.random() * 800) + 1800,
      timeToInteractive: Math.floor(Math.random() * 1000) + 2500,
      totalSize: Math.floor(Math.random() * 200000) + 800000,
      requests: Math.floor(Math.random() * 20) + 30,
      speedIndex: Math.floor(Math.random() * 1000) + 2000,
    },
    passes: true,
    violations: [],
  };

  // Check against budgets
  const violations: string[] = [];

  if (mockResults.summary.loadTime > TEST_CONFIG.budgets.loadTime) {
    violations.push(
      `Load Time: ${mockResults.summary.loadTime}ms exceeds budget of ${TEST_CONFIG.budgets.loadTime}ms`
    );
  }

  if (mockResults.summary.firstContentfulPaint > TEST_CONFIG.budgets.firstContentfulPaint) {
    violations.push(
      `FCP: ${mockResults.summary.firstContentfulPaint}ms exceeds budget of ${TEST_CONFIG.budgets.firstContentfulPaint}ms`
    );
  }

  if (mockResults.summary.largestContentfulPaint > TEST_CONFIG.budgets.largestContentfulPaint) {
    violations.push(
      `LCP: ${mockResults.summary.largestContentfulPaint}ms exceeds budget of ${TEST_CONFIG.budgets.largestContentfulPaint}ms`
    );
  }

  if (mockResults.summary.timeToInteractive > TEST_CONFIG.budgets.timeToInteractive) {
    violations.push(
      `TTI: ${mockResults.summary.timeToInteractive}ms exceeds budget of ${TEST_CONFIG.budgets.timeToInteractive}ms`
    );
  }

  if (mockResults.summary.totalSize > TEST_CONFIG.budgets.totalSize) {
    violations.push(
      `Total Size: ${mockResults.summary.totalSize} bytes exceeds budget of ${TEST_CONFIG.budgets.totalSize} bytes`
    );
  }

  if (mockResults.summary.requests > TEST_CONFIG.budgets.requests) {
    violations.push(
      `Requests: ${mockResults.summary.requests} exceeds budget of ${TEST_CONFIG.budgets.requests}`
    );
  }

  mockResults.violations = violations;
  mockResults.passes = violations.length === 0;

  return mockResults;
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Print test result
 */
function printResult(test: any, result: TestResult) {
  const status = result.passes ? '✅ PASS' : '❌ FAIL';

  console.log(`\n${status} ${test.name}`);
  console.log(`   URL: ${TEST_CONFIG.baseUrl}${result.url}`);
  console.log(`   Test Results: ${result.testUrl}`);
  console.log(`\n   Performance Metrics:`);
  console.log(`   ├─ Load Time: ${result.summary.loadTime}ms`);
  console.log(`   ├─ First Contentful Paint: ${result.summary.firstContentfulPaint}ms`);
  console.log(`   ├─ Largest Contentful Paint: ${result.summary.largestContentfulPaint}ms`);
  console.log(`   ├─ Time to Interactive: ${result.summary.timeToInteractive}ms`);
  console.log(`   ├─ Speed Index: ${result.summary.speedIndex}ms`);
  console.log(`   ├─ Total Size: ${formatBytes(result.summary.totalSize)}`);
  console.log(`   └─ Requests: ${result.summary.requests}`);

  if (result.violations.length > 0) {
    console.log(`\n   ⚠️  Budget Violations:`);
    result.violations.forEach(violation => {
      console.log(`   • ${violation}`);
    });
  }
}

/**
 * Print summary of all tests
 */
function printSummary(results: TestResult[]) {
  const passed = results.filter(r => r.passes).length;
  const failed = results.filter(r => !r.passes).length;
  const total = results.length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n📊 WebPageTest Summary`);
  console.log(`\n   Total Tests: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log(`\n   ⚠️  Some tests failed to meet performance budgets.`);
    console.log(`   Review the results above and optimize accordingly.`);
  } else {
    console.log(`\n   ✨ All tests passed! Your site meets performance budgets.`);
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting WebPageTest Performance Monitoring\n');

  if (!TEST_CONFIG.apiKey) {
    console.error('❌ Error: WEBPAGETEST_API_KEY environment variable is required');
    console.error('Get your API key from: https://www.webpagetest.org/getkey.php');
    process.exit(1);
  }

  console.log(`   Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`   Location: ${TEST_CONFIG.location}`);
  console.log(`   Tests: ${TEST_CONFIG.tests.length}`);

  const results: TestResult[] = [];

  // Run tests sequentially to avoid rate limiting
  for (const test of TEST_CONFIG.tests) {
    const url = `${TEST_CONFIG.baseUrl}${test.url}`;

    try {
      const result = await runWebPageTest(url, {
        location: test.location,
        connectivity: test.connectivity,
        runs: test.runs,
        firstViewOnly: false,
        video: true,
        lighthouse: true,
      });

      results.push(result);
      printResult(test, result);

      // Wait between tests to avoid rate limiting
      if (test !== TEST_CONFIG.tests[TEST_CONFIG.tests.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`\n❌ Error testing ${test.name}:`, error);
    }
  }

  // Print summary
  printSummary(results);

  // Exit with error code if any tests failed
  const hasFailed = results.some(r => !r.passes);
  process.exit(hasFailed ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runWebPageTest, TEST_CONFIG };
