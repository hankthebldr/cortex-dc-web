import { getAdminAuth } from './adminApp.js';

/**
 * E2E Test Users
 *
 * These users are used by Playwright E2E tests in tests/e2e/
 * They should match the users defined in tests/e2e/fixtures/users.ts
 */

type Role = 'user' | 'admin' | 'viewer';

const e2eTestUsers: Array<{
  email: string;
  password: string;
  displayName: string;
  role: Role;
  description: string;
}> = [
  {
    email: 'admin@cortex.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin',
    description: 'Admin user with full permissions - used for admin workflow tests'
  },
  {
    email: 'user@cortex.com',
    password: 'user123',
    displayName: 'Test User',
    role: 'user',
    description: 'Regular user - used for standard workflow tests'
  },
  {
    email: 'viewer@cortex.com',
    password: 'viewer123',
    displayName: 'Viewer User',
    role: 'viewer',
    description: 'Read-only user - used for permission testing'
  },
  {
    email: 'test@example.com',
    password: 'test123',
    displayName: 'Test Account',
    role: 'user',
    description: 'Generic test account - used for various test scenarios'
  }
];

/**
 * Seed E2E test users into Firebase Auth
 * This function is idempotent - it will not fail if users already exist
 */
export async function seedE2EUsers() {
  console.log('🧪 Seeding E2E test users...\n');
  const auth = getAdminAuth();

  for (const u of e2eTestUsers) {
    try {
      // Idempotent: find or create
      let user;
      try {
        user = await auth.getUserByEmail(u.email);
        console.log(`   ✓ Found existing user: ${u.email} (${u.role})`);
      } catch {
        user = await auth.createUser({
          email: u.email,
          password: u.password,
          displayName: u.displayName,
          emailVerified: true
        });
        console.log(`   ✨ Created user: ${u.email} (${u.role})`);
      }

      // Set custom claims for role-based access
      await auth.setCustomUserClaims(user.uid, { role: u.role });

      // Force token refresh by revoking tokens, so client picks up claims next sign-in
      await auth.revokeRefreshTokens(user.uid);

      console.log(`      └─ ${u.description}`);
    } catch (error) {
      console.error(`   ❌ Failed to seed user ${u.email}:`, error);
      throw error;
    }
  }

  console.log('\n✅ E2E test users seeded successfully');
  console.log('\nTest Users Summary:');
  console.log('==================');
  e2eTestUsers.forEach(u => {
    console.log(`${u.email.padEnd(25)} | ${u.role.padEnd(10)} | ${u.password}`);
  });
  console.log('\nThese users are now ready for E2E testing with Playwright.');
  console.log('Run: pnpm test:e2e\n');
}

// Allow direct execution
if (process.env.RUN_DIRECT === '1') {
  seedE2EUsers()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('❌ E2E user seeding failed:', e);
      process.exit(1);
    });
}
