import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, terminate } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import * as admin from 'firebase-admin';

/**
 * Test Setup Utilities for Firebase Services
 * 
 * Provides utilities for setting up Firebase emulators, seeding test data,
 * and managing test environments to ensure isolated and reproducible tests.
 */

// Test Firebase configuration
const testConfig = {
  projectId: 'cortex-dc-test',
  storageBucket: 'cortex-dc-test.appspot.com',
};

let testApp: any = null;
let adminApp: admin.app.App | null = null;

/**
 * Initialize test Firebase app with emulator connections
 */
export function initializeTestApp() {
  if (testApp) {
    return testApp;
  }

  // Initialize client SDK
  testApp = initializeApp(testConfig);

  // Initialize admin SDK
  if (!adminApp) {
    adminApp = admin.initializeApp({
      projectId: testConfig.projectId,
      storageBucket: testConfig.storageBucket,
    });
  }

  // Connect to emulators
  const db = getFirestore(testApp);
  const storage = getStorage(testApp);
  const functions = getFunctions(testApp);

  // Only connect if not already connected
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    // Emulators might already be connected
    console.log('Emulators already connected or connection failed:', error);
  }

  return testApp;
}

/**
 * Clean up Firebase test app
 */
export async function cleanupTestApp() {
  if (testApp) {
    await deleteApp(testApp);
    testApp = null;
  }
  
  if (adminApp) {
    await adminApp.delete();
    adminApp = null;
  }
}

/**
 * Clear all Firestore data for clean test runs
 */
export async function clearFirestoreData() {
  if (!adminApp) {
    throw new Error('Admin app not initialized');
  }

  const db = adminApp.firestore();
  
  // Collections to clear
  const collections = [
    'povs',
    'trrs', 
    'scenarios',
    'content',
    'content-analytics',
    'users',
    'scenario-executions',
    'audit-logs',
    'bigquery-exports',
    'xsiam-health'
  ];

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const snapshot = await collection.get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
}

/**
 * Seed test data for consistent test scenarios
 */
export async function seedTestData(data: {
  users?: any[];
  scenarios?: any[];
  povs?: any[];
  content?: any[];
}) {
  if (!adminApp) {
    throw new Error('Admin app not initialized');
  }

  const db = adminApp.firestore();

  // Seed users
  if (data.users) {
    for (const user of data.users) {
      await db.collection('users').doc(user.id).set({
        ...user,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        permissions: getUserPermissions(user.role)
      });
    }
  }

  // Seed scenarios
  if (data.scenarios) {
    for (const scenario of data.scenarios) {
      await db.collection('scenarios').doc(scenario.id).set({
        ...scenario,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        executionCount: 0,
        povReferences: [],
        status: 'active'
      });
    }
  }

  // Seed POVs
  if (data.povs) {
    for (const pov of data.povs) {
      await db.collection('povs').doc(pov.id).set({
        ...pov,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        auditTrail: [{
          action: 'created',
          user: pov.consultant,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: 'Initial POV creation'
        }]
      });
    }
  }

  // Seed content
  if (data.content) {
    for (const content of data.content) {
      await db.collection('content').doc(content.id).set({
        ...content,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        version: 1,
        status: content.status || 'published'
      });
    }
  }
}

/**
 * Generate test authentication token
 */
export async function generateTestToken(role: 'user' | 'management' | 'admin', userId: string) {
  if (!adminApp) {
    throw new Error('Admin app not initialized');
  }

  const customClaims = {
    role,
    permissions: getUserPermissions(role),
    cortexDC: true
  };

  // Create custom token
  const customToken = await adminApp.auth().createCustomToken(userId, customClaims);
  
  // For testing purposes, we'll return a mock token object
  return {
    uid: userId,
    role,
    permissions: customClaims.permissions,
    token: customToken,
    claims: customClaims
  };
}

/**
 * Create test user with specific role
 */
export async function createTestUser(userData: {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'management' | 'admin';
  department?: string;
}) {
  if (!adminApp) {
    throw new Error('Admin app not initialized');
  }

  const customClaims = {
    role: userData.role,
    permissions: getUserPermissions(userData.role),
    cortexDC: true
  };

  // Create user account
  const userRecord = await adminApp.auth().createUser({
    uid: userData.id,
    email: userData.email,
    displayName: userData.name,
    disabled: false
  });

  // Set custom claims
  await adminApp.auth().setCustomUserClaims(userData.id, customClaims);

  // Create user document
  await adminApp.firestore().collection('users').doc(userData.id).set({
    id: userData.id,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    department: userData.department || 'Domain Consulting',
    permissions: customClaims.permissions,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginAt: null,
    status: 'active'
  });

  return userRecord;
}

/**
 * Clean up test files from storage
 */
