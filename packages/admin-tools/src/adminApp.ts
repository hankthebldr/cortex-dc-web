import admin from 'firebase-admin';

let app: admin.app.App | null = null;

/**
 * Get Firebase Admin App instance
 * Handles emulator connections based on environment variables
 */
export function getAdminApp() {
  if (app) return app;
  
  const projectId = process.env.FIREBASE_PROJECT_ID || 'cortex-dc-web-dev';
  
  // Initialize with minimal config for emulators
  // Firebase Admin SDK will automatically detect emulator environments
  app = admin.initializeApp({
    projectId,
    // For emulators, credentials are not required
    // For production, use Application Default Credentials or service account
    credential: process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? admin.credential.applicationDefault()
      : admin.credential.applicationDefault(),
  });

  return app;
}

/**
 * Get Firebase Auth Admin instance
 */
export function getAdminAuth() {
  return getAdminApp().auth();
}

/**
 * Get Firestore Admin instance
 */
export function getAdminFirestore() {
  return getAdminApp().firestore();
}

/**
 * Get Storage Admin instance
 */
export function getAdminStorage() {
  return getAdminApp().storage();
}

/**
 * Clean up admin app instance
 */
export async function cleanupAdminApp() {
  if (app) {
    await app.delete();
    app = null;
  }
}