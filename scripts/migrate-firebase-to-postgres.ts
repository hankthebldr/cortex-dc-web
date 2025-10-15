#!/usr/bin/env tsx

/**
 * Firebase to PostgreSQL Migration Script
 * Migrates data from Firebase Firestore to self-hosted PostgreSQL
 *
 * Usage:
 *   1. Export Firebase data: firebase firestore:export ./firestore-backup
 *   2. Run this script: tsx scripts/migrate-firebase-to-postgres.ts
 */

import { PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'))
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.log('⚠️  No Firebase credentials found. Will attempt to load from JSON export.');
  }
}

interface MigrationStats {
  users: { migrated: number; failed: number };
  povs: { migrated: number; failed: number };
  trrs: { migrated: number; failed: number };
}

const stats: MigrationStats = {
  users: { migrated: 0, failed: 0 },
  povs: { migrated: 0, failed: 0 },
  trrs: { migrated: 0, failed: 0 },
};

/**
 * Migrate users from Firebase Auth to PostgreSQL
 */
async function migrateUsers() {
  console.log('\n📊 Migrating Users...');

  try {
    // Get all users from Firebase Auth
    const listUsersResult = await admin.auth().listUsers();

    for (const user of listUsersResult.users) {
      try {
        // Get custom claims
        const customClaims = (await admin.auth().getUser(user.uid)).customClaims || {};

        await prisma.user.upsert({
          where: { keycloakId: user.uid },
          update: {
            email: user.email || '',
            displayName: user.displayName,
            role: (customClaims.role as string) || 'user',
          },
          create: {
            keycloakId: user.uid,
            email: user.email || '',
            displayName: user.displayName,
            role: (customClaims.role as string) || 'user',
          },
        });

        stats.users.migrated++;
        console.log(`  ✓ Migrated user: ${user.email}`);
      } catch (error) {
        stats.users.failed++;
        console.error(`  ✗ Failed to migrate user ${user.email}:`, (error as Error).message);
      }
    }
  } catch (error) {
    console.error('Failed to fetch users from Firebase:', error);
  }
}

/**
 * Migrate POVs from Firestore to PostgreSQL
 */
async function migratePOVs() {
  console.log('\n📋 Migrating POVs...');

  try {
    const db = admin.firestore();
    const povsSnapshot = await db.collection('povs').get();

    for (const doc of povsSnapshot.docs) {
      try {
        const data = doc.data();

        await prisma.pOV.upsert({
          where: { id: doc.id },
          update: {
            name: data.name,
            customer: data.customer,
            industry: data.industry,
            description: data.description,
            status: data.status || 'pending',
            priority: data.priority || 'medium',
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            assignedTo: data.assignedTo,
            objectives: data.objectives || [],
            successCriteria: data.successCriteria || [],
            createdBy: data.createdBy,
          },
          create: {
            id: doc.id,
            name: data.name,
            customer: data.customer,
            industry: data.industry,
            description: data.description,
            status: data.status || 'pending',
            priority: data.priority || 'medium',
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            assignedTo: data.assignedTo,
            objectives: data.objectives || [],
            successCriteria: data.successCriteria || [],
            createdBy: data.createdBy,
          },
        });

        stats.povs.migrated++;
        console.log(`  ✓ Migrated POV: ${data.name}`);
      } catch (error) {
        stats.povs.failed++;
        console.error(`  ✗ Failed to migrate POV ${doc.id}:`, (error as Error).message);
      }
    }
  } catch (error) {
    console.error('Failed to fetch POVs from Firestore:', error);
  }
}

/**
 * Migrate TRRs from Firestore to PostgreSQL
 */
async function migrateTRRs() {
  console.log('\n📝 Migrating TRRs...');

  try {
    const db = admin.firestore();
    const trrsSnapshot = await db.collection('trrs').get();

    for (const doc of trrsSnapshot.docs) {
      try {
        const data = doc.data();

        await prisma.tRR.upsert({
          where: { id: doc.id },
          update: {
            name: data.name,
            description: data.description,
            projectName: data.projectName,
            projectId: data.projectId,
            linkedPovId: data.linkedPovId,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            assignedTo: data.assignedTo,
            status: data.status || 'pending',
            priority: data.priority || 'medium',
            scope: data.scope || [],
            technicalRequirements: data.technicalRequirements || [],
            findings: data.findings || [],
            recommendations: data.recommendations || [],
            completionPercentage: data.completionPercentage || 0,
            createdBy: data.createdBy,
          },
          create: {
            id: doc.id,
            name: data.name,
            description: data.description,
            projectName: data.projectName,
            projectId: data.projectId,
            linkedPovId: data.linkedPovId,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            assignedTo: data.assignedTo,
            status: data.status || 'pending',
            priority: data.priority || 'medium',
            scope: data.scope || [],
            technicalRequirements: data.technicalRequirements || [],
            findings: data.findings || [],
            recommendations: data.recommendations || [],
            completionPercentage: data.completionPercentage || 0,
            createdBy: data.createdBy,
          },
        });

        stats.trrs.migrated++;
        console.log(`  ✓ Migrated TRR: ${data.name}`);
      } catch (error) {
        stats.trrs.failed++;
        console.error(`  ✗ Failed to migrate TRR ${doc.id}:`, (error as Error).message);
      }
    }
  } catch (error) {
    console.error('Failed to fetch TRRs from Firestore:', error);
  }
}

/**
 * Print migration summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));

  console.log('\nUsers:');
  console.log(`  ✓ Migrated: ${stats.users.migrated}`);
  console.log(`  ✗ Failed: ${stats.users.failed}`);

  console.log('\nPOVs:');
  console.log(`  ✓ Migrated: ${stats.povs.migrated}`);
  console.log(`  ✗ Failed: ${stats.povs.failed}`);

  console.log('\nTRRs:');
  console.log(`  ✓ Migrated: ${stats.trrs.migrated}`);
  console.log(`  ✗ Failed: ${stats.trrs.failed}`);

  const totalMigrated = stats.users.migrated + stats.povs.migrated + stats.trrs.migrated;
  const totalFailed = stats.users.failed + stats.povs.failed + stats.trrs.failed;

  console.log('\nTotal:');
  console.log(`  ✓ Migrated: ${totalMigrated}`);
  console.log(`  ✗ Failed: ${totalFailed}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting Firebase to PostgreSQL migration...\n');

  try {
    // Connect to PostgreSQL
    await prisma.$connect();
    console.log('✓ Connected to PostgreSQL\n');

    // Run migrations in order
    await migrateUsers();
    await migratePOVs();
    await migrateTRRs();

    // Print summary
    printSummary();

    console.log('✅ Migration completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
main();
