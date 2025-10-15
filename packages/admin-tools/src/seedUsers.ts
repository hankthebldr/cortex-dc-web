import { getAdminAuth } from './adminApp.js';

type Role = 'user' | 'manager' | 'admin' | 'viewer';

const defaultUsers: Array<{
  email: string;
  password: string;
  displayName: string;
  role: Role;
}> = [
  // E2E Test Users (used by Playwright tests)
  {
    email: 'admin@cortex.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin'
  },
  {
    email: 'user@cortex.com',
    password: 'user123',
    displayName: 'Test User',
    role: 'user'
  },
  {
    email: 'viewer@cortex.com',
    password: 'viewer123',
    displayName: 'Viewer User',
    role: 'viewer'
  },
  {
    email: 'test@example.com',
    password: 'test123',
    displayName: 'Test Account',
    role: 'user'
  },
  // Development Users
  {
    email: 'user1@dev.local',
    password: 'Password123!',
    displayName: 'Sarah Chen',
    role: 'user'
  },
  {
    email: 'manager1@dev.local',
    password: 'Password123!',
    displayName: 'Marcus Rodriguez',
    role: 'manager'
  },
  {
    email: 'admin1@dev.local',
    password: 'Password123!',
    displayName: 'Alex Thompson',
    role: 'admin'
  }
];

export async function seedUsers(users = defaultUsers) {
  console.log('🌱 Seeding test users...');
  const auth = getAdminAuth();

  for (const u of users) {
    try {
      // Idempotent: find or create
      let user;
      try {
        user = await auth.getUserByEmail(u.email);
        console.log(`   ✓ Found existing user: ${u.email}`);
      } catch {
        user = await auth.createUser({
          email: u.email,
          password: u.password,
          displayName: u.displayName,
          emailVerified: true
        });
        console.log(`   ✨ Created user: ${u.email}`);
      }

      // Set custom claims for role-based access
      await auth.setCustomUserClaims(user.uid, { role: u.role });

      // Force token refresh by revoking tokens, so client picks up claims next sign-in
      await auth.revokeRefreshTokens(user.uid);
      
      console.log(`   🔑 Set role: ${u.role} for ${u.email}`);
    } catch (error) {
      console.error(`   ❌ Failed to seed user ${u.email}:`, error);
      throw error;
    }
  }

  console.log('✅ User seeding completed');
}

// Allow direct execution
if (process.env.RUN_DIRECT === '1') {
  seedUsers()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('❌ User seeding failed:', e);
      process.exit(1);
    });
}