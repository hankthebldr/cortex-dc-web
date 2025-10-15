/**
 * E2E User Seeding - API-Based (No Firebase/Emulator Dependencies)
 *
 * This seeder uses the application's own API routes to create test users.
 * Works with any deployment mode - Firebase or self-hosted.
 *
 * IMPORTANT: The web server must be running for this to work.
 * Requires API endpoints for user creation.
 */

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

async function seedE2EUsersAPI() {
  const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';
  console.log('🧪 Seeding E2E test users via API...\\n');
  console.log(`🌐 Using API base URL: ${baseURL}\\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const userData of e2eTestUsers) {
    try {
      console.log(`📧 Processing: ${userData.email}`);

      // Try to create user via register API
      const signupResponse = await fetch(`${baseURL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
        }),
      });

      if (signupResponse.ok) {
        console.log(`   ✨ Created user: ${userData.email}`);
        successCount++;
      } else if (signupResponse.status === 409 || signupResponse.status === 400) {
        // User already exists
        console.log(`   ✓ User already exists: ${userData.email}`);
        skipCount++;
      } else {
        const error = await signupResponse.text();
        console.log(`   ⚠️  Failed to create user: ${userData.email} - ${error}`);
        failCount++;
      }

      console.log(`      └─ ${userData.description}\\n`);
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.error(`\\n❌ Cannot connect to ${baseURL}`);
        console.error('   Make sure the web server is running:');
        console.error('   pnpm dev\\n');
        process.exit(1);
      }
      console.error(`   ❌ Error processing ${userData.email}:`, error.message);
      failCount++;
    }
  }

  console.log('\\n' + '='.repeat(60));
  console.log('📊 Seeding Summary:');
  console.log(`   ✨ Created: ${successCount}`);
  console.log(`   ✓ Already existed: ${skipCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log('='.repeat(60));

  if (failCount > 0 && successCount === 0 && skipCount === 0) {
    console.error('\\n❌ All users failed to seed. Please check:');
    console.error('   1. Web server is running (pnpm dev)');
    console.error('   2. API routes are properly configured');
    console.error('   3. Database connection is working\\n');
    process.exit(1);
  }

  console.log('\\n✅ E2E user seeding complete (API-based)\\n');
}

// Allow direct execution
if (process.env.RUN_DIRECT === '1') {
  seedE2EUsersAPI()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('❌ E2E user seeding failed:', e);
      process.exit(1);
    });
}

export { seedE2EUsersAPI };
