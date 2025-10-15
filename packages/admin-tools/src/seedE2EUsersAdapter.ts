/**
 * E2E User Seeding - Using Database Adapter (No Firebase)
 *
 * Migrated from Firebase Admin SDK to use adapter pattern
 * Works with both Firebase and self-hosted deployments
 */

import { getDatabase, getAuth } from '@cortex/db';

type Role = 'user' | 'admin' | 'viewer';

interface E2EUser {
  email: string;
  password: string;
  displayName: string;
  role: Role;
  description: string;
}

const e2eTestUsers: E2EUser[] = [
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

export async function seedE2EUsersAdapter() {
  console.log('🧪 Seeding E2E test users (Adapter Pattern)...\n');

  try {
    const db = getDatabase();
    const auth = getAuth();

    console.log(`📦 Using database adapter: ${db.constructor.name}`);
    console.log(`🔐 Using auth adapter: ${auth.constructor.name}\n`);

    for (const userData of e2eTestUsers) {
      try {
        // Try to create user with auth adapter
        let authUser;
        try {
          authUser = await auth.signUp({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
          });
          console.log(`   ✨ Created auth user: ${userData.email}`);
        } catch (error: any) {
          if (error.message?.includes('already exists') || error.message?.includes('EMAIL_EXISTS')) {
            console.log(`   ✓ Auth user already exists: ${userData.email}`);
            // Sign in to get user ID
            const signInResult = await auth.signIn({
              email: userData.email,
              password: userData.password,
            });
            authUser = { user: signInResult.user };
          } else {
            throw error;
          }
        }

        const uid = authUser.user.uid;

        // Create or update user profile in database
        const existingProfile = await db.findByField('users', 'email', userData.email);

        if (existingProfile) {
          console.log(`   ✓ User profile already exists: ${userData.email}`);
        } else {
          const userProfile = {
            uid,
            email: userData.email,
            displayName: userData.displayName,
            photoURL: null,
            role: userData.role,
            organizationId: null,
            department: null,
            permissions: [],
            preferences: {
              theme: 'dark' as const,
              notifications: true,
              language: 'en',
            },
            metadata: {
              createdAt: new Date(),
              lastActive: new Date(),
              loginCount: 0,
              emailVerified: true,
              providerData: [],
            },
            status: 'active' as const,
          };

          await db.create('users', userProfile);
          console.log(`   ✨ Created user profile: ${userData.email}`);
        }

        console.log(`      └─ ${userData.description}\n`);
      } catch (error: any) {
        console.error(`   ❌ Failed to seed user ${userData.email}:`, error.message);
        // Continue with other users
      }
    }

    console.log('✅ E2E test users seeded successfully (Adapter Pattern)');
  } catch (error: any) {
    console.error('❌ E2E user seeding failed:', error.message);
    throw error;
  }
}

// Allow direct execution
if (process.env.RUN_DIRECT === '1') {
  seedE2EUsersAdapter()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('❌ E2E user seeding failed:', e);
      process.exit(1);
    });
}
