#!/usr/bin/env ts-node

/**
 * Create Mock Firebase Users for Testing
 *
 * This script creates test users with specified credentials and custom role claims
 * for smoke testing the Cortex DC Web application.
 *
 * Usage: ts-node scripts/create-mock-users.ts
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Note: This will use Application Default Credentials or a service account key
// Set GOOGLE_APPLICATION_CREDENTIALS environment variable if needed
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'cortex-dc-portal',
  });

  // Connect to emulator if FIREBASE_AUTH_EMULATOR_HOST is set
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    console.log('🔧 Using Firebase Emulator');
    console.log(`   Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
    console.log(`   Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}`);
    console.log('');
  }
}

interface MockUser {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'manager' | 'user';
}

const mockUsers: MockUser[] = [
  {
    email: 'user@cortex',
    password: 'xsiam1',
    displayName: 'Admin User',
    role: 'admin',
  },
  {
    email: 'user1@cortex',
    password: 'xsiam1',
    displayName: 'Regular User',
    role: 'user',
  },
];

async function createMockUser(userData: MockUser) {
  try {
    // Check if user already exists
    let user: admin.auth.UserRecord;
    try {
      user = await admin.auth().getUserByEmail(userData.email);
      console.log(`✓ User ${userData.email} already exists. Updating...`);

      // Update existing user
      user = await admin.auth().updateUser(user.uid, {
        password: userData.password,
        displayName: userData.displayName,
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        user = await admin.auth().createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: true, // Auto-verify for testing
        });
        console.log(`✓ Created user ${userData.email}`);
      } else {
        throw error;
      }
    }

    // Set custom claims for role-based access control
    await admin.auth().setCustomUserClaims(user.uid, {
      role: userData.role,
    });

    console.log(`✓ Set role: ${userData.role} for ${userData.email}`);
    console.log(`  UID: ${user.uid}`);
    console.log('');

    return user;
  } catch (error: any) {
    console.error(`✗ Failed to create user ${userData.email}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🔧 Creating Mock Firebase Users for Testing\n');
  console.log('Project ID:', process.env.FIREBASE_PROJECT_ID || 'cortex-dc-portal');
  console.log('');

  try {
    for (const userData of mockUsers) {
      await createMockUser(userData);
    }

    console.log('✅ Successfully created all mock users!\n');
    console.log('You can now log in with:');
    console.log('  Admin: user@cortex / xsiam1');
    console.log('  User:  user1@cortex / xsiam1');
    console.log('');

  } catch (error: any) {
    console.error('❌ Error creating mock users:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

main();
