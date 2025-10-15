# Contributing to Cortex DC Web Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to the Cortex Domain Consultant Web Platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Convention](#commit-convention)
- [Security](#security)

## Code of Conduct

This project adheres to the Contributor Covenant Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@cortex-dc.com.

## Getting Started

### Prerequisites

- **Node.js**: v20.x or higher (use nvm: `nvm use`)
- **pnpm**: v8.15.x or higher
- **Docker**: For running local services
- **Firebase CLI**: v13.x or higher
- **kubectl**: For Kubernetes deployments

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/cortex-dc-web.git
cd cortex-dc-web

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Start development environment (one command)
make demo

# Or manually:
pnpm run emulators      # Terminal 1: Firebase emulators
pnpm run dev:web        # Terminal 2: Next.js dev server
```

See [QUICK_START.md](./QUICK_START.md) for detailed setup instructions.

### Project Structure

```
cortex-dc-web/
├── apps/
│   └── web/              # Next.js 14 application
├── packages/
│   ├── db/               # Database adapters (Firebase/PostgreSQL)
│   ├── ai/               # AI services
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities
│   └── admin-tools/      # Admin scripts
├── functions/            # Cloud Functions
├── kubernetes/           # K8s manifests
├── terraform/            # Infrastructure as Code
└── scripts/              # Development scripts
```

## Development Workflow

### 1. Create a Branch

Follow trunk-based development with short-lived feature branches:

```bash
# Update master
git checkout master
git pull origin master

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

### 2. Make Changes

- Follow the [Coding Standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Keep commits atomic and focused

### 3. Test Locally

```bash
# Run type checking
pnpm run type-check

# Run tests
pnpm run test

# Run E2E tests
pnpm run test:e2e

# Check build
pnpm run build
```

### 4. Commit Changes

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat(pov): add test plan validation"
```

See [Commit Convention](#commit-convention) for details.

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name

# Create PR via GitHub CLI
gh pr create --title "feat: Add test plan validation" --body "Implements validation for POV test plans..."
```

## Pull Request Process

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows the style guidelines
- [ ] All tests pass (`pnpm test`)
- [ ] New tests cover your changes
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] PR description explains the changes
- [ ] No merge conflicts with master
- [ ] CI/CD checks pass

### PR Template

Your PR should include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)

## Related Issues
Fixes #123
```

### Review Process

1. **Automated checks** run on PR (lint, test, build, security)
2. **CODEOWNERS** are automatically assigned for review
3. **At least 1 approval** required before merge
4. **All discussions** must be resolved
5. **Squash and merge** into master

## Coding Standards

### TypeScript

- **Strict mode** enabled (`strict: true`)
- Use **explicit types** (avoid `any`)
- Prefer **interfaces** over type aliases for objects
- Use **const assertions** for literal types

```typescript
// Good
interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

// Avoid
type UserProfile = {
  id: any;
  email: any;
  role: string;
};
```

### React / Next.js

- Use **React Server Components** by default
- Mark client components with `'use client'`
- Prefer **function components** with hooks
- Use **TypeScript** for all components
- Follow **Atomic Design** principles (atoms → molecules → organisms)

```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component
'use client';
export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile`, `POVList`)
- **Files**: Match component name (`UserProfile.tsx`)
- **Functions/Variables**: camelCase (`getUserProfile`, `isActive`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `POVStatus`)
- **CSS Classes**: kebab-case or Tailwind utilities

### File Organization

```typescript
// Component structure
import statements
type/interface definitions
helper functions
main component
sub-components
exports

// Example:
import * as React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### ESLint & Prettier

- Run **ESLint** before committing: `pnpm lint`
- **Prettier** formats on save (configure your editor)
- Fix issues: `pnpm lint:fix`

## Testing Requirements

### Unit Tests (Vitest)

- Test all **business logic**
- Mock external dependencies
- Aim for **80%+ coverage**

```typescript
// Example
import { describe, it, expect } from 'vitest';
import { validatePOV } from './validation';

describe('validatePOV', () => {
  it('should validate a valid POV', () => {
    const pov = { name: 'Test POV', status: 'planning' };
    expect(validatePOV(pov)).toBe(true);
  });
});
```

### Integration Tests

- Test **API routes**
- Test **database operations**
- Use **test fixtures**

### E2E Tests (Playwright)

- Test **critical user flows**
- Test across **multiple browsers**
- Use **test data seeding**

```bash
# Run E2E tests
pnpm run test:e2e

# Run with UI
pnpm run test:e2e:ui

# Run specific test
pnpm run test:e2e tests/pov-creation.spec.ts
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for automated changelog generation and versioning.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring (no feat/fix)
- **test**: Adding/updating tests
- **chore**: Maintenance tasks (deps, config)
- **perf**: Performance improvements
- **ci**: CI/CD changes
- **build**: Build system changes

### Scopes

- `pov` - POV-related changes
- `trr` - TRR-related changes
- `project` - Project management
- `auth` - Authentication
- `ui` - UI components
- `db` - Database layer
- `api` - API routes
- `k8s` - Kubernetes configs
- `ci` - CI/CD pipelines

### Examples

```bash
feat(pov): add test plan validation
fix(auth): resolve token refresh race condition
docs(readme): update setup instructions
refactor(db): migrate to adapter pattern
test(pov): add integration tests for creation flow
chore(deps): update Next.js to v14.2
```

### Breaking Changes

```bash
feat(api)!: migrate to v2 API endpoints

BREAKING CHANGE: API v1 endpoints are removed. Migrate to v2.
```

### Commit Signing

All commits **must be signed** with GPG:

```bash
# Configure git to sign commits
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_KEY_ID

# Sign a commit
git commit -S -m "feat: add feature"
```

## Security

### Reporting Vulnerabilities

Please report security vulnerabilities to security@cortex-dc.com. See [SECURITY.md](./SECURITY.md) for details.

### Security Guidelines

- **Never commit secrets** (use .env files, Secret Manager)
- **Validate all input** (sanitize user data)
- **Use parameterized queries** (prevent SQL injection)
- **Keep dependencies updated** (Renovate bot handles this)
- **Scan images for vulnerabilities** (Trivy in CI)

## Code Review Guidelines

### For Authors

- Keep PRs **focused and small** (<400 lines)
- Provide **clear description** and context
- Respond to feedback **promptly**
- **Resolve all comments** before requesting re-review

### For Reviewers

- Review **within 24 hours**
- Focus on **logic, security, and maintainability**
- Be **constructive and respectful**
- Approve only if you'd **deploy it yourself**

## Getting Help

- **Documentation**: See [QUICK_START.md](./QUICK_START.md) and [ARCHITECTURE_K8S_READY.md](./ARCHITECTURE_K8S_READY.md)
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Slack**: Join our #cortex-dc-dev channel

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Cortex DC Web Platform! 🚀
