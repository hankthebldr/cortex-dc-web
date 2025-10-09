# Testing Guide

## Overview

This document outlines the testing strategy for the Cortex DC Web application, including unit tests, integration tests, and end-to-end tests.

## Current Test Suite

### Cloud Functions

#### onCreateUser Function Test
- **Location:** `functions/test/onCreateUser.test.ts`
- **Purpose:** Tests the user profile creation function
- **Coverage:** Function invocation and basic error handling
- **Command:** `cd functions && npm test`

### Test Results
- ✅ Function can be properly imported and called
- ✅ Handles UserRecord input correctly
- ✅ Basic structure and logic work as expected

## Running Tests

### Unit Tests
```bash
# Run all function tests
cd functions && npm test

# Run specific test file
cd functions && npm test -- --grep "onCreateUser"
```

### With Firebase Emulators (Recommended for full testing)
```bash
# Start emulators
firebase emulators:start --only auth,firestore,functions

# In another terminal, run tests
cd functions && FIRESTORE_EMULATOR_HOST=localhost:8081 npm test
```

## Test Structure

### Cloud Functions Tests
- Located in `functions/test/`
- Uses Mocha, Chai, and firebase-functions-test
- Tests function logic without requiring live Firebase services

### Future Test Additions

1. **Security Rules Tests**
   - Test RBAC permissions for users, managers, and admins
   - Verify data access restrictions
   
2. **UI Component Tests**
   - Test dashboard components render correctly
   - Verify role-based navigation
   - Test theme switching
   
3. **Integration Tests**
   - Test complete user workflows
   - Test data flow between components
   
4. **E2E Tests**
   - Full application workflow testing
   - Cross-browser compatibility
   - Mobile responsiveness

## Best Practices

1. **Isolation:** Each test should be independent and not rely on external state
2. **Mocking:** Use mocks for external dependencies (Firebase services, APIs)
3. **Coverage:** Aim for high test coverage on critical business logic
4. **Performance:** Tests should run quickly to support rapid development

## Continuous Integration

Tests should be integrated into your CI/CD pipeline to ensure:
- All tests pass before deployment
- Code quality standards are maintained
- Regression bugs are caught early

## Next Steps

1. Add security rules testing with `@firebase/rules-unit-testing`
2. Add React component testing with Jest and React Testing Library
3. Set up automated test running in CI/CD pipeline
4. Add performance and load testing for critical functions