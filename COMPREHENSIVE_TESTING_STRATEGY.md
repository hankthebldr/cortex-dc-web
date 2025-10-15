# Comprehensive Testing & Quality Strategy

**Status**: Active
**Last Updated**: 2025-10-14
**Owner**: Platform Engineering

## Table of Contents

1. [Overview](#overview)
2. [Testing Pyramid](#testing-pyramid)
3. [Testing Tools & Technologies](#testing-tools--technologies)
4. [Test Coverage Strategy](#test-coverage-strategy)
5. [Implementation Guide](#implementation-guide)
6. [CI/CD Integration](#cicd-integration)
7. [Monitoring & Reporting](#monitoring--reporting)

---

## Overview

This document outlines the comprehensive testing strategy for the Cortex DC Web platform, covering functional, performance, security, and accessibility testing across both Firebase and self-hosted deployment modes.

### Testing Goals

- ✅ **99.9% Uptime**: Ensure platform reliability through comprehensive testing
- ✅ **Sub-second Performance**: Maintain fast page loads and interactions
- ✅ **Zero Security Vulnerabilities**: Proactive security testing and remediation
- ✅ **WCAG 2.1 AA Compliance**: Accessibility for all users
- ✅ **Cross-browser Compatibility**: Support for all major browsers
- ✅ **Dual-mode Validation**: Test both Firebase and self-hosted modes

---

## Testing Pyramid

```
                    /\
                   /  \
                  / E2E \          10% - End-to-End Tests
                 /______\
                /        \
               /          \
              / Integration \      30% - Integration Tests
             /______________\
            /                \
           /                  \
          /   Unit Tests       \   60% - Unit Tests
         /______________________\
```

### Testing Layers

1. **Unit Tests (60%)**
   - Component logic
   - Service functions
   - Utility functions
   - Database adapters

2. **Integration Tests (30%)**
   - API endpoints
   - Auth flows
   - Database operations
   - External integrations

3. **E2E Tests (10%)**
   - Critical user journeys
   - Cross-browser scenarios
   - Mobile responsive flows

---

## Testing Tools & Technologies

### 1. Playwright - E2E Testing

**Purpose**: End-to-end testing across browsers and devices

**Features**:
- Cross-browser testing (Chromium, Firefox, WebKit)
- Mobile device emulation
- Visual regression testing
- Network interception
- Parallel execution

**Installation**:
```bash
pnpm add -D @playwright/test
npx playwright install
```

**Configuration** (`playwright.config.ts`):
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Key Test Scenarios**:
- User authentication (email, OAuth, SAML)
- POV creation and management
- TRR workflows
- Dashboard interactions
- Search functionality
- Terraform generation

---

### 2. Lighthouse - Performance Audits

**Purpose**: Automated performance, accessibility, SEO, and best practices audits

**Features**:
- Performance metrics (FCP, LCP, TTI, CLS)
- Accessibility checks (WCAG compliance)
- SEO optimization
- Progressive Web App validation
- Best practices enforcement

**Installation**:
```bash
pnpm add -D lighthouse lighthouse-ci
```

**Configuration** (`lighthouserc.js`):
```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm dev',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/pov',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Performance Budget**:
```json
{
  "path": "/*",
  "timings": {
    "first-contentful-paint": 2000,
    "largest-contentful-paint": 2500,
    "interactive": 3500,
    "max-potential-fid": 130
  },
  "resourceSizes": {
    "script": 300000,
    "stylesheet": 75000,
    "image": 500000,
    "total": 1000000
  },
  "resourceCounts": {
    "script": 30,
    "stylesheet": 10,
    "third-party": 15
  }
}
```

---

### 3. OWASP ZAP - Security Testing

**Purpose**: Dynamic Application Security Testing (DAST) for vulnerability detection

**Features**:
- Active and passive scanning
- OWASP Top 10 vulnerability detection
- API security testing
- Authentication testing
- Session management validation

**Installation** (Docker):
```bash
docker pull owasp/zap2docker-stable
```

**Configuration** (`zap-config.yaml`):
```yaml
env:
  contexts:
    - name: "Cortex DC Web"
      urls:
        - "http://localhost:3000"
      includePaths:
        - "http://localhost:3000/.*"
      excludePaths:
        - "http://localhost:3000/static/.*"
        - "http://localhost:3000/_next/.*"
      authentication:
        method: "formBased"
        parameters:
          loginUrl: "http://localhost:3000/api/auth/login"
          loginRequestData: "email={%username%}&password={%password%}"
        verification:
          method: "response"
          loggedInRegex: "\\Q{\"success\":true}\\E"
          loggedOutRegex: "\\Q401\\E"
      users:
        - name: "test-user"
          credentials:
            username: "test@example.com"
            password: "TestPassword123!"

  scanners:
    - name: "activeScan"
      policy: "Default Policy"
      strength: "MEDIUM"
      alertThreshold: "MEDIUM"

  rules:
    - id: 10020
      name: "X-Frame-Options Header Not Set"
      threshold: "MEDIUM"
    - id: 10021
      name: "X-Content-Type-Options Header Missing"
      threshold: "MEDIUM"
    - id: 10023
      name: "Information Disclosure - Debug Error Messages"
      threshold: "MEDIUM"
```

**Running ZAP Scan**:
```bash
# Baseline scan (passive)
docker run -v $(pwd):/zap/wrk:rw \
  owasp/zap2docker-stable zap-baseline.py \
  -t http://host.docker.internal:3000 \
  -r zap-baseline-report.html

# Full scan (active + passive)
docker run -v $(pwd):/zap/wrk:rw \
  owasp/zap2docker-stable zap-full-scan.py \
  -t http://host.docker.internal:3000 \
  -r zap-full-report.html

# API scan
docker run -v $(pwd):/zap/wrk:rw \
  owasp/zap2docker-stable zap-api-scan.py \
  -t http://host.docker.internal:3000/api/openapi.json \
  -f openapi \
  -r zap-api-report.html
```

---

### 4. WebPageTest API - Performance Monitoring

**Purpose**: Real-world performance monitoring from global locations

**Features**:
- Real user metrics from 30+ locations
- Network throttling (3G, 4G, LTE)
- Device emulation
- Waterfall analysis
- Video capture
- Filmstrip view

**Installation**:
```bash
pnpm add -D webpagetest
```

**Configuration** (`webpagetest.config.js`):
```javascript
module.exports = {
  apiKey: process.env.WEBPAGETEST_API_KEY,
  tests: [
    {
      url: 'https://cortex-dc.example.com/',
      location: 'Dulles:Chrome',
      connectivity: '4G',
      runs: 3,
      firstViewOnly: false,
      video: true,
      lighthouse: true,
    },
    {
      url: 'https://cortex-dc.example.com/login',
      location: 'London_EC2:Chrome',
      connectivity: 'Cable',
      runs: 3,
    },
    {
      url: 'https://cortex-dc.example.com/pov',
      location: 'Tokyo:Chrome',
      connectivity: '3G',
      runs: 3,
    },
  ],
  budgets: {
    loadTime: 3000,
    firstContentfulPaint: 1500,
    largestContentfulPaint: 2500,
    timeToInteractive: 3500,
    totalSize: 1000000,
  },
};
```

**API Integration** (`scripts/webpagetest.ts`):
```typescript
import WebPageTest from 'webpagetest';

const wpt = new WebPageTest('www.webpagetest.org', process.env.WEBPAGETEST_API_KEY);

async function runTest(url: string, options: any) {
  return new Promise((resolve, reject) => {
    wpt.runTest(url, options, (err, result) => {
      if (err) return reject(err);

      console.log(`Test submitted: ${result.data.testId}`);
      console.log(`View results: ${result.data.userUrl}`);

      // Poll for results
      wpt.getTestResults(result.data.testId, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  });
}

// Run tests
const results = await runTest('https://cortex-dc.example.com/', {
  location: 'Dulles:Chrome',
  connectivity: '4G',
  runs: 3,
  firstViewOnly: false,
  video: true,
  lighthouse: true,
});

console.log('Performance Results:', results);
```

---

## Test Coverage Strategy

### 1. Unit Tests

**Coverage Target**: 80%+

**Tools**:
- Vitest for component and utility testing
- Jest for backend services
- React Testing Library for component testing

**Key Areas**:
```typescript
// Component tests
describe('LoginForm', () => {
  it('should handle email/password login', async () => {
    // Test implementation
  });

  it('should handle OAuth login', async () => {
    // Test implementation
  });

  it('should display validation errors', async () => {
    // Test implementation
  });
});

// Service tests
describe('POVService', () => {
  it('should create POV with valid data', async () => {
    // Test implementation
  });

  it('should handle phase transitions', async () => {
    // Test implementation
  });
});

// Adapter tests
describe('DatabaseAdapter', () => {
  it('should switch between Firebase and PostgreSQL', async () => {
    // Test implementation
  });
});
```

---

### 2. Integration Tests

**Coverage Target**: Critical flows

**Tools**:
- Supertest for API testing
- Firebase Emulator for Firebase mode
- Docker for self-hosted mode

**Key Areas**:
```typescript
// API endpoint tests
describe('Auth API', () => {
  it('POST /api/auth/login - should authenticate user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });

  it('POST /api/auth/oauth/google - should redirect to Google', async () => {
    const response = await request(app)
      .get('/api/auth/oauth/google')
      .expect(302);

    expect(response.headers.location).toContain('accounts.google.com');
  });
});

// Database integration tests
describe('Database Integration', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('should create and retrieve POV', async () => {
    const db = getDatabase();
    const pov = await db.create('povs', { name: 'Test POV' });
    const retrieved = await db.findOne('povs', pov.id);

    expect(retrieved).toEqual(expect.objectContaining({ name: 'Test POV' }));
  });
});
```

---

### 3. E2E Tests

**Coverage Target**: Critical user journeys

**Example Tests** (`tests/e2e/auth.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with email and password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should login with Google OAuth', async ({ page, context }) => {
    await page.goto('/login');

    // Intercept OAuth redirect
    await context.route('**/api/auth/oauth/google', route => {
      route.fulfill({ status: 302, headers: { 'Location': '/oauth-mock' } });
    });

    await page.click('button:has-text("Sign in with Google")');

    // Mock OAuth callback
    await page.goto('/api/auth/oauth/google/callback?code=mock_code');

    await expect(page).toHaveURL('/');
  });

  test('should handle logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Logout
    await page.click('button:has-text("Logout")');

    await expect(page).toHaveURL('/login');
  });
});

test.describe('POV Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('should create new POV', async ({ page }) => {
    await page.goto('/pov');
    await page.click('button:has-text("New POV")');

    await page.fill('input[name="name"]', 'Test POV');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Test POV')).toBeVisible();
  });

  test('should navigate POV phases', async ({ page }) => {
    await page.goto('/pov/test-pov-id');

    // Check initial phase
    await expect(page.locator('text=Planning')).toBeVisible();

    // Move to next phase
    await page.click('button:has-text("Start POV")');

    await expect(page.locator('text=In Progress')).toBeVisible();
  });
});
```

---

## Implementation Guide

### Phase 1: Setup (Week 1)

#### Day 1-2: Playwright Setup
```bash
# Install Playwright
pnpm add -D @playwright/test

# Install browsers
npx playwright install

# Create test directory structure
mkdir -p tests/e2e/{auth,pov,trr,dashboard}

# Create Playwright config
touch playwright.config.ts

# Run initial tests
pnpm test:e2e
```

#### Day 3-4: Lighthouse Setup
```bash
# Install Lighthouse CI
pnpm add -D lighthouse lighthouse-ci

# Create config
touch lighthouserc.js

# Run initial audit
pnpm exec lhci autorun
```

#### Day 5: OWASP ZAP Setup
```bash
# Pull ZAP Docker image
docker pull owasp/zap2docker-stable

# Create ZAP config
touch zap-config.yaml

# Run baseline scan
docker run -v $(pwd):/zap/wrk:rw \
  owasp/zap2docker-stable zap-baseline.py \
  -t http://host.docker.internal:3000 \
  -r zap-report.html
```

---

### Phase 2: Test Implementation (Week 2-3)

#### Week 2: Core Tests
- Authentication tests (email, OAuth, SAML)
- POV CRUD operations
- TRR workflows
- Dashboard interactions

#### Week 3: Advanced Tests
- Multi-browser testing
- Mobile responsive tests
- Performance regression tests
- Security vulnerability tests

---

### Phase 3: CI/CD Integration (Week 4)

#### GitHub Actions Workflow (`.github/workflows/test.yml`):
```yaml
name: Comprehensive Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Run Lighthouse CI
        run: |
          pnpm exec lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Start application
        run: |
          docker-compose up -d
          sleep 10

      - name: Run OWASP ZAP scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'http://localhost:3000'
          rules_file_name: 'zap-rules.tsv'
          cmd_options: '-a'

      - name: Upload ZAP report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: zap-report
          path: report_html.html

  webpagetest:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Run WebPageTest
        run: pnpm exec ts-node scripts/webpagetest.ts
        env:
          WEBPAGETEST_API_KEY: ${{ secrets.WEBPAGETEST_API_KEY }}
```

---

## Monitoring & Reporting

### 1. Test Results Dashboard

**Tools**:
- Playwright HTML Reporter
- Lighthouse CI Server
- ZAP Dashboard
- WebPageTest Dashboard

**Metrics to Track**:
- Test pass/fail rate
- Test execution time
- Code coverage percentage
- Performance scores
- Security vulnerability count
- Accessibility score

---

### 2. Performance Monitoring

**Real User Monitoring (RUM)**:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Custom Performance Tracking**:
```typescript
// lib/performance.ts
export function trackPerformance() {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      // Send to analytics
      console.log('Performance Metrics:', {
        pageLoadTime,
        connectTime,
        renderTime,
      });
    });
  }
}
```

---

### 3. Security Monitoring

**Dependency Scanning**:
```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  push:
    branches: [main]

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run npm audit
        run: pnpm audit --audit-level=moderate
