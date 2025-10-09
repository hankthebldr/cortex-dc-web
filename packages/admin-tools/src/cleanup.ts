import { getAdminFirestore, getAdminAuth, getAdminStorage } from './adminApp.js';

/**
 * Clean up E2E test data from Firebase emulators
 */
export async function cleanupE2E(ns = 'e2e') {
  console.log(`🧹 Cleaning up E2E test data with namespace: ${ns}`);

  try {
    const db = getAdminFirestore();
    const bucket = getAdminStorage().bucket('cortex-dc-web-dev.appspot.com');
    const auth = getAdminAuth();

    // Clean up Firestore documents
    console.log('   Cleaning Firestore documents...');
    const collections = [
      'projects',
      'povs',
      'trrs',
      'scenarios',
      'content',
      'content-analytics',
      'scenario-executions',
      'audit-logs',
      'test-collection' // From API tests
    ];

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        
        // For namespaced collections
        const namespacedQuery = collection.where('ns', '==', ns);
        const namespacedSnapshot = await namespacedQuery.get();
        
        if (!namespacedSnapshot.empty) {
          const batch = db.batch();
          namespacedSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log(`     ✓ Cleaned ${namespacedSnapshot.size} documents from ${collectionName}`);
        }

        // Also clean any test documents without namespace
        const testQuery = collection.where('namespace', '==', 'e2e-api-test');
        const testSnapshot = await testQuery.get();
        
        if (!testSnapshot.empty) {
          const batch = db.batch();
          testSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log(`     ✓ Cleaned ${testSnapshot.size} API test documents from ${collectionName}`);
        }
        
      } catch (error) {
        console.warn(`     ⚠️  Could not clean collection ${collectionName}:`, error.message);
      }
    }

    // Clean up Storage files
    console.log('   Cleaning Storage files...');
    try {
      const [files] = await bucket.getFiles({ 
        prefix: `${ns}/` 
      });
      
      if (files.length > 0) {
        await Promise.all(files.map(file => file.delete().catch(() => {})));
        console.log(`     ✓ Cleaned ${files.length} storage files`);
      }

      // Also clean API test files
      const [testFiles] = await bucket.getFiles({ 
        prefix: 'e2e-test/' 
      });
      
      if (testFiles.length > 0) {
        await Promise.all(testFiles.map(file => file.delete().catch(() => {})));
        console.log(`     ✓ Cleaned ${testFiles.length} API test files`);
      }
      
    } catch (error) {
      console.warn('     ⚠️  Could not clean storage files:', error.message);
    }

    // Optionally clean up test users (disabled by default to allow user caching)
    const cleanUsers = process.env.CLEAN_TEST_USERS === 'true';
    
    if (cleanUsers) {
      console.log('   Cleaning test users...');
      const testEmails = ['user1@dev.local', 'manager1@dev.local', 'admin1@dev.local'];
      
      for (const email of testEmails) {
        try {
          const user = await auth.getUserByEmail(email);
          await auth.deleteUser(user.uid);
          console.log(`     ✓ Deleted user: ${email}`);
        } catch (error) {
          // User probably doesn't exist, which is fine
        }
      }
    } else {
      console.log('   Preserving test users (set CLEAN_TEST_USERS=true to remove)');
    }

    console.log('✅ E2E cleanup completed');

  } catch (error) {
    console.error('❌ E2E cleanup failed:', error);
    throw error;
  }
}

/**
 * Clean up all test artifacts (more aggressive)
 */
export async function cleanupAll() {
  console.log('🧹 Performing comprehensive test cleanup...');
  
  // Clean with different namespaces
  await cleanupE2E('e2e');
  await cleanupE2E('test');
  
  // Force user cleanup
  const originalEnv = process.env.CLEAN_TEST_USERS;
  process.env.CLEAN_TEST_USERS = 'true';
  
  try {
    await cleanupE2E('cleanup-all');
  } finally {
    process.env.CLEAN_TEST_USERS = originalEnv;
  }
}

// Allow direct execution
if (process.env.RUN_DIRECT === '1') {
  const action = process.env.CLEANUP_ACTION || 'e2e';
  
  if (action === 'all') {
    cleanupAll()
      .then(() => process.exit(0))
      .catch((e) => {
        console.error('❌ Cleanup failed:', e);
        process.exit(1);
      });
  } else {
    cleanupE2E()
      .then(() => process.exit(0))
      .catch((e) => {
        console.error('❌ Cleanup failed:', e);
        process.exit(1);
      });
  }
}