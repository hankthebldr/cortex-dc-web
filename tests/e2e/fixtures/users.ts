/**
 * Test User Fixtures
 *
 * Common user data for E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'user' | 'viewer';
}

/**
 * Test users for E2E tests
 * These users should be seeded in the test database
 */
export const TEST_USERS: Record<string, TestUser> = {
  admin: {
    email: 'admin@cortex.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin',
  },
  user: {
    email: 'user@cortex.com',
    password: 'user123',
    displayName: 'Test User',
    role: 'user',
  },
  viewer: {
    email: 'viewer@cortex.com',
    password: 'viewer123',
    displayName: 'Viewer User',
    role: 'viewer',
  },
  test: {
    email: 'test@example.com',
    password: 'test123',
    displayName: 'Test Account',
    role: 'user',
  },
};

/**
 * Get test user by role
 */
export function getTestUser(role: 'admin' | 'user' | 'viewer' = 'user'): TestUser {
  return TEST_USERS[role];
}

/**
 * Get admin user
 */
export function getAdminUser(): TestUser {
  return TEST_USERS.admin;
}

/**
 * Get regular user
 */
export function getRegularUser(): TestUser {
  return TEST_USERS.user;
}
