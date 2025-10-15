import admin from 'firebase-admin';

let app: admin.app.App | null = null;

/**
 * Get Firebase Admin App instance
 * Handles emulator connections based on environment variables
 */
export function getAdminApp() {
  if (app) return app;

  const projectId = process.env.FIREBASE_PROJECT_ID || 'cortex-dc-web-dev';
  const useEmulator = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST;

  // Initialize with minimal config for emulators
  // Firebase Admin SDK will automatically detect emulator environments
  app = admin.initializeApp({
    projectId,
    // For emulators, use a fake credential
    // For production, use Application Default Credentials or service account
    credential: useEmulator
      ? admin.credential.cert({
          projectId,
          clientEmail: 'test@example.com',
          privateKey: '-----BEGIN PRIVATE KEY-----\nMIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAr0EaCrBRR8rJBPDz\n-----END PRIVATE KEY-----',
        } as any)
      : admin.credential.applicationDefault(),
  });

  // Connect to emulators if environment variables are set
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.log(`🔧 Using Auth Emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
  }
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`🔧 Using Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  }

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