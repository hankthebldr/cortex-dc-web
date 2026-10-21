# CI/CD Best Practices & Troubleshooting Guide

## Table of Contents
1. [CI/CD Overview](#cicd-overview)
2. [Build Process](#build-process)
3. [Common Build Failures](#common-build-failures)
4. [Frontend Best Practices](#frontend-best-practices)
5. [Troubleshooting Guide](#troubleshooting-guide)

---

## CI/CD Overview

### Current Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Push/PR Trigger                      │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
    ┌───▼────┐             ┌───▼─────┐
    │  Lint  │             │Type Check│
    └───┬────┘             └────┬────┘
        │                       │
        └───────────┬───────────┘
                    │
              ┌─────▼─────┐
              │   Build   │
              │ (Matrix)  │
              ├───────────┤
              │  - Local  │
              │  - K8s    │
              │  - Firebase│
              └─────┬─────┘
                    │
        ┌───────────┴───────────┐
        │                       │
    ┌───▼────┐          ┌──────▼──────┐
    │ Smoke  │          │   Docker    │
    │ Tests  │          │    Build    │
    └───┬────┘          └──────┬──────┘
        │                      │
        └──────────┬───────────┘
                   │
           ┌───────▼────────┐
           │    Deploy      │
           ├────────────────┤
           │ Firebase/GKE   │
           └────────────────┘
```

### Pipeline Files

1. **ci.yml** - Basic lint, type-check, build
2. **build-matrix.yml** - Multi-target builds (local, k8s, firebase)
3. **comprehensive-test.yml** - Full test suite
4. **docker-build-push.yml** - Container builds
5. **firebase-hosting-pull-request.yml** - Preview deployments

---

## Build Process

### Local Build

```bash
# Install dependencies
pnpm install

# Lint check
pnpm lint

# Type check
pnpm type-check

# Build for local
TARGET_ENV=local pnpm build:local

# Start server
pnpm start:local
```

### CI Build Requirements

All builds must:
1. ✅ Install dependencies with `--frozen-lockfile`
2. ✅ Pass linting
3. ✅ Pass type checking
4. ✅ Build without errors
5. ✅ Generate valid output artifacts

---

## Common Build Failures

### 1. Missing node_modules

**Error:**
```
sh: 1: next: not found
WARN  Local package.json exists, but node_modules missing
```

**Cause:** Dependencies not installed

**Fix:**
```bash
pnpm install
```

**CI Fix:** Ensure `pnpm install --frozen-lockfile` runs before build

### 2. TypeScript Errors

**Error:**
```
Type error: Property 'foo' does not exist on type 'Bar'
```

**Fix:**
```bash
# Check types locally
pnpm type-check

# Fix type errors in code
# Then commit and push
```

**Best Practice:**
- Always run `pnpm type-check` before committing
- Use strict TypeScript settings
- Add proper type definitions

### 3. ESLint Errors

**Error:**
```
✖ 3 problems (3 errors, 0 warnings)
```

**Fix:**
```bash
# Check lint errors
pnpm lint

# Auto-fix where possible
pnpm lint --fix

# Fix remaining errors manually
```

**Best Practice:**
- Set up ESLint in your IDE
- Enable auto-fix on save
- Follow project linting rules

### 4. Missing Environment Variables

**Error:**
```
Error: Environment variable 'NEXT_PUBLIC_API_URL' is not defined
```

**Fix:**
```bash
# Create .env.local
cp .env.example .env.local

# Fill in required variables
```

**CI Fix:**
- Add secrets to GitHub repository settings
- Use environment-specific .env files

### 5. Import Resolution Errors

**Error:**
```
Module not found: Can't resolve '@cortex/db'
```

**Causes:**
- Workspace not linked
- TypeScript path not configured
- Package not built

**Fix:**
```bash
# Rebuild workspace
pnpm install

# Check tsconfig.json paths
# Build dependent packages
cd packages/db && pnpm build
```

### 6. Next.js Build Errors

**Error:**
```
Error: Build failed with X errors
```

**Common Causes:**
- Invalid page structure
- Missing export
- Runtime errors in components
- Image optimization issues

**Fix:**
```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Rebuild
cd apps/web && pnpm build
```

### 7. Turbo Cache Issues

**Error:**
```
Task failed: build
```

**Fix:**
```bash
# Clear turbo cache
rm -rf node_modules/.cache/turbo

# Force rebuild
pnpm build --force
```

---

## Frontend Best Practices

### 1. Component Structure

**✅ Good:**
```tsx
'use client';

import React from 'react';
import { Button } from '@cortex-dc/ui';

interface MyComponentProps {
  title: string;
  onSubmit: () => void;
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onSubmit}>Submit</Button>
    </div>
  );
}

export default MyComponent;
```

**❌ Bad:**
```tsx
import React from 'react';

export default function ({ title, onSubmit }) {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
}
```

### 2. Error Boundaries

**✅ Good - Use error.tsx:**
```tsx
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 3. Loading States

**✅ Good - Use loading.tsx:**
```tsx
// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

### 4. Image Optimization

**✅ Good:**
```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority
/>
```

**❌ Bad:**
```tsx
<img src="/logo.png" alt="Logo" />
```

### 5. Data Fetching

**✅ Good - Server Components:**
```tsx
// Server Component (default)
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{data.title}</div>;
}
```

**✅ Good - Client Components with SWR:**
```tsx
'use client';

import useSWR from 'swr';

export default function Page() {
  const { data, error, isLoading } = useSWR('/api/data', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return <div>{data.title}</div>;
}
```

### 6. Environment Variables

**✅ Good:**
```typescript
// Only use NEXT_PUBLIC_ for client-side
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Server-only variables (no NEXT_PUBLIC_ prefix)
const SECRET_KEY = process.env.SECRET_KEY;
```

**⚠️ Security:**
- Never expose secrets to client
- Use `NEXT_PUBLIC_` prefix only for public data
- Validate all env vars at startup

### 7. Build Output

**Configure next.config.js:**
```javascript
module.exports = {
  // For Firebase (static export)
  output: process.env.TARGET_ENV === 'firebase' ? 'export' : undefined,

  // For K8s/Local (standalone)
  output: process.env.TARGET_ENV !== 'firebase' ? 'standalone' : undefined,

  // Images (disable for static export)
  images: {
    unoptimized: process.env.TARGET_ENV === 'firebase',
  },
};
```

---

## Troubleshooting Guide

### Build Fails in CI but Works Locally

**Possible Causes:**
1. Different Node versions
2. Missing environment variables
3. Cached dependencies
4. Platform-specific code

**Solutions:**
```bash
# 1. Match Node version
nvm use 20.11.0

# 2. Check .env files
diff .env.local .env.example

# 3. Clear all caches
rm -rf node_modules .next .turbo
pnpm install

# 4. Check for platform-specific dependencies
pnpm audit
```

### Type Check Passes Locally but Fails in CI

**Cause:** TypeScript version mismatch

**Fix:**
```bash
# Check versions
pnpm list typescript

# Ensure consistent version in workspace
# Update package.json if needed
```

### Build Succeeds but Runtime Error

**Cause:** Dynamic imports, environment variables, or missing files

**Debug:**
```bash
# Build and start locally
pnpm build
pnpm start

# Check browser console
# Check server logs
```

### Slow Builds

**Optimizations:**

1. **Use Turbo Cache:**
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"],
      "cache": true
    }
  }
}
```

2. **Parallelize:**
```bash
# Build packages in parallel
pnpm -r --parallel build
```

3. **Incremental Builds:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    incrementalCacheHandlerPath: './cache-handler.js',
  },
};
```

### Out of Memory Errors

**Fix:**
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Or in package.json
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

---

## CI/CD Checklist

### Before Committing

- [ ] Code builds locally (`pnpm build`)
- [ ] Tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] No console.log/debugger statements
- [ ] Environment variables documented

### Pull Request

- [ ] PR description explains changes
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] Screenshots for UI changes
- [ ] Breaking changes noted

### Before Merging

- [ ] CI pipeline passes
- [ ] Code reviewed and approved
- [ ] No merge conflicts
- [ ] Version bumped (if needed)
- [ ] Changelog updated

### After Merging

- [ ] Deployment successful
- [ ] Smoke tests pass
- [ ] Monitoring shows no errors
- [ ] Stakeholders notified

---

## Debugging CI Failures

### 1. Check Build Logs

```bash
# Download artifact logs from GitHub Actions
# Or run locally with same commands as CI
```

### 2. Reproduce Locally

```bash
# Use exact CI commands
pnpm install --frozen-lockfile
pnpm run lint
pnpm run type-check
TARGET_ENV=local pnpm run build:local
```

### 3. Check Dependencies

```bash
# Audit dependencies
pnpm audit

# Check for duplicates
pnpm dedupe

# Update if needed
pnpm update
```

### 4. Verify Environment

```bash
# Check Node version
node --version  # Should match CI

# Check pnpm version
pnpm --version  # Should match CI

# Check for platform differences
uname -a
```

---

## Performance Monitoring

### Build Time Tracking

```yaml
# .github/workflows/ci.yml
- name: Build with timing
  run: |
    time pnpm build
    echo "Build completed in $SECONDS seconds"
```

### Bundle Size Analysis

```bash
# Add to package.json
"analyze": "ANALYZE=true next build"

# Run
pnpm analyze
```

### Lighthouse CI

```bash
# Run Lighthouse
pnpm test:lighthouse

# Check scores
# Performance > 90
# Accessibility > 90
# Best Practices > 90
# SEO > 90
```

---

## Quick Fix Commands

```bash
# Clear everything and rebuild
rm -rf node_modules .next .turbo pnpm-lock.yaml
pnpm install
pnpm build

# Fix linting
pnpm lint --fix

# Update dependencies
pnpm update --latest

# Check for security issues
pnpm audit --fix

# Rebuild specific package
cd packages/ui && pnpm build

# Force turbo rebuild
pnpm build --force

# Debug build
DEBUG=* pnpm build
```

---

## Resources

- [Next.js Build Errors](https://nextjs.org/docs/messages)
- [Turbo Documentation](https://turbo.build/repo/docs)
- [pnpm Troubleshooting](https://pnpm.io/errors)
- [GitHub Actions Debugging](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)

---

## Summary

**Key Takeaways:**

1. ✅ Always run `pnpm lint` and `pnpm type-check` before committing
2. ✅ Use `--frozen-lockfile` in CI to ensure deterministic builds
3. ✅ Match Node and pnpm versions between local and CI
4. ✅ Clear caches when encountering mysterious errors
5. ✅ Use proper TypeScript types everywhere
6. ✅ Handle errors gracefully
7. ✅ Optimize images and bundle size
8. ✅ Write tests for critical paths
9. ✅ Document environment variables
10. ✅ Monitor build times and bundle sizes

Following these practices will ensure reliable, fast CI/CD pipelines!
