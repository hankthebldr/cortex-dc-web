import type { FullConfig } from '@playwright/test';
import { spawn, ChildProcess } from 'node:child_process';
import http from 'node:http';

// Store process references for cleanup
let emulatorProc: ChildProcess | null = null;
let webProc: ChildProcess | null = null;

/**
 * Wait for HTTP endpoint to become available
 */
function waitOn(url: string, timeoutMs = 60000): Promise<void> {
  console.log(`🔍 Waiting for ${url}...`);
  const end = Date.now() + timeoutMs;
  
  return new Promise<void>((resolve, reject) => {
    const tick = () => {
      const timeout = Date.now() > end;
      
      http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          console.log(`✅ ${url} is ready`);
          return resolve();
        }
        if (timeout) return reject(new Error(`Timeout waiting for ${url}`));
        setTimeout(tick, 1000);
      }).on('error', () => {
        if (timeout) return reject(new Error(`Timeout waiting for ${url}`));
        setTimeout(tick, 1000);
      });
    };
    
    tick();
  });
}

/**
 * Start a process with environment variables
 */
function startProcess(command: string, cwd: string, env: NodeJS.ProcessEnv = {}): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting: ${command}`);
    
    const child = spawn(command, {
      cwd,
      env: { ...process.env, ...env },
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Log output for debugging
    child.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      if (output) console.log(`[${command.split(' ')[0]}] ${output}`);
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString().trim();
      if (output) console.error(`[${command.split(' ')[0]}] ${output}`);
    });

    child.on('error', reject);
    
    // Consider process started after a short delay
    setTimeout(() => resolve(child), 2000);
  });
}

/**
 * Global setup - start emulators, build app, seed data
 */
export default async function globalSetup(config: FullConfig) {
  console.log('🌍 Starting E2E global setup...');

  try {
    // Step 1: Start Firebase emulators
    console.log('📡 Starting Firebase emulators...');
    emulatorProc = await startProcess(
      'firebase emulators:start --only auth,firestore,storage,functions,hosting --project cortex-dc-web-dev',
      process.cwd(),
      {
        FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9098',
        FIRESTORE_EMULATOR_HOST: '127.0.0.1:8081',
        FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
        FUNCTIONS_EMULATOR_HOST: '127.0.0.1:5001'
      }
    );

    // Wait for core emulator services to be ready
    await Promise.all([
      waitOn('http://127.0.0.1:9098/'),  // Auth
      waitOn('http://127.0.0.1:8081/'),  // Firestore
      waitOn('http://127.0.0.1:9199/'),  // Storage
      waitOn('http://127.0.0.1:5001/')   // Functions
    ]);

    // Step 2: Set environment for testing
    process.env.FIREBASE_PROJECT_ID = 'cortex-dc-web-dev';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9098';
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
    process.env.GENKIT_PROVIDER = 'mock';

    // Step 3: Seed test users and data
    console.log('🌱 Seeding test data...');
    
    try {
      // Dynamic imports to avoid module resolution issues
      const { seedUsers } = await import('../../packages/admin-tools/src/seedUsers.js');
      const { seedCoreData } = await import('../../packages/admin-tools/src/seedData.js');
      
      await seedUsers();
      await seedCoreData();
      console.log('✅ Test data seeding completed');
    } catch (error) {
      console.warn('⚠️  Seeding failed, tests may not have data:', error);
      // Don't fail setup if seeding fails - tests can handle missing data
    }

    // Step 4: Start Next.js app (if testing against local app)
    const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';
    
    if (baseURL.includes('localhost:3000')) {
      console.log('🏗️  Building and starting Next.js app...');
      
      // Build the app first
      await startProcess('pnpm build', 'apps/web');
      
      // Start the production server
      webProc = await startProcess('pnpm start -p 3000', 'apps/web', {
        NEXT_PUBLIC_USE_EMULATORS: 'true',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'cortex-dc-web-dev',
        NEXT_PUBLIC_FIREBASE_API_KEY: 'fake-api-key',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'localhost',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'cortex-dc-web-dev.appspot.com',
        NEXT_PUBLIC_FIREBASE_APP_ID: 'demo-app',
        NEXT_PUBLIC_DATA_CONNECT_URL: 'http://localhost:9399/graphql'
      });

      // Wait for Next.js app to be ready
      await waitOn(baseURL, 90000); // Give it more time for build + start
    }

    console.log('✅ E2E global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    
    // Clean up on failure
    await globalTeardown();
    throw error;
  }
}

/**
 * Global teardown - cleanup processes
 */
export async function globalTeardown() {
  console.log('🧹 Starting E2E global teardown...');

  if (webProc && !webProc.killed) {
    console.log('🛑 Stopping Next.js app...');
    webProc.kill('SIGINT');
    webProc = null;
  }

  if (emulatorProc && !emulatorProc.killed) {
    console.log('🛑 Stopping Firebase emulators...');
    emulatorProc.kill('SIGINT');
    emulatorProc = null;
  }

  // Give processes time to clean up
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('✅ E2E global teardown completed');
}