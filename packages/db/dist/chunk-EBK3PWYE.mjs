// src/firebase-config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
var firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cortex-dc-portal",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
var isMockAuthMode = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === "true";
var useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === "true";
function getFirebaseApp() {
  if (typeof window === "undefined") {
    return null;
  }
  if (isMockAuthMode || !firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.info("Running in mock auth mode or Firebase config missing. Using development auth.");
    const mockConfig = {
      apiKey: "mock-api-key",
      authDomain: "cortex-dc-portal.firebaseapp.com",
      projectId: "cortex-dc-portal",
      storageBucket: "cortex-dc-portal.firebasestorage.app",
      messagingSenderId: "317661350023",
      appId: "1:317661350023:web:mock-app-id"
    };
    const apps2 = getApps();
    return apps2.length === 0 ? initializeApp(mockConfig) : getApp();
  }
  const apps = getApps();
  return apps.length === 0 ? initializeApp(firebaseConfig) : getApp();
}
var _auth = null;
var _db = null;
var _storage = null;
var _functions = null;
var _app = null;
var _emulatorsConnected = false;
function connectEmulators() {
  if (_emulatorsConnected || typeof window === "undefined") return;
  if (useEmulator || isMockAuthMode) {
    try {
      if (_auth && process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST) {
        const authHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST;
        connectAuthEmulator(_auth, `http://${authHost}`, { disableWarnings: true });
      }
      if (_db) {
        const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || "localhost";
        const firestorePort = parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || "8080");
        connectFirestoreEmulator(_db, firestoreHost, firestorePort);
      }
      if (_storage) {
        const storageHost = process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST || "localhost";
        const storagePort = parseInt(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT || "9199");
        connectStorageEmulator(_storage, storageHost, storagePort);
      }
      if (_functions) {
        const functionsHost = process.env.NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST || "localhost";
        const functionsPort = parseInt(process.env.NEXT_PUBLIC_FUNCTIONS_EMULATOR_PORT || "5001");
        connectFunctionsEmulator(_functions, functionsHost, functionsPort);
      }
      _emulatorsConnected = true;
      console.info("\u2705 Connected to Firebase emulators");
    } catch (error) {
      console.warn("\u26A0\uFE0F  Failed to connect to emulators:", error);
    }
  }
}
var auth = new Proxy({}, {
  get(target, prop) {
    if (!_auth) {
      const app = getFirebaseApp();
      if (!app) {
        console.warn("Firebase app not available, auth will be limited");
        return null;
      }
      _auth = getAuth(app);
      connectEmulators();
    }
    return _auth[prop];
  }
});
var db = new Proxy({}, {
  get(target, prop) {
    if (!_db) {
      const app = getFirebaseApp();
      if (!app) {
        console.warn("Firebase app not available, database will be limited");
        return null;
      }
      _db = getFirestore(app);
      connectEmulators();
    }
    return _db[prop];
  }
});
var storage = new Proxy({}, {
  get(target, prop) {
    if (!_storage) {
      const app = getFirebaseApp();
      if (!app) {
        console.warn("Firebase app not available, storage will be limited");
        return null;
      }
      _storage = getStorage(app);
      connectEmulators();
    }
    return _storage[prop];
  }
});
var functions = new Proxy({}, {
  get(target, prop) {
    if (!_functions) {
      const app = getFirebaseApp();
      if (!app) {
        console.warn("Firebase app not available, functions will be limited");
        return null;
      }
      _functions = getFunctions(app);
      connectEmulators();
    }
    return _functions[prop];
  }
});
var firebaseApp = new Proxy({}, {
  get(target, prop) {
    if (!_app) {
      _app = getFirebaseApp();
      if (!_app) {
        throw new Error(
          "Firebase is not properly configured. Please check your environment variables. Required: NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        );
      }
    }
    return _app[prop];
  }
});
function getFirebaseConfig() {
  return {
    projectId: firebaseConfig.projectId,
    isMockMode: isMockAuthMode,
    useEmulator,
    isConfigured: !!firebaseConfig.apiKey && !!firebaseConfig.projectId
  };
}
function forceReconnectEmulators() {
  _emulatorsConnected = false;
  connectEmulators();
}

export {
  isMockAuthMode,
  useEmulator,
  auth,
  db,
  storage,
  functions,
  firebaseApp,
  getFirebaseConfig,
  forceReconnectEmulators
};