```

---

## Success Metrics

### Key Performance Indicators (KPIs)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Test Coverage | 80%+ | TBD | 🟡 In Progress |
| E2E Test Pass Rate | 95%+ | TBD | 🟡 In Progress |
| Performance Score | 90+ | TBD | 🟡 In Progress |
| Accessibility Score | 90+ | TBD | 🟡 In Progress |
| Security Vulnerabilities | 0 Critical/High | TBD | 🟡 In Progress |
| Page Load Time | < 2s | TBD | 🟡 In Progress |
| LCP | < 2.5s | TBD | 🟡 In Progress |
| CLS | < 0.1 | TBD | 🟡 In Progress |

---

## Next Steps

1. ✅ Complete auth endpoint implementation
2. 🟡 Set up Playwright test suite
3. 🟡 Configure Lighthouse CI
4. 🟡 Integrate OWASP ZAP
5. 🟡 Set up WebPageTest monitoring
6. 🟡 Create CI/CD pipeline
7. 🟡 Establish monitoring dashboards
8. 🟡 Train team on testing practices

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [WebPageTest API Documentation](https://docs.webpagetest.org/api/)
- [Testing Best Practices](https://martinfowler.com/testing/)

---

**Document Version**: 1.0
**Last Review**: 2025-10-14
**Next Review**: 2025-11-14
