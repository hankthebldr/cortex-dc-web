import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';

// Firebase configuration for development
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "cortex-dc-web-dev.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cortex-dc-web-dev",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "cortex-dc-web-dev.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:demo-app-id"
};

// Initialize Firebase app (singleton)
export function getClientApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  return initializeApp(firebaseConfig);
}

// Check if we should use emulators
const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';
const isClient = typeof window !== 'undefined';

// Cache for initialized services
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let functionsInstance: Functions | null = null;

/**
 * Get Firebase Auth instance with emulator connection if enabled
 */
export function getClientAuth(): Auth {
  if (authInstance) return authInstance;
  
  const app = getClientApp();
  authInstance = getAuth(app);
  
  if (useEmulators && isClient) {
    // Use our updated emulator port (9098 instead of 9099)
    const host = window.location.hostname;
    const authURL = `http://${host}:9098`;
    
    try {
      connectAuthEmulator(authInstance, authURL, { disableWarnings: true });
      console.log(`🔧 Connected to Auth emulator at ${authURL}`);
    } catch (error) {
      // Emulator already connected
      console.log('🔧 Auth emulator connection already established');
    }
  }
  
  return authInstance;
}

/**
 * Get Firestore instance with emulator connection if enabled
 */
export function getClientFirestore(): Firestore {
  if (firestoreInstance) return firestoreInstance;
  
  const app = getClientApp();
  firestoreInstance = getFirestore(app);
  
  if (useEmulators && isClient) {
    // Use our updated emulator port (8081 instead of 8080)
    const host = window.location.hostname;
    
    try {
      connectFirestoreEmulator(firestoreInstance, host, 8081);
      console.log(`🔧 Connected to Firestore emulator at ${host}:8081`);
    } catch (error) {
      // Emulator already connected
      console.log('🔧 Firestore emulator connection already established');
    }
  }
  
  return firestoreInstance;
}

/**
 * Get Storage instance with emulator connection if enabled
 */
export function getClientStorage(): FirebaseStorage {
  if (storageInstance) return storageInstance;
  
  const app = getClientApp();
  storageInstance = getStorage(app);
  
  if (useEmulators && isClient) {
    const host = window.location.hostname;
    
    try {
      connectStorageEmulator(storageInstance, host, 9199);
      console.log(`🔧 Connected to Storage emulator at ${host}:9199`);
    } catch (error) {
      // Emulator already connected
      console.log('🔧 Storage emulator connection already established');
    }
  }
  
  return storageInstance;
}

/**
 * Get Functions instance with emulator connection if enabled
 */
export function getClientFunctions(): Functions {
  if (functionsInstance) return functionsInstance;
  
  const app = getClientApp();
  functionsInstance = getFunctions(app);
  
  if (useEmulators && isClient) {
    const host = window.location.hostname;
    
    try {
      connectFunctionsEmulator(functionsInstance, host, 5001);
      console.log(`🔧 Connected to Functions emulator at ${host}:5001`);
    } catch (error) {
      // Emulator already connected
      console.log('🔧 Functions emulator connection already established');
    }
  }
  
  return functionsInstance;
}

/**
 * Get all Firebase client services at once
 */
export function getClients() {
  return {
    app: getClientApp(),
    auth: getClientAuth(),
    firestore: getClientFirestore(),
    storage: getClientStorage(),
    functions: getClientFunctions()
  };
}

/**
 * Utility to check if emulators are being used
 */
export function isUsingEmulators(): boolean {
  return useEmulators;
}

/**
 * Get current Firebase project ID
 */
export function getProjectId(): string {
  return firebaseConfig.projectId;
}