# Testing Quick Start Guide

**Last Updated**: 2025-10-14

This guide helps you quickly set up and run the comprehensive test suite for the Cortex DC Web platform.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Setup](#quick-setup)
3. [Running Tests](#running-tests)
4. [Common Workflows](#common-workflows)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)

---

## Prerequisites

### Required Software

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Docker**: For OWASP ZAP security testing (optional)

### Installation

```bash
# Verify Node.js version
node --version  # Should be >= 18.0.0

# Install pnpm if not already installed
npm install -g pnpm@8

# Verify pnpm
pnpm --version
```

---

## Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd cortex-dc-web

# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and set test user credentials
# TEST_ADMIN_EMAIL=admin@cortex.com
# TEST_ADMIN_PASSWORD=admin123
```

### 3. Verify Setup

```bash
# Run type checking
pnpm type-check

# Build the project
pnpm build
```

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
pnpm test:e2e

# Run in UI mode (recommended for development)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Run in debug mode
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e tests/e2e/specs/auth/login.spec.ts

# Run tests for specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit

# View HTML report
pnpm report:e2e
```

### Performance Testing (Lighthouse)

```bash
# Run Lighthouse audits
pnpm test:lighthouse

# Or use alias
pnpm audit:performance
```

**What it tests:**
- Performance score (80%+)
- Accessibility (90%+)
- Best practices (90%+)
- SEO (80%+)
- Core Web Vitals (FCP, LCP, CLS, TBT)

### Security Testing (OWASP ZAP)

```bash
# Start your dev server first
pnpm dev

# In another terminal, run baseline scan
pnpm test:security

# Run full security scan (more thorough, takes longer)
pnpm test:security:full

# View report
open zap-report.html
```

**What it tests:**
- OWASP Top 10 vulnerabilities
- XSS, SQL injection, CSRF
- Security headers
- Session management
- Information disclosure

### WebPageTest Performance Monitoring

```bash
# Set your API key
export WEBPAGETEST_API_KEY=your_key_here

# Run performance tests
pnpm test:performance
```

**What it tests:**
- Real-world performance from global locations
- Network throttling (3G, 4G, LTE)
- Performance budgets
- Filmstrip and waterfall analysis

### Run All Tests

```bash
# Run unit tests, E2E tests, and Lighthouse
pnpm test:all
```

### Security Audits

```bash
# Check for vulnerable dependencies
pnpm audit:security

# Check all dependencies
pnpm audit:dependencies
```

---

## Common Workflows

### Workflow 1: Before Committing Code

```bash
# 1. Type check
pnpm type-check

# 2. Run linting
pnpm lint

# 3. Run unit tests
pnpm test

# 4. Run E2E tests (optional but recommended)
pnpm test:e2e
```

### Workflow 2: Testing a New Feature

```bash
# 1. Start dev server
pnpm dev

# 2. Run E2E tests in UI mode
pnpm test:e2e:ui

# 3. Run specific test file
pnpm test:e2e tests/e2e/specs/your-feature/feature.spec.ts

# 4. Run performance audit
pnpm test:lighthouse
```

### Workflow 3: Before Deploying

```bash
# 1. Build both deployment modes
DEPLOYMENT_MODE=firebase pnpm build
DEPLOYMENT_MODE=self-hosted pnpm build

# 2. Run full test suite
pnpm test:all

# 3. Run security scan
pnpm test:security

# 4. Check for vulnerabilities
pnpm audit:security

# 5. Run performance tests (if production URL available)
pnpm test:performance
```

### Workflow 4: Debugging Failing Tests

```bash
# 1. Run test in debug mode
pnpm test:e2e:debug tests/e2e/specs/auth/login.spec.ts

# 2. Or run in headed mode to see what's happening
pnpm test:e2e:headed

# 3. Check the HTML report for details
pnpm report:e2e

# 4. View screenshots and traces
open playwright-report/index.html
```

---

## Troubleshooting

### Issue: Playwright browsers not installed

**Error**: `browserType.launch: Executable doesn't exist`

**Solution**:
```bash
npx playwright install
```

### Issue: Dev server not running

**Error**: `Test failed: net::ERR_CONNECTION_REFUSED`

**Solution**:
```bash
# Start dev server in a separate terminal
pnpm dev

# Wait for "Ready in Xms"
# Then run tests in another terminal
```

### Issue: Test timeouts

**Error**: `Test timeout of 30000ms exceeded`

**Solution**:
```bash
# Increase timeout in .env.local
E2E_TIMEOUT=60000

# Or increase in specific test
test('test name', async ({ page }) => {
  test.setTimeout(60000);
  // test code
});
```

### Issue: Docker permission denied (ZAP tests)

**Error**: `Got permission denied while trying to connect to Docker daemon`

**Solution**:
```bash
# Add your user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Or run Docker Desktop (Mac/Windows)
```

### Issue: Lighthouse fails to connect

**Error**: `Unable to connect to Chrome`

**Solution**:
```bash
# Close all Chrome instances
# Run lighthouse again
pnpm test:lighthouse
```

### Issue: WebPageTest API key missing

**Error**: `WEBPAGETEST_API_KEY environment variable is required`

**Solution**:
```bash
# Get API key from https://www.webpagetest.org/getkey.php
# Set in environment
export WEBPAGETEST_API_KEY=your_key_here

# Or add to .env.local
echo "WEBPAGETEST_API_KEY=your_key_here" >> .env.local
```

---

## Best Practices

### Writing E2E Tests

✅ **DO**:
- Use data-testid attributes for reliable selectors
- Test critical user flows
- Make tests independent (can run in any order)
- Use meaningful test descriptions
- Clean up test data after tests

❌ **DON'T**:
- Use brittle selectors (CSS classes that might change)
- Test implementation details
- Create test dependencies
- Hard-code timing delays (use waitFor instead)
- Leave test data behind

### Example Test

```typescript
test('should create new POV', async ({ page }) => {
  // Navigate
  await page.goto('/pov');

  // Interact
  await page.click('[data-testid="create-pov-button"]');
  await page.fill('[data-testid="pov-name"]', 'Test POV');
  await page.fill('[data-testid="pov-description"]', 'Description');

  // Submit
  await page.click('[data-testid="submit-button"]');

  // Verify
  await expect(page.locator('[data-testid="success-message"]'))
    .toBeVisible();
});
```

### Performance Testing

✅ **DO**:
- Set realistic performance budgets
- Test on production-like environment
- Test with real data volumes
- Monitor Core Web Vitals
- Test on different network speeds

❌ **DON'T**:
- Test on localhost only (use staging)
- Ignore mobile performance
- Set unrealistic budgets
- Test with empty database
- Ignore third-party scripts impact

### Security Testing

✅ **DO**:
- Run security scans regularly
- Test with authenticated users
- Update OWASP ZAP regularly
- Review all findings
- Fix critical/high vulnerabilities immediately

❌ **DON'T**:
- Scan production directly (use staging)
- Ignore medium/low findings
- Run scans without authentication
- Deploy with known vulnerabilities
- Use default configurations

---

## Test Coverage Goals

| Test Type | Coverage Target | Current Status |
|-----------|----------------|----------------|
| Unit Tests | 80%+ | 🟡 In Progress |
| E2E Tests | Critical flows | ✅ Complete |
| Performance | 90+ score | 🟡 In Progress |
| Accessibility | 90+ score | 🟡 In Progress |
| Security | 0 Critical/High | 🟡 In Progress |

---

## Continuous Integration

All tests run automatically on:
- ✅ Push to main/develop branches
- ✅ Pull requests
- ✅ Daily scheduled runs (2 AM UTC)

View CI results:
- Go to **Actions** tab in GitHub
- Select **Comprehensive Test Suite** workflow
- View job results and download artifacts

---

## Getting Help

### Documentation
- [Comprehensive Testing Strategy](./COMPREHENSIVE_TESTING_STRATEGY.md)
- [Playwright Documentation](https://playwright.dev/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)

### Support
- Create an issue in GitHub
- Ask in team Slack channel
- Review test results in CI

---

## Quick Command Reference

```bash
# Unit Tests
pnpm test                    # Run unit tests
pnpm test --watch            # Watch mode
pnpm test --coverage         # With coverage

# E2E Tests
pnpm test:e2e               # Run E2E tests
pnpm test:e2e:ui            # UI mode
pnpm test:e2e:headed        # Headed mode
pnpm test:e2e:debug         # Debug mode
pnpm report:e2e             # View report

# Performance
pnpm test:lighthouse        # Lighthouse audit
pnpm test:performance       # WebPageTest

# Security
pnpm test:security          # OWASP ZAP scan
pnpm audit:security         # Dependency audit

# All Tests
pnpm test:all               # Run all tests
```

---

**Happy Testing! 🧪✨**

If you encounter any issues or have suggestions for improving this guide, please create an issue or submit a pull request.