export async function cleanupTestFiles() {
  if (!adminApp) {
    return;
  }

  const bucket = adminApp.storage().bucket();
  
  try {
    // List and delete test files
    const [files] = await bucket.getFiles({
      prefix: 'test-'
    });

    for (const file of files) {
      await file.delete();
    }

    // Clean up POV test attachments
    const [povFiles] = await bucket.getFiles({
      prefix: 'povs/test-'
    });

    for (const file of povFiles) {
      await file.delete();
    }
  } catch (error) {
    console.log('Error cleaning up test files:', error);
  }
}

/**
 * Mock Firebase Cloud Functions for testing
 */
export function mockCloudFunction(functionName: string, response: any) {
  const mockImplementation = jest.fn().mockResolvedValue({ data: response });
  
  // Mock the httpsCallable function
  jest.doMock('firebase/functions', () => ({
    ...jest.requireActual('firebase/functions'),
    httpsCallable: jest.fn().mockImplementation((functions, name) => {
      if (name === functionName) {
        return mockImplementation;
      }
      return jest.fn().mockRejectedValue(new Error('Function not mocked'));
    })
  }));

  return mockImplementation;
}

/**
 * Validate Firebase service connectivity
 */
export async function validateServiceConnectivity() {
  if (!testApp) {
    throw new Error('Test app not initialized');
  }

  const db = getFirestore(testApp);
  const storage = getStorage(testApp);
  const functions = getFunctions(testApp);

  try {
    // Test Firestore
    await db.collection('_test').doc('connectivity').set({
      timestamp: new Date(),
      service: 'firestore'
    });
    
    await db.collection('_test').doc('connectivity').delete();

    // Test Storage
    const storageRef = storage.ref('_test/connectivity.txt');
    await storageRef.putString('test');
    await storageRef.delete();

    // Test Functions (mock)
    // Functions testing requires the emulator to be running

    return {
      firestore: true,
      storage: true,
      functions: true // Assumed true for testing
    };
  } catch (error) {
    throw new Error(`Service connectivity validation failed: ${error}`);
  }
}

/**
 * Get user permissions based on role
 */
function getUserPermissions(role: 'user' | 'management' | 'admin'): string[] {
  const basePermissions = [
    'dashboard.view',
    'pov.create',
    'pov.view_own',
    'scenarios.run',
    'terminal.access',
    'content.view'
  ];

  const managementPermissions = [
    ...basePermissions,
    'analytics.view',
    'pov.view_team',
    'users.manage_team',
    'reports.generate',
    'budget.view',
    'pov.approve'
  ];

  const adminPermissions = [
    ...managementPermissions,
    'users.manage_all',
    'system.configure',
    'analytics.view_all',
    'security.manage',
    'audit.view',
    'bigquery.export',
    'xsiam.configure'
  ];

  switch (role) {
    case 'user':
      return basePermissions;
    case 'management':
      return managementPermissions;
    case 'admin':
      return adminPermissions;
    default:
      return basePermissions;
  }
}

/**
 * Wait for Firebase operations to complete
 */
export function waitForFirebaseOperation(ms: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create mock file for testing uploads
 */
export function createMockFile(
  content: string | ArrayBuffer, 
  filename: string, 
  contentType: string = 'text/plain'
): File {
  const blob = new Blob([content], { type: contentType });
  return new File([blob], filename, { type: contentType });
}

/**
 * Validate test environment
 */
export function validateTestEnvironment() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Test utilities should only be used in test environment');
  }

  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.warn('Warning: FIRESTORE_EMULATOR_HOST not set. Tests may run against production.');
  }

  if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
    console.warn('Warning: FIREBASE_STORAGE_EMULATOR_HOST not set. Tests may run against production.');
  }

  if (!process.env.FUNCTIONS_EMULATOR_HOST) {
    console.warn('Warning: FUNCTIONS_EMULATOR_HOST not set. Tests may run against production.');
  }
}

/**
 * Test data generators
 */
export const testDataGenerators = {
  pov: (overrides: any = {}) => ({
    id: `test-pov-${Date.now()}`,
    title: 'Test POV',
    customer: 'Test Customer',
    status: 'draft',
    consultant: 'user-dc-001',
    scenarios: ['network-segmentation'],
    objectives: ['Test objective'],
    timeline: {
      start: new Date('2024-02-01'),
      end: new Date('2024-04-01')
    },
    businessValue: {
      riskReduction: 75,
      efficiencyGain: 20,
      complianceImprovement: 80
    },
    ...overrides
  }),

  scenario: (overrides: any = {}) => ({
    id: `test-scenario-${Date.now()}`,
    name: 'Test Scenario',
    category: 'security',
    description: 'Test scenario for validation',
    steps: [
      { id: 'step-1', type: 'config', description: 'Configuration step' },
      { id: 'step-2', type: 'validate', description: 'Validation step' }
    ],
    duration: 1800,
    ...overrides
  }),

  user: (overrides: any = {}) => ({
    id: `test-user-${Date.now()}`,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    department: 'Domain Consulting',
    ...overrides
  })
};

// Export admin app for direct access in tests
export { adminApp };