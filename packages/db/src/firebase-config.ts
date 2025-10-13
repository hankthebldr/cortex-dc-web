// Firebase configuration for cortex-dc-portal project
// Migrated from henryreed.ai/hosting/lib/firebase-config.ts
// Updated for cortex-dc-web monorepo structure

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'cortex-dc-portal',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Environment flags
export const isMockAuthMode = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true';
export const useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';

/**
 * Get or initialize Firebase app instance
 * Handles SSR, mock mode, and production configurations
 */
function getFirebaseApp(): FirebaseApp | null {
  // Server-side rendering guard
  if (typeof window === 'undefined') {
    return null;
  }

  // Mock mode configuration for development/testing
  if (isMockAuthMode || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.info('Running in mock auth mode or Firebase config missing. Using development auth.');

    const mockConfig = {
      apiKey: 'mock-api-key',
      authDomain: 'cortex-dc-portal.firebaseapp.com',
      projectId: 'cortex-dc-portal',
      storageBucket: 'cortex-dc-portal.firebasestorage.app',
      messagingSenderId: '317661350023',
      appId: '1:317661350023:web:mock-app-id',
    };

    const apps = getApps();
    return apps.length === 0 ? initializeApp(mockConfig) : getApp();
  }

  // Production configuration
  const apps = getApps();
  return apps.length === 0 ? initializeApp(firebaseConfig) : getApp();
}

// Service instances (lazy-initialized via Proxy)
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _app: FirebaseApp | null = null;
let _emulatorsConnected = false;

/**
 * Connect to Firebase emulators for local development
 * Only runs once per session
 */
function connectEmulators() {
  if (_emulatorsConnected || typeof window === 'undefined') return;

  if (useEmulator || isMockAuthMode) {
    try {
      if (_auth && process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST) {
        const authHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST;
        connectAuthEmulator(_auth, `http://${authHost}`, { disableWarnings: true });
      }

      if (_db) {
        const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || 'localhost';
        const firestorePort = parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080');
        connectFirestoreEmulator(_db, firestoreHost, firestorePort);
      }

      if (_storage) {
        const storageHost = process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST || 'localhost';
        const storagePort = parseInt(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT || '9199');
        connectStorageEmulator(_storage, storageHost, storagePort);
      }

      _emulatorsConnected = true;
      console.info('✅ Connected to Firebase emulators');
    } catch (error) {
      console.warn('⚠️  Failed to connect to emulators:', error);
    }
  }
}

/**
 * Firebase Authentication instance
 * Lazy-loaded via Proxy pattern for optimal performance
 */
export const auth = new Proxy({} as Auth, {
  get(target, prop) {
    if (!_auth) {
      const app = getFirebaseApp();
      if (!app) {
        console.warn('Firebase app not available, auth will be limited');
        return null;
      }
      _auth = getAuth(app);
      connectEmulators();
    }
    return (_auth as any)[prop];
  },
});

/**
 * Firebase Firestore instance
 * Lazy-loaded via Proxy pattern for optimal performance
 */
export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    if (!_db) {
      const app = getFirebaseApp();
      if (!app) {
        console.warn('Firebase app not available, database will be limited');
        return null;
      }
      _db = getFirestore(app);
      connectEmulators();
    }
    return (_db as any)[prop];
  },
});

/**
 * Firebase Storage instance
 * Lazy-loaded via Proxy pattern for optimal performance
 */
export const storage = new Proxy({} as FirebaseStorage, {
  get(target, prop) {
    if (!_storage) {
      const app = getFirebaseApp();
      if (!app) {
        console.warn('Firebase app not available, storage will be limited');
        return null;
      }
      _storage = getStorage(app);
      connectEmulators();
    }
    return (_storage as any)[prop];
  },
});

/**
 * Firebase App instance
 * Lazy-loaded via Proxy pattern for optimal performance
 */
export const firebaseApp = new Proxy({} as FirebaseApp, {
  get(target, prop) {
    if (!_app) {
      _app = getFirebaseApp();
      if (!_app) {
        throw new Error(
          'Firebase is not properly configured. Please check your environment variables. Required: NEXT_PUBLIC_FIREBASE_PROJECT_ID'
        );
      }
    }
    return (_app as any)[prop];
  },
});

/**
 * Get Firebase configuration (useful for debugging)
 */
export function getFirebaseConfig() {
  return {
    projectId: firebaseConfig.projectId,
    isMockMode: isMockAuthMode,
    useEmulator,
    isConfigured: !!firebaseConfig.apiKey && !!firebaseConfig.projectId,
  };
}

/**
 * Force reconnect emulators (useful for testing)
 */
export function forceReconnectEmulators() {
  _emulatorsConnected = false;
  connectEmulators();
}
