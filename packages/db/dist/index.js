"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/legacy/firebase-config.ts
var firebase_config_exports = {};
__export(firebase_config_exports, {
  auth: () => auth,
  db: () => db,
  firebaseApp: () => firebaseApp,
  forceReconnectEmulators: () => forceReconnectEmulators,
  functions: () => functions,
  getFirebaseConfig: () => getFirebaseConfig,
  isMockAuthMode: () => isMockAuthMode,
  storage: () => storage,
  useEmulator: () => useEmulator
});
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
    const apps2 = (0, import_app.getApps)();
    return apps2.length === 0 ? (0, import_app.initializeApp)(mockConfig) : (0, import_app.getApp)();
  }
  const apps = (0, import_app.getApps)();
  return apps.length === 0 ? (0, import_app.initializeApp)(firebaseConfig) : (0, import_app.getApp)();
}
function connectEmulators() {
  if (_emulatorsConnected || typeof window === "undefined") return;
  if (useEmulator || isMockAuthMode) {
    try {
      if (_auth && process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST) {
        const authHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST;
        (0, import_auth.connectAuthEmulator)(_auth, `http://${authHost}`, { disableWarnings: true });
      }
      if (_db) {
        const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || "localhost";
        const firestorePort = parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || "8080");
        (0, import_firestore.connectFirestoreEmulator)(_db, firestoreHost, firestorePort);
      }
      if (_storage) {
        const storageHost = process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST || "localhost";
        const storagePort = parseInt(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT || "9199");
        (0, import_storage.connectStorageEmulator)(_storage, storageHost, storagePort);
      }
      if (_functions) {
        const functionsHost = process.env.NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST || "localhost";
        const functionsPort = parseInt(process.env.NEXT_PUBLIC_FUNCTIONS_EMULATOR_PORT || "5001");
        (0, import_functions.connectFunctionsEmulator)(_functions, functionsHost, functionsPort);
      }
      _emulatorsConnected = true;
      console.info("\u2705 Connected to Firebase emulators");
    } catch (error) {
      console.warn("\u26A0\uFE0F  Failed to connect to emulators:", error);
    }
  }
}
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
var import_app, import_auth, import_firestore, import_storage, import_functions, firebaseConfig, isMockAuthMode, useEmulator, _auth, _db, _storage, _functions, _app, _emulatorsConnected, auth, db, storage, functions, firebaseApp;
var init_firebase_config = __esm({
  "src/legacy/firebase-config.ts"() {
    "use strict";
    import_app = require("firebase/app");
    import_auth = require("firebase/auth");
    import_firestore = require("firebase/firestore");
    import_storage = require("firebase/storage");
    import_functions = require("firebase/functions");
    firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cortex-dc-portal",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
    isMockAuthMode = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === "true";
    useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === "true";
    _auth = null;
    _db = null;
    _storage = null;
    _functions = null;
    _app = null;
    _emulatorsConnected = false;
    auth = new Proxy({}, {
      get(target, prop) {
        if (!_auth) {
          const app = getFirebaseApp();
          if (!app) {
            console.warn("Firebase app not available, auth will be limited");
            return null;
          }
          _auth = (0, import_auth.getAuth)(app);
          connectEmulators();
        }
        return _auth[prop];
      }
    });
    db = new Proxy({}, {
      get(target, prop) {
        if (!_db) {
          const app = getFirebaseApp();
          if (!app) {
            console.warn("Firebase app not available, database will be limited");
            return null;
          }
          _db = (0, import_firestore.getFirestore)(app);
          connectEmulators();
        }
        return _db[prop];
      }
    });
    storage = new Proxy({}, {
      get(target, prop) {
        if (!_storage) {
          const app = getFirebaseApp();
          if (!app) {
            console.warn("Firebase app not available, storage will be limited");
            return null;
          }
          _storage = (0, import_storage.getStorage)(app);
          connectEmulators();
        }
        return _storage[prop];
      }
    });
    functions = new Proxy({}, {
      get(target, prop) {
        if (!_functions) {
          const app = getFirebaseApp();
          if (!app) {
            console.warn("Firebase app not available, functions will be limited");
            return null;
          }
          _functions = (0, import_functions.getFunctions)(app);
          connectEmulators();
        }
        return _functions[prop];
      }
    });
    firebaseApp = new Proxy({}, {
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
  }
});

// src/adapters/firebase-auth.adapter.ts
function getFirebaseAuthAdapter() {
  if (!firebaseAuthInstance) {
    firebaseAuthInstance = new FirebaseAuthAdapter();
  }
  return firebaseAuthInstance;
}
var import_auth5, FirebaseAuthAdapter, firebaseAuthInstance;
var init_firebase_auth_adapter = __esm({
  "src/adapters/firebase-auth.adapter.ts"() {
    "use strict";
    import_auth5 = require("firebase/auth");
    init_firebase_config();
    FirebaseAuthAdapter = class {
      constructor() {
        this.initialized = false;
        this.googleProvider = new import_auth5.GoogleAuthProvider();
      }
      async initialize() {
        this.initialized = true;
      }
      isInitialized() {
        return this.initialized;
      }
      mapFirebaseUser(firebaseUser, tokenResult) {
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          role: tokenResult?.claims?.role,
          customClaims: tokenResult?.claims
        };
      }
      async signIn(credentials) {
        const userCredential = await (0, import_auth5.signInWithEmailAndPassword)(
          auth,
          credentials.email,
          credentials.password
        );
        const tokenResult = await userCredential.user.getIdTokenResult();
        const token = await userCredential.user.getIdToken();
        return {
          user: this.mapFirebaseUser(userCredential.user, tokenResult),
          token,
          refreshToken: userCredential.user.refreshToken
        };
      }
      async signUp(credentials) {
        const userCredential = await (0, import_auth5.createUserWithEmailAndPassword)(
          auth,
          credentials.email,
          credentials.password
        );
        if (credentials.displayName) {
          await (0, import_auth5.updateProfile)(userCredential.user, {
            displayName: credentials.displayName
          });
        }
        const tokenResult = await userCredential.user.getIdTokenResult();
        const token = await userCredential.user.getIdToken();
        return {
          user: this.mapFirebaseUser(userCredential.user, tokenResult),
          token,
          refreshToken: userCredential.user.refreshToken
        };
      }
      async signOut() {
        await (0, import_auth5.signOut)(auth);
      }
      async signInWithGoogle() {
        const userCredential = await (0, import_auth5.signInWithPopup)(auth, this.googleProvider);
        const tokenResult = await userCredential.user.getIdTokenResult();
        const token = await userCredential.user.getIdToken();
        return {
          user: this.mapFirebaseUser(userCredential.user, tokenResult),
          token,
          refreshToken: userCredential.user.refreshToken
        };
      }
      async getCurrentUser() {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          return null;
        }
        const tokenResult = await currentUser.getIdTokenResult();
        return this.mapFirebaseUser(currentUser, tokenResult);
      }
      async getUserById(uid) {
        throw new Error("getUserById not supported in Firebase client SDK");
      }
      async updateUserProfile(uid, data) {
        const currentUser = auth.currentUser;
        if (!currentUser || currentUser.uid !== uid) {
          throw new Error("Can only update current user profile");
        }
        await (0, import_auth5.updateProfile)(currentUser, {
          displayName: data.displayName || void 0,
          photoURL: data.photoURL || void 0
        });
        const tokenResult = await currentUser.getIdTokenResult();
        return this.mapFirebaseUser(currentUser, tokenResult);
      }
      async deleteUser(uid) {
        const currentUser = auth.currentUser;
        if (!currentUser || currentUser.uid !== uid) {
          throw new Error("Can only delete current user");
        }
        await currentUser.delete();
      }
      async getIdToken(forceRefresh = false) {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          return null;
        }
        return await currentUser.getIdToken(forceRefresh);
      }
      async verifyToken(token) {
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }
        const payload = JSON.parse(atob(parts[1]));
        return {
          uid: payload.user_id || payload.sub,
          email: payload.email,
          role: payload.role,
          exp: payload.exp,
          iat: payload.iat,
          ...payload
        };
      }
      async sendPasswordResetEmail(email) {
        await (0, import_auth5.sendPasswordResetEmail)(auth, email);
      }
      async confirmPasswordReset(code, newPassword) {
        await (0, import_auth5.confirmPasswordReset)(auth, code, newPassword);
      }
      async updatePassword(newPassword) {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("No user is currently signed in");
        }
        await (0, import_auth5.updatePassword)(currentUser, newPassword);
      }
      async sendEmailVerification() {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("No user is currently signed in");
        }
        await (0, import_auth5.sendEmailVerification)(currentUser);
      }
      onAuthStateChanged(callback) {
        return (0, import_auth5.onAuthStateChanged)(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const tokenResult = await firebaseUser.getIdTokenResult();
            callback(this.mapFirebaseUser(firebaseUser, tokenResult));
          } else {
            callback(null);
          }
        });
      }
    };
    firebaseAuthInstance = null;
  }
});

// src/adapters/keycloak-auth.adapter.ts
function getKeycloakAuthAdapter() {
  if (!keycloakAuthInstance) {
    keycloakAuthInstance = new KeycloakAuthAdapter();
  }
  return keycloakAuthInstance;
}
var KeycloakAuthAdapter, keycloakAuthInstance;
var init_keycloak_auth_adapter = __esm({
  "src/adapters/keycloak-auth.adapter.ts"() {
    "use strict";
    KeycloakAuthAdapter = class {
      constructor() {
        this.initialized = false;
        this.keycloak = null;
        // Will be Keycloak instance
        this.currentUser = null;
        const config = {
          url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8180",
          realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "cortex",
          clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "cortex-web"
        };
        console.log("[KeycloakAuthAdapter] Configuration:", config);
      }
      async initialize() {
        this.initialized = true;
      }
      isInitialized() {
        return this.initialized;
      }
      parseToken(token) {
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }
        const payload = JSON.parse(atob(parts[1]));
        return {
          uid: payload.sub,
          email: payload.email || null,
          displayName: payload.name || payload.preferred_username || null,
          photoURL: null,
          emailVerified: payload.email_verified || false,
          role: payload.role || payload.realm_access?.roles?.[0],
          customClaims: payload
        };
      }
      async signIn(credentials) {
        const tokenEndpoint = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;
        const response = await fetch(tokenEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "cortex-web",
            grant_type: "password",
            username: credentials.email,
            password: credentials.password
          })
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error_description || "Authentication failed");
        }
        const data = await response.json();
        const user = this.parseToken(data.access_token);
        this.currentUser = user;
        if (typeof window !== "undefined") {
          localStorage.setItem("keycloak_access_token", data.access_token);
          localStorage.setItem("keycloak_refresh_token", data.refresh_token);
        }
        return {
          user,
          token: data.access_token,
          refreshToken: data.refresh_token
        };
      }
      async signUp(credentials) {
        const registrationUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/registrations`;
        throw new Error(`Please complete registration at: ${registrationUrl}`);
      }
      async signOut() {
        if (typeof window !== "undefined") {
          localStorage.removeItem("keycloak_access_token");
          localStorage.removeItem("keycloak_refresh_token");
        }
        this.currentUser = null;
        const logoutUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/logout`;
      }
      async signInWithGoogle() {
        const authUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth`;
        const params = new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "cortex-web",
          response_type: "code",
          scope: "openid email profile",
          redirect_uri: `${window.location.origin}/auth/callback`,
          kc_idp_hint: "google"
        });
        window.location.href = `${authUrl}?${params.toString()}`;
        return new Promise(() => {
        });
      }
      async getCurrentUser() {
        if (this.currentUser) {
          return this.currentUser;
        }
        const token = await this.getIdToken();
        if (token) {
          this.currentUser = this.parseToken(token);
          return this.currentUser;
        }
        return null;
      }
      async getUserById(uid) {
        throw new Error("getUserById requires admin access");
      }
      async updateUserProfile(uid, data) {
        throw new Error("Profile updates should be done through Keycloak Account Console");
      }
      async deleteUser(uid) {
        throw new Error("User deletion requires admin access");
      }
      async getIdToken(forceRefresh = false) {
        if (typeof window === "undefined") {
          return null;
        }
        let token = localStorage.getItem("keycloak_access_token");
        if (!token) {
          return null;
        }
        if (forceRefresh) {
          const refreshToken = localStorage.getItem("keycloak_refresh_token");
          if (refreshToken) {
            try {
              const result = await this.refreshToken(refreshToken);
              token = result.token;
            } catch (error) {
              return null;
            }
          }
        }
        return token;
      }
      async verifyToken(token) {
        return this.parseToken(token);
      }
      async refreshToken(refreshToken) {
        const tokenEndpoint = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;
        const response = await fetch(tokenEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "cortex-web",
            grant_type: "refresh_token",
            refresh_token: refreshToken
          })
        });
        if (!response.ok) {
          throw new Error("Token refresh failed");
        }
        const data = await response.json();
        const user = this.parseToken(data.access_token);
        this.currentUser = user;
        if (typeof window !== "undefined") {
          localStorage.setItem("keycloak_access_token", data.access_token);
          localStorage.setItem("keycloak_refresh_token", data.refresh_token);
        }
        return {
          user,
          token: data.access_token,
          refreshToken: data.refresh_token
        };
      }
      async sendPasswordResetEmail(email) {
        const resetUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/login-actions/reset-credentials`;
        console.log(`Password reset: ${resetUrl}`);
      }
      async confirmPasswordReset(code, newPassword) {
        throw new Error("Password reset handled by Keycloak");
      }
      async updatePassword(newPassword) {
        throw new Error("Password updates should be done through Keycloak Account Console");
      }
      onAuthStateChanged(callback) {
        let intervalId;
        if (typeof window !== "undefined") {
          intervalId = setInterval(async () => {
            const user = await this.getCurrentUser();
            callback(user);
          }, 5e3);
        }
        return () => {
          if (intervalId) {
            clearInterval(intervalId);
          }
        };
      }
    };
    keycloakAuthInstance = null;
  }
});

// src/adapters/auth.factory.ts
var auth_factory_exports = {};
__export(auth_factory_exports, {
  AuthFactory: () => AuthFactory,
  getAuth: () => getAuth2
});
function getAuth2() {
  return AuthFactory.getAdapter();
}
var AuthFactory;
var init_auth_factory = __esm({
  "src/adapters/auth.factory.ts"() {
    "use strict";
    init_firebase_auth_adapter();
    init_keycloak_auth_adapter();
    AuthFactory = class {
      /**
       * Get the configured auth adapter
       */
      static getAdapter() {
        if (!this.instance) {
          this.instance = this.createAdapter();
        }
        return this.instance;
      }
      /**
       * Create a new adapter based on environment configuration
       */
      static createAdapter() {
        const mode = this.getMode();
        console.log(`[AuthFactory] Initializing ${mode} adapter`);
        if (mode === "keycloak") {
          return getKeycloakAuthAdapter();
        } else {
          return getFirebaseAuthAdapter();
        }
      }
      /**
       * Determine which auth mode to use
       */
      static getMode() {
        if (this.mode) {
          return this.mode;
        }
        const deploymentMode = process.env.DEPLOYMENT_MODE || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;
        if (deploymentMode === "self-hosted") {
          this.mode = "keycloak";
          return "keycloak";
        }
        if (process.env.NEXT_PUBLIC_KEYCLOAK_URL || process.env.KEYCLOAK_URL) {
          this.mode = "keycloak";
          return "keycloak";
        }
        this.mode = "firebase";
        return "firebase";
      }
      /**
       * Manually set the auth mode (useful for testing)
       */
      static setMode(mode) {
        this.mode = mode;
        this.instance = null;
      }
      /**
       * Reset the factory (useful for testing)
       */
      static reset() {
        this.instance = null;
        this.mode = null;
      }
      /**
       * Initialize the auth adapter
       */
      static async initialize() {
        const adapter = this.getAdapter();
        await adapter.initialize();
      }
    };
    AuthFactory.instance = null;
    AuthFactory.mode = null;
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AccessControlService: () => AccessControlService,
  AnalyticsService: () => AnalyticsService,
  CHAT_COLLECTION: () => CHAT_COLLECTION,
  CacheInvalidationPatterns: () => CacheInvalidationPatterns,
  CacheKeys: () => CacheKeys,
  ChatValidationRules: () => ChatValidationRules,
  DEFAULT_CONFIG: () => DEFAULT_CONFIG,
  DatabaseValidationService: () => DatabaseValidationService,
  DynamicRecordService: () => DynamicRecordService,
  EventTrackingService: () => EventTrackingService,
  FederatedDataService: () => FederatedDataService,
  FirestoreClient: () => FirestoreClient,
  FirestoreQueries: () => FirestoreQueries,
  GroupManagementService: () => GroupManagementService,
  MemgraphService: () => MemgraphService,
  OpenSearchService: () => OpenSearchService,
  POVStatus: () => POVStatus,
  Priority: () => Priority,
  ProjectStatus: () => ProjectStatus,
  RBACMiddleware: () => RBACMiddleware,
  ROLE_PERMISSIONS: () => ROLE_PERMISSIONS,
  RecordProcessingOrchestrator: () => RecordProcessingOrchestrator,
  RedisCacheService: () => RedisCacheService,
  RelationshipManagementService: () => RelationshipManagementService,
  TRRStatus: () => TRRStatus,
  TaskStatus: () => TaskStatus,
  TerraformGenerationService: () => TerraformGenerationService,
  USER_COLLECTION: () => USER_COLLECTION,
  UserManagementService: () => UserManagementService,
  UserRole: () => UserRole,
  UserSchema: () => UserSchema,
  UserValidationRules: () => UserValidationRules,
  accessControlService: () => accessControlService,
  analyticsService: () => analyticsService,
  app: () => firebaseApp,
  auth: () => auth,
  authService: () => authService,
  calculateAvgCycleDays: () => calculateAvgCycleDays,
  calculateWinRate: () => calculateWinRate,
  databaseValidationService: () => databaseValidationService,
  db: () => db,
  dcContextStore: () => dcContextStore,
  dynamicRecordService: () => dynamicRecordService,
  eventTrackingService: () => eventTrackingService,
  federatedDataService: () => federatedDataService,
  fetchAnalytics: () => fetchAnalytics,
  fetchBlueprintSummary: () => fetchBlueprintSummary,
  fetchRegionEngagements: () => fetchRegionEngagements,
  fetchUserEngagements: () => fetchUserEngagements,
  firebaseApp: () => firebaseApp,
  forceReconnectEmulators: () => forceReconnectEmulators,
  functions: () => functions,
  getAuth: () => getAuth2,
  getDatabase: () => getDatabase,
  getEngagementTrends: () => getEngagementTrends,
  getFirebaseConfig: () => getFirebaseConfig,
  getRedisCacheService: () => getRedisCacheService,
  getStorage: () => getStorage2,
  getTopPerformingUsers: () => getTopPerformingUsers,
  groupManagementService: () => groupManagementService,
  initializeStorage: () => initializeStorage,
  isMockAuthMode: () => isMockAuthMode,
  memgraphService: () => memgraphService,
  openSearchService: () => openSearchService,
  redisCacheService: () => redisCacheService,
  relationshipManagementService: () => relationshipManagementService,
  storage: () => storage,
  terraformGenerationService: () => terraformGenerationService,
  useEmulator: () => useEmulator,
  userActivityService: () => userActivityService,
  userManagementApiClient: () => userManagementApiClient,
  userManagementService: () => userManagementService
});
module.exports = __toCommonJS(index_exports);
init_firebase_config();
init_firebase_config();

// src/legacy/firestore/client.ts
var import_firestore2 = require("firebase/firestore");
var FirestoreClient = class {
  constructor(config) {
    this.config = config;
    this.db = (0, import_firestore2.getFirestore)(config.app);
    if (config.useEmulator && config.emulatorHost && config.emulatorPort) {
      (0, import_firestore2.connectFirestoreEmulator)(this.db, config.emulatorHost, config.emulatorPort);
    }
  }
  getDatabase() {
    return this.db;
  }
  // TODO: Add common database operations
  async connect() {
  }
  async disconnect() {
  }
};

// src/legacy/firestore/queries.ts
var FirestoreQueries = class {
  // Placeholder implementation
};

// src/auth/auth-service.ts
var AuthService = class {
  constructor() {
    this.STORAGE_KEYS = {
      AUTHENTICATED: "cortex_dc_authenticated",
      USER: "cortex_dc_user",
      SESSION_ID: "cortex_dc_session_id"
    };
    // Valid credentials and corresponding user profiles
    // TODO: Move to environment variables or secure backend
    this.VALID_USERS = {
      user1: {
        password: "paloalto1",
        profile: {
          id: "user1-001",
          username: "user1",
          email: "user1@paloaltonetworks.com",
          role: "user",
          viewMode: "user",
          permissions: ["scenario:execute", "pov:create", "trr:create"],
          authProvider: "local"
        }
      },
      cortex: {
        password: "xsiam",
        profile: {
          id: "cortex-001",
          username: "cortex",
          email: "cortex@paloaltonetworks.com",
          role: "admin",
          viewMode: "admin",
          permissions: [
            "scenario:execute",
            "pov:create",
            "system:admin",
            "trr:manage",
            "user:manage"
          ],
          authProvider: "local"
        }
      }
    };
  }
  /**
   * Authenticate user with local credentials
   * Supports: user1/paloalto1 and cortex/xsiam
   * @param credentials - Username and password
   * @returns Authentication result with user data or error
   */
  async authenticate(credentials) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const userConfig = this.VALID_USERS[credentials.username];
      if (userConfig && credentials.password === userConfig.password) {
        const user = {
          ...userConfig.profile,
          lastLogin: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.setSession(user);
        return {
          success: true,
          user
        };
      } else {
        return {
          success: false,
          error: "Invalid credentials. Use user1/paloalto1 or cortex/xsiam."
        };
      }
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        success: false,
        error: "Authentication failed. Please try again."
      };
    }
  }
  /**
   * Check if user is currently authenticated
   * @returns True if user has valid session
   */
  isAuthenticated() {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(this.STORAGE_KEYS.AUTHENTICATED) === "true";
  }
  /**
   * Get current authenticated user
   * @returns User object or null if not authenticated
   */
  getCurrentUser() {
    if (typeof window === "undefined") return null;
    try {
      const userStr = sessionStorage.getItem(this.STORAGE_KEYS.USER);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.warn("Failed to parse user from session:", error);
      this.clearSession();
      return null;
    }
  }
  /**
   * Get current session ID
   * @returns Session ID or null
   */
  getSessionId() {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(this.STORAGE_KEYS.SESSION_ID);
  }
  /**
   * Store authentication session
   * @param user - Authenticated user data
   */
  setSession(user) {
    if (typeof window === "undefined") return;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    sessionStorage.setItem(this.STORAGE_KEYS.AUTHENTICATED, "true");
    sessionStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
    sessionStorage.setItem(this.STORAGE_KEYS.SESSION_ID, sessionId);
  }
  /**
   * Clear authentication session
   */
  clearSession() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(this.STORAGE_KEYS.AUTHENTICATED);
    sessionStorage.removeItem(this.STORAGE_KEYS.USER);
    sessionStorage.removeItem(this.STORAGE_KEYS.SESSION_ID);
  }
  /**
   * Logout user and clear session
   */
  async logout() {
    try {
      this.clearSession();
    } catch (error) {
      console.error("Logout error:", error);
      this.clearSession();
    }
  }
  /**
   * Check if user has specific permission
   * @param permission - Permission string to check
   * @returns True if user has permission
   */
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.viewMode === "admin") return true;
    return user.permissions.includes(permission);
  }
  /**
   * Check if user has admin role
   * @returns True if user is admin
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === "admin" || user?.viewMode === "admin";
  }
  /**
   * Get user permissions
   * @returns Array of permission strings
   */
  getUserPermissions() {
    const user = this.getCurrentUser();
    return user?.permissions || [];
  }
};
var authService = new AuthService();

// src/adapters/firestore.adapter.ts
var import_firestore3 = require("firebase/firestore");
init_firebase_config();
var FirestoreAdapter = class {
  constructor() {
    this.connected = true;
  }
  // Firestore is always "connected"
  async connect() {
    this.connected = true;
  }
  async disconnect() {
    this.connected = false;
  }
  isConnected() {
    return this.connected;
  }
  buildQuery(collectionName, options) {
    const collectionRef = (0, import_firestore3.collection)(db, collectionName);
    const constraints = [];
    if (options?.filters) {
      options.filters.forEach((filter) => {
        constraints.push((0, import_firestore3.where)(filter.field, filter.operator, filter.value));
      });
    }
    if (options?.orderBy) {
      constraints.push((0, import_firestore3.orderBy)(options.orderBy, options.orderDirection || "asc"));
    }
    if (options?.limit) {
      constraints.push((0, import_firestore3.limit)(options.limit));
    }
    return (0, import_firestore3.query)(collectionRef, ...constraints);
  }
  async findMany(collection, options) {
    const q = this.buildQuery(collection, options);
    const querySnapshot = await (0, import_firestore3.getDocs)(q);
    return querySnapshot.docs.map((doc2) => ({
      id: doc2.id,
      ...doc2.data()
    }));
  }
  async findOne(collection, id) {
    const docRef = (0, import_firestore3.doc)(db, collection, id);
    const docSnap = await (0, import_firestore3.getDoc)(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }
  async findByField(collection, field, value) {
    const results = await this.findMany(collection, {
      filters: [{ field, operator: "==", value }],
      limit: 1
    });
    return results.length > 0 ? results[0] : null;
  }
  async create(collection, data) {
    const collectionRef = (0, import_firestore3.collection)(db, collection);
    const docRef = (0, import_firestore3.doc)(collectionRef);
    const fullData = {
      ...data,
      id: docRef.id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await (0, import_firestore3.setDoc)(docRef, fullData);
    return fullData;
  }
  async update(collection, id, data) {
    const docRef = (0, import_firestore3.doc)(db, collection, id);
    const updateData = {
      ...data,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await (0, import_firestore3.updateDoc)(docRef, updateData);
    return await this.findOne(collection, id);
  }
  async delete(collection, id) {
    const docRef = (0, import_firestore3.doc)(db, collection, id);
    await (0, import_firestore3.deleteDoc)(docRef);
  }
  async createMany(collection, data) {
    const batch = (0, import_firestore3.writeBatch)(db);
    const created = [];
    data.forEach((item) => {
      const collectionRef = (0, import_firestore3.collection)(db, collection);
      const docRef = (0, import_firestore3.doc)(collectionRef);
      const fullData = {
        ...item,
        id: docRef.id,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      batch.set(docRef, fullData);
      created.push(fullData);
    });
    await batch.commit();
    return created;
  }
  async updateMany(collection, ids, data) {
    const batch = (0, import_firestore3.writeBatch)(db);
    const updateData = {
      ...data,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    ids.forEach((id) => {
      const docRef = (0, import_firestore3.doc)(db, collection, id);
      batch.update(docRef, updateData);
    });
    await batch.commit();
  }
  async deleteMany(collection, ids) {
    const batch = (0, import_firestore3.writeBatch)(db);
    ids.forEach((id) => {
      const docRef = (0, import_firestore3.doc)(db, collection, id);
      batch.delete(docRef);
    });
    await batch.commit();
  }
  async transaction(callback) {
    return await (0, import_firestore3.runTransaction)(db, async (transaction) => {
      const tx = {
        findOne: async (collection, id) => {
          const docRef = (0, import_firestore3.doc)(db, collection, id);
          const docSnap = await transaction.get(docRef);
          if (!docSnap.exists()) {
            return null;
          }
          return {
            id: docSnap.id,
            ...docSnap.data()
          };
        },
        create: async (collection, data) => {
          const collectionRef = (0, import_firestore3.collection)(db, collection);
          const docRef = (0, import_firestore3.doc)(collectionRef);
          const fullData = {
            ...data,
            id: docRef.id,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          transaction.set(docRef, fullData);
          return fullData;
        },
        update: async (collection, id, data) => {
          const docRef = (0, import_firestore3.doc)(db, collection, id);
          const updateData = {
            ...data,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          transaction.update(docRef, updateData);
          const docSnap = await transaction.get(docRef);
          return {
            id: docSnap.id,
            ...docSnap.data()
          };
        },
        delete: async (collection, id) => {
          const docRef = (0, import_firestore3.doc)(db, collection, id);
          transaction.delete(docRef);
        }
      };
      return await callback(tx);
    });
  }
  async exists(collection, id) {
    const docRef = (0, import_firestore3.doc)(db, collection, id);
    const docSnap = await (0, import_firestore3.getDoc)(docRef);
    return docSnap.exists();
  }
  async count(collection, options) {
    const q = this.buildQuery(collection, options);
    const snapshot = await (0, import_firestore3.getCountFromServer)(q);
    return snapshot.data().count;
  }
};
var firestoreInstance = null;
function getFirestoreAdapter() {
  if (!firestoreInstance) {
    firestoreInstance = new FirestoreAdapter();
  }
  return firestoreInstance;
}

// src/adapters/postgres.adapter.ts
var import_client = require("@prisma/client");
var PostgresAdapter = class {
  constructor(databaseUrl) {
    this.connected = false;
    this.prisma = new import_client.PrismaClient({
      datasources: {
        db: {
          url: databaseUrl || process.env.DATABASE_URL
        }
      }
    });
  }
  async connect() {
    await this.prisma.$connect();
    this.connected = true;
  }
  async disconnect() {
    await this.prisma.$disconnect();
    this.connected = false;
  }
  isConnected() {
    return this.connected;
  }
  getModel(collection) {
    const modelName = this.collectionToModelName(collection);
    return this.prisma[modelName];
  }
  collectionToModelName(collection) {
    const mapping = {
      users: "user",
      povs: "pOV",
      trrs: "tRR",
      activityLogs: "activityLog",
      loginEvents: "loginEvent",
      userSessions: "userSession",
      dataImportJobs: "dataImportJob",
      stagingRecords: "stagingRecord",
      dataMigrationLogs: "dataMigrationLog"
    };
    return mapping[collection] || collection;
  }
  buildWhereClause(options) {
    if (!options?.filters || options.filters.length === 0) {
      return {};
    }
    const where2 = {};
    options.filters.forEach((filter) => {
      switch (filter.operator) {
        case "==":
          where2[filter.field] = filter.value;
          break;
        case "!=":
          where2[filter.field] = { not: filter.value };
          break;
        case ">":
          where2[filter.field] = { gt: filter.value };
          break;
        case "<":
          where2[filter.field] = { lt: filter.value };
          break;
        case ">=":
          where2[filter.field] = { gte: filter.value };
          break;
        case "<=":
          where2[filter.field] = { lte: filter.value };
          break;
        case "in":
          where2[filter.field] = { in: filter.value };
          break;
        case "array-contains":
          where2[filter.field] = { has: filter.value };
          break;
      }
    });
    return where2;
  }
  async findMany(collection, options) {
    const model = this.getModel(collection);
    const where2 = this.buildWhereClause(options);
    const query2 = { where: where2 };
    if (options?.limit) {
      query2.take = options.limit;
    }
    if (options?.offset) {
      query2.skip = options.offset;
    }
    if (options?.orderBy) {
      query2.orderBy = {
        [options.orderBy]: options.orderDirection || "asc"
      };
    }
    return await model.findMany(query2);
  }
  async findOne(collection, id) {
    const model = this.getModel(collection);
    return await model.findUnique({
      where: { id }
    });
  }
  async findByField(collection, field, value) {
    const model = this.getModel(collection);
    return await model.findFirst({
      where: { [field]: value }
    });
  }
  async create(collection, data) {
    const model = this.getModel(collection);
    return await model.create({
      data
    });
  }
  async update(collection, id, data) {
    const model = this.getModel(collection);
    return await model.update({
      where: { id },
      data
    });
  }
  async delete(collection, id) {
    const model = this.getModel(collection);
    await model.delete({
      where: { id }
    });
  }
  async createMany(collection, data) {
    const model = this.getModel(collection);
    const created = [];
    for (const item of data) {
      const result = await model.create({ data: item });
      created.push(result);
    }
    return created;
  }
  async updateMany(collection, ids, data) {
    const model = this.getModel(collection);
    await model.updateMany({
      where: { id: { in: ids } },
      data
    });
  }
  async deleteMany(collection, ids) {
    const model = this.getModel(collection);
    await model.deleteMany({
      where: { id: { in: ids } }
    });
  }
  async transaction(callback) {
    return await this.prisma.$transaction(async (prisma) => {
      const tx = {
        findOne: async (collection, id) => {
          const modelName = this.collectionToModelName(collection);
          return await prisma[modelName].findUnique({
            where: { id }
          });
        },
        create: async (collection, data) => {
          const modelName = this.collectionToModelName(collection);
          return await prisma[modelName].create({
            data
          });
        },
        update: async (collection, id, data) => {
          const modelName = this.collectionToModelName(collection);
          return await prisma[modelName].update({
            where: { id },
            data
          });
        },
        delete: async (collection, id) => {
          const modelName = this.collectionToModelName(collection);
          await prisma[modelName].delete({
            where: { id }
          });
        }
      };
      return await callback(tx);
    });
  }
  async exists(collection, id) {
    const model = this.getModel(collection);
    const count = await model.count({
      where: { id }
    });
    return count > 0;
  }
  async count(collection, options) {
    const model = this.getModel(collection);
    const where2 = this.buildWhereClause(options);
    return await model.count({ where: where2 });
  }
};
var postgresInstance = null;
function getPostgresAdapter() {
  if (!postgresInstance) {
    postgresInstance = new PostgresAdapter();
  }
  return postgresInstance;
}

// src/adapters/database.factory.ts
var DatabaseFactory = class {
  /**
   * Get the configured database adapter
   */
  static getAdapter() {
    if (!this.instance) {
      this.instance = this.createAdapter();
    }
    return this.instance;
  }
  /**
   * Create a new adapter based on environment configuration
   */
  static createAdapter() {
    const mode = this.getMode();
    console.log(`[DatabaseFactory] Initializing ${mode} adapter`);
    if (mode === "self-hosted") {
      return getPostgresAdapter();
    } else {
      return getFirestoreAdapter();
    }
  }
  /**
   * Determine which database mode to use
   */
  static getMode() {
    if (this.mode) {
      return this.mode;
    }
    const deploymentMode = process.env.DEPLOYMENT_MODE || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;
    if (deploymentMode === "self-hosted") {
      this.mode = "self-hosted";
      return "self-hosted";
    }
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("postgresql")) {
      this.mode = "self-hosted";
      return "self-hosted";
    }
    this.mode = "firebase";
    return "firebase";
  }
  /**
   * Manually set the database mode (useful for testing)
   */
  static setMode(mode) {
    this.mode = mode;
    this.instance = null;
  }
  /**
   * Reset the factory (useful for testing)
   */
  static reset() {
    this.instance = null;
    this.mode = null;
  }
  /**
   * Connect to the database
   */
  static async connect() {
    const adapter = this.getAdapter();
    await adapter.connect();
  }
  /**
   * Disconnect from the database
   */
  static async disconnect() {
    const adapter = this.getAdapter();
    await adapter.disconnect();
  }
};
DatabaseFactory.instance = null;
DatabaseFactory.mode = null;
function getDatabase() {
  return DatabaseFactory.getAdapter();
}

// src/services/data-service.ts
async function fetchAnalytics(filters) {
  const sinceDays = filters.sinceDays ?? 90;
  const since = new Date(Date.now() - sinceDays * 864e5);
  try {
    const db2 = getDatabase();
    const queryFilters = [];
    queryFilters.push({
      field: "createdAt",
      operator: ">=",
      value: since
    });
    if (filters.region && filters.region !== "GLOBAL") {
      queryFilters.push({
        field: "region",
        operator: "==",
        value: filters.region
      });
    }
    if (filters.theatre && filters.theatre !== "all") {
      queryFilters.push({
        field: "theatre",
        operator: "==",
        value: filters.theatre
      });
    }
    if (filters.user && filters.user !== "all") {
      queryFilters.push({
        field: "user",
        operator: "==",
        value: filters.user
      });
    }
    let engagements = await db2.findMany("dc_engagements", {
      filters: queryFilters,
      orderBy: "createdAt",
      orderDirection: "desc"
    });
    if (engagements.length === 0 && queryFilters.length > 1) {
      console.warn("Query with filters returned empty, falling back to date-only filter");
      engagements = await db2.findMany("dc_engagements", {
        filters: [queryFilters[0]],
        // Just the date filter
        orderBy: "createdAt",
        orderDirection: "desc"
      });
    }
    const records = engagements.map((doc2) => {
      const createdAt = doc2.createdAt instanceof Date ? doc2.createdAt : doc2.createdAt?.toDate ? doc2.createdAt.toDate() : new Date(doc2.createdAt || Date.now());
      const completedAt = doc2.completedAt instanceof Date ? doc2.completedAt : doc2.completedAt?.toDate ? doc2.completedAt.toDate() : doc2.completedAt ? new Date(doc2.completedAt) : null;
      const cycleDays = doc2.cycleDays ?? (completedAt ? Math.max(0, Math.round((completedAt.getTime() - createdAt.getTime()) / 864e5)) : void 0);
      return {
        region: doc2.region || "UNKNOWN",
        theatre: doc2.theatre || "UNKNOWN",
        user: (doc2.user || "unknown").toLowerCase(),
        location: doc2.location || "N/A",
        customer: doc2.customer || "unknown",
        createdAt,
        completedAt,
        scenariosExecuted: doc2.scenariosExecuted ?? 0,
        detectionsValidated: doc2.detectionsValidated ?? 0,
        trrOutcome: doc2.trrOutcome ?? null,
        cycleDays
      };
    });
    const okrsData = await db2.findMany("dc_okrs", {});
    const okrs = okrsData.map((doc2) => ({
      id: doc2.id || doc2._id,
      name: doc2.name || doc2.id || doc2._id,
      progress: Number(doc2.progress ?? 0)
    }));
    return {
      records,
      okrs,
      source: records.length ? "database" : "empty"
    };
  } catch (e) {
    console.error("Error fetching analytics:", e);
    return { records: [], okrs: [], source: "mock" };
  }
}
async function fetchBlueprintSummary(customer, sinceDays = 90) {
  const since = new Date(Date.now() - sinceDays * 864e5);
  try {
    const db2 = getDatabase();
    const engagements = await db2.findMany("dc_engagements", {
      filters: [
        {
          field: "customer",
          operator: "==",
          value: customer
        },
        {
          field: "createdAt",
          operator: ">=",
          value: since
        }
      ]
    });
    const records = engagements.map((doc2) => {
      const createdAt = doc2.createdAt instanceof Date ? doc2.createdAt : doc2.createdAt?.toDate ? doc2.createdAt.toDate() : new Date(doc2.createdAt || Date.now());
      const completedAt = doc2.completedAt instanceof Date ? doc2.completedAt : doc2.completedAt?.toDate ? doc2.completedAt.toDate() : doc2.completedAt ? new Date(doc2.completedAt) : null;
      const cycleDays = doc2.cycleDays ?? (completedAt ? Math.max(0, Math.round((completedAt.getTime() - createdAt.getTime()) / 864e5)) : void 0);
      return {
        region: doc2.region || "UNKNOWN",
        theatre: doc2.theatre || "UNKNOWN",
        user: (doc2.user || "unknown").toLowerCase(),
        location: doc2.location || "N/A",
        customer: doc2.customer || "unknown",
        createdAt,
        completedAt,
        scenariosExecuted: doc2.scenariosExecuted ?? 0,
        detectionsValidated: doc2.detectionsValidated ?? 0,
        trrOutcome: doc2.trrOutcome ?? null,
        cycleDays
      };
    });
    const sum = (a, b) => a + b;
    const engagementsCount = records.length;
    const scenariosExecuted = records.map((r) => r.scenariosExecuted ?? 0).reduce(sum, 0);
    const detectionsValidated = records.map((r) => r.detectionsValidated ?? 0).reduce(sum, 0);
    const trrWins = records.filter((r) => r.trrOutcome === "win").length;
    const trrLosses = records.filter((r) => r.trrOutcome === "loss").length;
    const avgCycleDays = records.length ? Math.round(records.map((r) => r.cycleDays ?? 0).reduce(sum, 0) / records.length) : 0;
    return {
      engagements: engagementsCount,
      scenariosExecuted,
      detectionsValidated,
      trrWins,
      trrLosses,
      avgCycleDays,
      source: engagementsCount ? "database" : "empty"
    };
  } catch (e) {
    console.error("Error fetching blueprint summary:", e);
    return {
      engagements: 0,
      scenariosExecuted: 0,
      detectionsValidated: 0,
      trrWins: 0,
      trrLosses: 0,
      avgCycleDays: 0,
      source: "mock"
    };
  }
}
async function fetchUserEngagements(userId, sinceDays = 90) {
  const result = await fetchAnalytics({
    user: userId,
    sinceDays
  });
  return result.records;
}
async function fetchRegionEngagements(region, sinceDays = 90) {
  const result = await fetchAnalytics({
    region,
    sinceDays
  });
  return result.records;
}
function calculateWinRate(records) {
  const trrRecords = records.filter((r) => r.trrOutcome !== null);
  if (trrRecords.length === 0) return 0;
  const wins = trrRecords.filter((r) => r.trrOutcome === "win").length;
  return Math.round(wins / trrRecords.length * 100);
}
function calculateAvgCycleDays(records) {
  const withCycleDays = records.filter((r) => r.cycleDays !== void 0);
  if (withCycleDays.length === 0) return 0;
  const total = withCycleDays.reduce((sum, r) => sum + (r.cycleDays ?? 0), 0);
  return Math.round(total / withCycleDays.length);
}
function getTopPerformingUsers(records, limit = 10) {
  const userMap = /* @__PURE__ */ new Map();
  records.forEach((record) => {
    const user = record.user;
    const stats = userMap.get(user) || { engagements: 0, wins: 0, total: 0 };
    stats.engagements++;
    if (record.trrOutcome) {
      stats.total++;
      if (record.trrOutcome === "win") {
        stats.wins++;
      }
    }
    userMap.set(user, stats);
  });
  const topUsers = Array.from(userMap.entries()).map(([user, stats]) => ({
    user,
    engagements: stats.engagements,
    winRate: stats.total > 0 ? Math.round(stats.wins / stats.total * 100) : 0
  })).sort((a, b) => b.engagements - a.engagements).slice(0, limit);
  return topUsers;
}
function getEngagementTrends(records) {
  const dateMap = /* @__PURE__ */ new Map();
  records.forEach((record) => {
    const date = record.createdAt.toISOString().split("T")[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });
  const trends = Array.from(dateMap.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  return trends;
}

// src/types/auth.ts
var import_zod = require("zod");
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["USER"] = "user";
  UserRole2["MANAGER"] = "manager";
  UserRole2["ADMIN"] = "admin";
  return UserRole2;
})(UserRole || {});
var UserStatus = /* @__PURE__ */ ((UserStatus2) => {
  UserStatus2["ACTIVE"] = "active";
  UserStatus2["INACTIVE"] = "inactive";
  UserStatus2["PENDING"] = "pending";
  UserStatus2["SUSPENDED"] = "suspended";
  return UserStatus2;
})(UserStatus || {});
var UserProfileSchema = import_zod.z.object({
  uid: import_zod.z.string(),
  email: import_zod.z.string().email(),
  displayName: import_zod.z.string(),
  role: import_zod.z.nativeEnum(UserRole),
  status: import_zod.z.nativeEnum(UserStatus),
  department: import_zod.z.string().optional(),
  title: import_zod.z.string().optional(),
  manager: import_zod.z.string().optional(),
  // uid of manager
  teams: import_zod.z.array(import_zod.z.string()).default([]),
  // team IDs
  preferences: import_zod.z.object({
    theme: import_zod.z.enum(["light", "dark", "system"]).default("system"),
    notifications: import_zod.z.object({
      email: import_zod.z.boolean().default(true),
      inApp: import_zod.z.boolean().default(true),
      desktop: import_zod.z.boolean().default(false)
    }).default({}),
    dashboard: import_zod.z.object({
      layout: import_zod.z.enum(["grid", "list"]).default("grid"),
      defaultView: import_zod.z.string().optional()
    }).default({})
  }).default({}),
  permissions: import_zod.z.object({
    povManagement: import_zod.z.object({
      create: import_zod.z.boolean().default(true),
      edit: import_zod.z.boolean().default(true),
      delete: import_zod.z.boolean().default(false),
      viewAll: import_zod.z.boolean().default(false)
    }).default({}),
    trrManagement: import_zod.z.object({
      create: import_zod.z.boolean().default(true),
      edit: import_zod.z.boolean().default(true),
      delete: import_zod.z.boolean().default(false),
      approve: import_zod.z.boolean().default(false),
      viewAll: import_zod.z.boolean().default(false)
    }).default({}),
    contentHub: import_zod.z.object({
      create: import_zod.z.boolean().default(true),
      edit: import_zod.z.boolean().default(true),
      publish: import_zod.z.boolean().default(false),
      moderate: import_zod.z.boolean().default(false)
    }).default({}),
    scenarioEngine: import_zod.z.object({
      execute: import_zod.z.boolean().default(true),
      create: import_zod.z.boolean().default(false),
      modify: import_zod.z.boolean().default(false)
    }).default({}),
    terminal: import_zod.z.object({
      basic: import_zod.z.boolean().default(true),
      advanced: import_zod.z.boolean().default(false),
      admin: import_zod.z.boolean().default(false)
    }).default({}),
    analytics: import_zod.z.object({
      view: import_zod.z.boolean().default(true),
      export: import_zod.z.boolean().default(false),
      detailed: import_zod.z.boolean().default(false)
    }).default({}),
    userManagement: import_zod.z.object({
      view: import_zod.z.boolean().default(false),
      edit: import_zod.z.boolean().default(false),
      create: import_zod.z.boolean().default(false),
      delete: import_zod.z.boolean().default(false)
    }).default({})
  }),
  createdAt: import_zod.z.date(),
  updatedAt: import_zod.z.date(),
  lastLoginAt: import_zod.z.date().optional()
});
var TeamSchema = import_zod.z.object({
  id: import_zod.z.string(),
  name: import_zod.z.string(),
  description: import_zod.z.string().optional(),
  manager: import_zod.z.string(),
  // uid of team manager
  members: import_zod.z.array(import_zod.z.string()),
  // array of user uids
  region: import_zod.z.string().optional(),
  department: import_zod.z.string().optional(),
  isActive: import_zod.z.boolean().default(true),
  createdAt: import_zod.z.date(),
  updatedAt: import_zod.z.date()
});
var ROLE_PERMISSIONS = {
  ["user" /* USER */]: {
    povManagement: {
      create: true,
      edit: true,
      delete: false,
      viewAll: false
    },
    trrManagement: {
      create: true,
      edit: true,
      delete: false,
      approve: false,
      viewAll: false
    },
    contentHub: {
      create: true,
      edit: true,
      publish: false,
      moderate: false
    },
    scenarioEngine: {
      execute: true,
      create: false,
      modify: false
    },
    terminal: {
      basic: true,
      advanced: false,
      admin: false
    },
    analytics: {
      view: true,
      export: false,
      detailed: false
    },
    userManagement: {
      view: false,
      edit: false,
      create: false,
      delete: false
    }
  },
  ["manager" /* MANAGER */]: {
    povManagement: {
      create: true,
      edit: true,
      delete: true,
      viewAll: true
    },
    trrManagement: {
      create: true,
      edit: true,
      delete: true,
      approve: true,
      viewAll: true
    },
    contentHub: {
      create: true,
      edit: true,
      publish: true,
      moderate: true
    },
    scenarioEngine: {
      execute: true,
      create: true,
      modify: true
    },
    terminal: {
      basic: true,
      advanced: true,
      admin: false
    },
    analytics: {
      view: true,
      export: true,
      detailed: true
    },
    userManagement: {
      view: true,
      edit: false,
      create: false,
      delete: false
    }
  },
  ["admin" /* ADMIN */]: {
    povManagement: {
      create: true,
      edit: true,
      delete: true,
      viewAll: true
    },
    trrManagement: {
      create: true,
      edit: true,
      delete: true,
      approve: true,
      viewAll: true
    },
    contentHub: {
      create: true,
      edit: true,
      publish: true,
      moderate: true
    },
    scenarioEngine: {
      execute: true,
      create: true,
      modify: true
    },
    terminal: {
      basic: true,
      advanced: true,
      admin: true
    },
    analytics: {
      view: true,
      export: true,
      detailed: true
    },
    userManagement: {
      view: true,
      edit: true,
      create: true,
      delete: true
    }
  }
};

// src/services/access-control-service.ts
var AccessControlService = class {
  /**
   * Build access context for a user
   * This gathers all groups and permissions for efficient querying
   */
  async buildAccessContext(userId) {
    const db2 = getDatabase();
    const user = await db2.findOne("users", userId);
    if (!user) {
      throw new Error("User not found");
    }
    const memberGroups = await db2.findMany("groups", {
      filters: [
        {
          field: "memberIds",
          operator: "array-contains",
          value: userId
        }
      ]
    });
    const managedGroups = await db2.findMany("groups", {
      filters: [
        {
          field: "managerId",
          operator: "==",
          value: userId
        }
      ]
    });
    return {
      userId,
      role: user.role,
      groups: memberGroups.map((g) => g.id),
      managedGroups: managedGroups.map((g) => g.id),
      organizationId: user.department
      // or organizationId if you have that field
    };
  }
  /**
   * Check if user can access a specific resource
   */
  async canAccess(context, resource, resourceId, action = "read") {
    if (context.role === "admin" /* ADMIN */) {
      return { granted: true, reason: "Admin access" };
    }
    const db2 = getDatabase();
    const data = await db2.findOne(resource, resourceId);
    if (!data) {
      return { granted: false, reason: "Resource not found" };
    }
    if (data.ownerId === context.userId || data.createdBy === context.userId) {
      return { granted: true, reason: "Owner access" };
    }
    if (data.groupIds && context.groups.some((gid) => data.groupIds.includes(gid))) {
      return { granted: true, reason: "Group member access" };
    }
    if (context.role === "manager" /* MANAGER */) {
      if (data.groupIds && context.managedGroups.some((gid) => data.groupIds.includes(gid))) {
        return { granted: true, reason: "Manager access to group data" };
      }
    }
    if (data.organizationId && data.organizationId === context.organizationId) {
    }
    return { granted: false, reason: "No access permission" };
  }
  /**
   * Apply access filters to a query based on user role
   * This is the core of data isolation
   */
  applyAccessFilters(collection, context, baseFilters = []) {
    if (context.role === "admin" /* ADMIN */) {
      return baseFilters;
    }
    const accessFilters = [...baseFilters];
    if (context.role === "manager" /* MANAGER */ && context.managedGroups.length > 0) {
      return [
        ...accessFilters,
        {
          field: "ownerId",
          operator: "==",
          value: context.userId
        }
      ];
    }
    return [
      ...accessFilters,
      {
        field: "ownerId",
        operator: "==",
        value: context.userId
      }
    ];
  }
  /**
   * Get all data accessible to user (federated query)
   * This handles the complex logic of fetching from multiple scopes
   */
  async getAccessibleData(collection, context, options = {}) {
    const db2 = getDatabase();
    if (context.role === "admin" /* ADMIN */) {
      return await db2.findMany(collection, {
        filters: options.filters,
        orderBy: options.orderBy,
        limit: options.limit
      });
    }
    const results = [];
    const ownData = await db2.findMany(collection, {
      filters: [
        ...options.filters || [],
        { field: "ownerId", operator: "==", value: context.userId }
      ],
      orderBy: options.orderBy,
      limit: options.limit
    });
    results.push(...ownData);
    if (context.role === "manager" /* MANAGER */ && options.includeGroupData) {
      for (const groupId of context.managedGroups) {
        const groupData = await db2.findMany(collection, {
          filters: [
            ...options.filters || [],
            { field: "groupIds", operator: "array-contains", value: groupId }
          ],
          orderBy: options.orderBy,
          limit: options.limit
        });
        results.push(...groupData);
      }
    }
    const uniqueResults = Array.from(
      new Map(results.map((item) => [item.id, item])).values()
    );
    return uniqueResults;
  }
  /**
   * Get group members that manager can see
   */
  async getManagedUsers(context) {
    if (context.role === "admin" /* ADMIN */) {
      const db2 = getDatabase();
      return await db2.findMany("users", {});
    }
    if (context.role === "manager" /* MANAGER */ && context.managedGroups.length > 0) {
      const db2 = getDatabase();
      const groups = await db2.findMany("groups", {
        filters: [
          {
            field: "id",
            operator: "in",
            value: context.managedGroups
          }
        ]
      });
      const memberIds = /* @__PURE__ */ new Set();
      groups.forEach((group) => {
        group.memberIds.forEach((id) => memberIds.add(id));
      });
      if (memberIds.size === 0) {
        return [];
      }
      const users = [];
      for (const userId of Array.from(memberIds)) {
        const user = await db2.findOne("users", userId);
        if (user) {
          users.push(user);
        }
      }
      return users;
    }
    return [];
  }
  /**
   * Log access audit trail
   */
  async logAccess(log) {
    const db2 = getDatabase();
    try {
      await db2.create("accessLogs", {
        ...log,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Failed to log access:", error);
    }
  }
  /**
   * Get access audit logs (admin only)
   */
  async getAccessLogs(context, filters = {}) {
    if (context.role !== "admin" /* ADMIN */) {
      throw new Error("Only admins can view access logs");
    }
    const db2 = getDatabase();
    const dbFilters = [];
    if (filters.userId) {
      dbFilters.push({
        field: "userId",
        operator: "==",
        value: filters.userId
      });
    }
    if (filters.resource) {
      dbFilters.push({
        field: "resource",
        operator: "==",
        value: filters.resource
      });
    }
    if (filters.startDate) {
      dbFilters.push({
        field: "timestamp",
        operator: ">=",
        value: filters.startDate
      });
    }
    if (filters.endDate) {
      dbFilters.push({
        field: "timestamp",
        operator: "<=",
        value: filters.endDate
      });
    }
    return await db2.findMany("accessLogs", {
      filters: dbFilters,
      orderBy: "timestamp",
      orderDirection: "desc",
      limit: filters.limit || 100
    });
  }
  /**
   * Share data with specific users or groups
   */
  async shareResource(context, resource, resourceId, shareWith) {
    const access = await this.canAccess(context, resource, resourceId, "write");
    if (!access.granted && context.role !== "admin" /* ADMIN */) {
      return {
        success: false,
        error: "You do not have permission to share this resource"
      };
    }
    const db2 = getDatabase();
    const data = await db2.findOne(resource, resourceId);
    if (!data) {
      return { success: false, error: "Resource not found" };
    }
    const updates = {};
    if (shareWith.userIds) {
      updates.sharedWithUsers = [
        ...data.sharedWithUsers || [],
        ...shareWith.userIds
      ];
    }
    if (shareWith.groupIds) {
      updates.groupIds = [
        ...data.groupIds || [],
        ...shareWith.groupIds
      ];
    }
    await db2.update(resource, resourceId, updates);
    await this.logAccess({
      userId: context.userId,
      action: "share",
      resource,
      resourceId,
      accessGranted: true,
      metadata: {
        userRole: context.role
      }
    });
    return { success: true };
  }
};
var accessControlService = new AccessControlService();

// src/services/group-management-service.ts
var GroupManagementService = class {
  /**
   * Create a new group
   */
  async createGroup(context, request) {
    if (context.role === "user" /* USER */) {
      return {
        success: false,
        error: "Only managers and admins can create groups"
      };
    }
    const db2 = getDatabase();
    try {
      const groupData = {
        name: request.name,
        description: request.description,
        managerId: request.managerId,
        memberIds: request.initialMembers || [],
        parentGroupId: request.parentGroupId,
        childGroupIds: [],
        organizationId: request.organizationId,
        department: request.department,
        region: request.region,
        tags: request.tags || [],
        settings: {
          allowMemberInvites: request.settings?.allowMemberInvites ?? false,
          autoApproveJoins: request.settings?.autoApproveJoins ?? false,
          visibility: request.settings?.visibility ?? "organization"
        },
        metadata: {
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          createdBy: context.userId,
          memberCount: (request.initialMembers || []).length
        }
      };
      const createdGroup = await db2.create("groups", groupData);
      const groupId = createdGroup.id;
      if (request.parentGroupId) {
        const parentGroup = await db2.findOne("groups", request.parentGroupId);
        if (parentGroup) {
          await db2.update("groups", request.parentGroupId, {
            childGroupIds: [...parentGroup.childGroupIds, groupId],
            "metadata.updatedAt": /* @__PURE__ */ new Date()
          });
        }
      }
      const allMembers = [request.managerId, ...request.initialMembers || []];
      for (const userId of allMembers) {
        await this.addMembershipRecord(groupId, userId, context.userId);
      }
      return { success: true, groupId };
    } catch (error) {
      console.error("Error creating group:", error);
      return {
        success: false,
        error: error.message || "Failed to create group"
      };
    }
  }
  /**
   * Get group by ID with access check
   */
  async getGroup(context, groupId) {
    const db2 = getDatabase();
    const group = await db2.findOne("groups", groupId);
    if (!group) {
      return null;
    }
    const hasAccess = await this.canAccessGroup(context, group);
    if (!hasAccess) {
      return null;
    }
    return group;
  }
  /**
   * Get all groups accessible to user
   */
  async getAccessibleGroups(context, filters) {
    const db2 = getDatabase();
    if (context.role === "admin" /* ADMIN */) {
      const dbFilters = [];
      if (filters?.organizationId) {
        dbFilters.push({
          field: "organizationId",
          operator: "==",
          value: filters.organizationId
        });
      }
      if (filters?.department) {
        dbFilters.push({
          field: "department",
          operator: "==",
          value: filters.department
        });
      }
      return await db2.findMany("groups", { filters: dbFilters });
    }
    const groups = [];
    if (context.role === "manager" /* MANAGER */ || filters?.managedOnly) {
      const managedGroups = await db2.findMany("groups", {
        filters: [
          {
            field: "managerId",
            operator: "==",
            value: context.userId
          }
        ]
      });
      groups.push(...managedGroups);
    }
    if (!filters?.managedOnly) {
      const memberGroups = await db2.findMany("groups", {
        filters: [
          {
            field: "memberIds",
            operator: "array-contains",
            value: context.userId
          }
        ]
      });
      groups.push(...memberGroups);
    }
    const uniqueGroups = Array.from(
      new Map(groups.map((g) => [g.id, g])).values()
    );
    return uniqueGroups;
  }
  /**
   * Add member to group
   */
  async addMember(context, groupId, userId) {
    const db2 = getDatabase();
    const group = await db2.findOne("groups", groupId);
    if (!group) {
      return { success: false, error: "Group not found" };
    }
    if (context.role !== "admin" /* ADMIN */ && group.managerId !== context.userId && !group.settings.allowMemberInvites) {
      return {
        success: false,
        error: "You do not have permission to add members to this group"
      };
    }
    if (group.memberIds.includes(userId)) {
      return { success: false, error: "User is already a member" };
    }
    try {
      await db2.update("groups", groupId, {
        memberIds: [...group.memberIds, userId],
        "metadata.memberCount": group.memberIds.length + 1,
        "metadata.updatedAt": /* @__PURE__ */ new Date()
      });
      await this.addMembershipRecord(groupId, userId, context.userId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to add member"
      };
    }
  }
  /**
   * Remove member from group
   */
  async removeMember(context, groupId, userId) {
    const db2 = getDatabase();
    const group = await db2.findOne("groups", groupId);
    if (!group) {
      return { success: false, error: "Group not found" };
    }
    if (context.role !== "admin" /* ADMIN */ && group.managerId !== context.userId && context.userId !== userId) {
      return {
        success: false,
        error: "You do not have permission to remove members from this group"
      };
    }
    if (userId === group.managerId) {
      return {
        success: false,
        error: "Cannot remove group manager. Transfer management first."
      };
    }
    try {
      const updatedMembers = group.memberIds.filter((id) => id !== userId);
      await db2.update("groups", groupId, {
        memberIds: updatedMembers,
        "metadata.memberCount": updatedMembers.length,
        "metadata.updatedAt": /* @__PURE__ */ new Date()
      });
      await this.removeMembershipRecord(groupId, userId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to remove member"
      };
    }
  }
  /**
   * Transfer group management
   */
  async transferManagement(context, groupId, newManagerId) {
    const db2 = getDatabase();
    const group = await db2.findOne("groups", groupId);
    if (!group) {
      return { success: false, error: "Group not found" };
    }
    if (context.role !== "admin" /* ADMIN */ && group.managerId !== context.userId) {
      return {
        success: false,
        error: "Only the current manager or admin can transfer management"
      };
    }
    if (!group.memberIds.includes(newManagerId)) {
      return {
        success: false,
        error: "New manager must be a member of the group"
      };
    }
    try {
      await db2.update("groups", groupId, {
        managerId: newManagerId,
        "metadata.updatedAt": /* @__PURE__ */ new Date()
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to transfer management"
      };
    }
  }
  /**
   * Get all members of a group
   */
  async getGroupMembers(context, groupId) {
    const group = await this.getGroup(context, groupId);
    if (!group) {
      return [];
    }
    const db2 = getDatabase();
    const members = [];
    for (const userId of group.memberIds) {
      const user = await db2.findOne("users", userId);
      if (user) {
        members.push(user);
      }
    }
    return members;
  }
  /**
   * Get hierarchical group tree
   */
  async getGroupHierarchy(context, rootGroupId) {
    const groups = await this.getAccessibleGroups(context);
    if (rootGroupId) {
      return this.filterGroupHierarchy(groups, rootGroupId);
    }
    return groups;
  }
  /**
   * Delete group
   */
  async deleteGroup(context, groupId, options = {}) {
    const db2 = getDatabase();
    const group = await db2.findOne("groups", groupId);
    if (!group) {
      return { success: false, error: "Group not found" };
    }
    if (context.role !== "admin" /* ADMIN */ && group.managerId !== context.userId) {
      return {
        success: false,
        error: "Only admin or group manager can delete the group"
      };
    }
    try {
      if (group.childGroupIds.length > 0) {
        if (options.deleteChildren) {
          for (const childId of group.childGroupIds) {
            await this.deleteGroup(context, childId, options);
          }
        } else {
          for (const childId of group.childGroupIds) {
            await db2.update("groups", childId, {
              parentGroupId: void 0,
              "metadata.updatedAt": /* @__PURE__ */ new Date()
            });
          }
        }
      }
      if (group.parentGroupId) {
        const parent = await db2.findOne("groups", group.parentGroupId);
        if (parent) {
          await db2.update("groups", group.parentGroupId, {
            childGroupIds: parent.childGroupIds.filter((id) => id !== groupId),
            "metadata.updatedAt": /* @__PURE__ */ new Date()
          });
        }
      }
      await db2.delete("groups", groupId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to delete group"
      };
    }
  }
  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================
  async canAccessGroup(context, group) {
    if (context.role === "admin" /* ADMIN */) {
      return true;
    }
    if (group.managerId === context.userId) {
      return true;
    }
    if (group.memberIds.includes(context.userId)) {
      return true;
    }
    if (group.settings.visibility === "public") {
      return true;
    }
    if (group.settings.visibility === "organization" && group.organizationId === context.organizationId) {
      return true;
    }
    return false;
  }
  async addMembershipRecord(groupId, userId, addedBy) {
    const db2 = getDatabase();
    await db2.create("groupMemberships", {
      groupId,
      userId,
      role: "member",
      joinedAt: /* @__PURE__ */ new Date(),
      addedBy
    });
  }
  async removeMembershipRecord(groupId, userId) {
    const db2 = getDatabase();
    const memberships = await db2.findMany("groupMemberships", {
      filters: [
        { field: "groupId", operator: "==", value: groupId },
        { field: "userId", operator: "==", value: userId }
      ]
    });
    for (const membership of memberships) {
      if (membership.id) {
        await db2.delete("groupMemberships", membership.id);
      }
    }
  }
  filterGroupHierarchy(groups, rootId) {
    const result = [];
    const visited = /* @__PURE__ */ new Set();
    const traverse = (groupId) => {
      if (visited.has(groupId)) return;
      visited.add(groupId);
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;
      result.push(group);
      for (const childId of group.childGroupIds) {
        traverse(childId);
      }
    };
    traverse(rootId);
    return result;
  }
};
var groupManagementService = new GroupManagementService();

// src/services/federated-data-service.ts
var FederatedDataService = class {
  // 5 minutes
  constructor() {
    this.cacheTTL = 5 * 60 * 1e3;
    this.accessControl = accessControlService;
    this.queryCache = /* @__PURE__ */ new Map();
  }
  /**
   * Query data with automatic access control
   * This is the main entry point for all data queries
   */
  async query(collection, context, options = {}) {
    const cacheKey = this.getCacheKey(collection, context, options);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    let data;
    let scope;
    if (context.role === "admin" /* ADMIN */) {
      data = await this.queryGlobal(collection, options);
      scope = "global";
    } else if (context.role === "manager" /* MANAGER */ && options.includeGroupData) {
      data = await this.queryGroupScope(collection, context, options);
      scope = "group";
    } else {
      data = await this.queryUserScope(collection, context, options);
      scope = "user";
    }
    const result = {
      data,
      total: data.length,
      hasMore: options.limit ? data.length === options.limit : false,
      scope
    };
    this.setCache(cacheKey, result);
    return result;
  }
  /**
   * Get single item with access check
   */
  async getOne(collection, id, context) {
    const db2 = getDatabase();
    const item = await db2.findOne(collection, id);
    if (!item) {
      return null;
    }
    const access = await this.accessControl.canAccess(
      context,
      collection,
      id,
      "read"
    );
    if (!access.granted) {
      await this.accessControl.logAccess({
        userId: context.userId,
        action: "read",
        resource: collection,
        resourceId: id,
        accessGranted: false,
        reason: access.reason,
        metadata: { userRole: context.role }
      });
      return null;
    }
    await this.accessControl.logAccess({
      userId: context.userId,
      action: "read",
      resource: collection,
      resourceId: id,
      accessGranted: true,
      metadata: { userRole: context.role }
    });
    return item;
  }
  /**
   * Create item with automatic ownership assignment
   */
  async create(collection, data, context, options = {}) {
    const db2 = getDatabase();
    try {
      const itemData = {
        ...data,
        ownerId: context.userId,
        createdBy: context.userId,
        groupIds: options.groupIds || context.groups || [],
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const createdItem = await db2.create(collection, itemData);
      const id = createdItem.id;
      await this.accessControl.logAccess({
        userId: context.userId,
        action: "write",
        resource: collection,
        resourceId: id,
        accessGranted: true,
        metadata: { userRole: context.role }
      });
      this.invalidateCache(collection);
      return { success: true, id };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create item"
      };
    }
  }
  /**
   * Update item with access check
   */
  async update(collection, id, updates, context) {
    const access = await this.accessControl.canAccess(
      context,
      collection,
      id,
      "write"
    );
    if (!access.granted) {
      await this.accessControl.logAccess({
        userId: context.userId,
        action: "write",
        resource: collection,
        resourceId: id,
        accessGranted: false,
        reason: access.reason,
        metadata: { userRole: context.role }
      });
      return {
        success: false,
        error: "You do not have permission to update this item"
      };
    }
    const db2 = getDatabase();
    try {
      await db2.update(collection, id, {
        ...updates,
        updatedAt: /* @__PURE__ */ new Date(),
        updatedBy: context.userId
      });
      await this.accessControl.logAccess({
        userId: context.userId,
        action: "write",
        resource: collection,
        resourceId: id,
        accessGranted: true,
        metadata: { userRole: context.role }
      });
      this.invalidateCache(collection);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update item"
      };
    }
  }
  /**
   * Delete item with access check
   */
  async delete(collection, id, context) {
    const access = await this.accessControl.canAccess(
      context,
      collection,
      id,
      "delete"
    );
    if (!access.granted) {
      await this.accessControl.logAccess({
        userId: context.userId,
        action: "delete",
        resource: collection,
        resourceId: id,
        accessGranted: false,
        reason: access.reason,
        metadata: { userRole: context.role }
      });
      return {
        success: false,
        error: "You do not have permission to delete this item"
      };
    }
    const db2 = getDatabase();
    try {
      await db2.delete(collection, id);
      await this.accessControl.logAccess({
        userId: context.userId,
        action: "delete",
        resource: collection,
        resourceId: id,
        accessGranted: true,
        metadata: { userRole: context.role }
      });
      this.invalidateCache(collection);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to delete item"
      };
    }
  }
  /**
   * Batch create with automatic ownership
   */
  async batchCreate(collection, items, context) {
    const results = {
      success: 0,
      failed: 0,
      ids: []
    };
    for (const item of items) {
      const result = await this.create(collection, item, context);
      if (result.success && result.id) {
        results.success++;
        results.ids.push(result.id);
      } else {
        results.failed++;
      }
    }
    return results;
  }
  /**
   * Get access statistics for user
   */
  async getAccessStats(context, collections) {
    const stats = {};
    for (const collection of collections) {
      const userScope = await this.queryUserScope(collection, context, {});
      const groupScope = context.role === "manager" /* MANAGER */ ? await this.queryGroupScope(collection, context, { includeGroupData: true }) : [];
      stats[collection] = {
        userDataCount: userScope.length,
        groupDataCount: groupScope.length - userScope.length,
        totalAccessible: groupScope.length || userScope.length,
        cacheHitRate: 0
        // TODO: implement cache metrics
      };
    }
    return stats;
  }
  /**
   * Search across collections with access control
   */
  async search(collections, searchTerm, context, options = {}) {
    const results = /* @__PURE__ */ new Map();
    for (const collection of collections) {
      const collectionResults = await this.query(collection, context, {
        ...options,
        // Add search filter if your database supports it
        filters: [
          ...options.filters || []
          // This would need to be adapted based on your search implementation
        ]
      });
      results.set(collection, collectionResults.data);
    }
    return results;
  }
  // ============================================================================
  // PRIVATE METHODS - SCOPE-SPECIFIC QUERIES
  // ============================================================================
  /**
   * Query global scope (admin only)
   */
  async queryGlobal(collection, options) {
    const db2 = getDatabase();
    return await db2.findMany(collection, {
      filters: options.filters,
      orderBy: options.orderBy,
      orderDirection: options.orderDirection,
      limit: options.limit
    });
  }
  /**
   * Query group scope (manager)
   */
  async queryGroupScope(collection, context, options) {
    return await this.accessControl.getAccessibleData(
      collection,
      context,
      {
        filters: options.filters,
        orderBy: options.orderBy,
        limit: options.limit,
        includeGroupData: true
      }
    );
  }
  /**
   * Query user scope (regular user)
   */
  async queryUserScope(collection, context, options) {
    const db2 = getDatabase();
    return await db2.findMany(collection, {
      filters: [
        ...options.filters || [],
        {
          field: "ownerId",
          operator: "==",
          value: context.userId
        }
      ],
      orderBy: options.orderBy,
      orderDirection: options.orderDirection,
      limit: options.limit
    });
  }
  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================
  getCacheKey(collection, context, options) {
    return `${collection}:${context.userId}:${context.role}:${JSON.stringify(options)}`;
  }
  getFromCache(key) {
    const cached = this.queryCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.queryCache.delete(key);
      return null;
    }
    return cached.data;
  }
  setCache(key, data) {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now()
    });
    if (this.queryCache.size > 1e3) {
      const firstKey = this.queryCache.keys().next().value;
      if (firstKey) {
        this.queryCache.delete(firstKey);
      }
    }
  }
  invalidateCache(collection) {
    if (collection) {
      for (const key of this.queryCache.keys()) {
        if (key.startsWith(collection + ":")) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }
  /**
   * Clear cache manually
   */
  clearCache() {
    this.queryCache.clear();
  }
  /**
   * Get cache statistics
   */
  getCacheStats() {
    let oldestTimestamp = Date.now();
    for (const entry of this.queryCache.values()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }
    return {
      size: this.queryCache.size,
      ttl: this.cacheTTL,
      oldestEntry: oldestTimestamp
    };
  }
};
var federatedDataService = new FederatedDataService();

// src/services/user-management-service.ts
var UserManagementService = class {
  constructor() {
    this.db = getDatabase();
  }
  // ============================================================================
  // USER PROFILE OPERATIONS
  // ============================================================================
  /**
   * Create a new user profile
   * NOTE: In most cases, user profiles are created automatically by authentication
   * service. This method is for admin operations or migrations.
   */
  async createUser(userData) {
    try {
      const userProfile = {
        email: userData.email,
        displayName: userData.displayName,
        photoURL: null,
        role: userData.role || "user",
        organizationId: userData.organizationId || null,
        department: userData.department || null,
        permissions: [],
        preferences: {
          theme: userData.theme || "light",
          notifications: userData.notifications ?? true,
          language: userData.language || "en"
        },
        metadata: {
          createdAt: /* @__PURE__ */ new Date(),
          lastActive: /* @__PURE__ */ new Date(),
          loginCount: 0,
          emailVerified: false,
          providerData: []
        },
        status: "active"
      };
      const createdUser = await this.db.create("users", userProfile);
      return {
        success: true,
        profile: createdUser
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        error: error.message || "Failed to create user"
      };
    }
  }
  /**
   * Update user profile
   */
  async updateUser(updates) {
    try {
      const userId = updates.uid;
      if (!userId) {
        throw new Error("User ID is required for update");
      }
      const { uid, ...updateData } = updates;
      await this.db.update("users", userId, {
        ...updateData,
        "metadata.lastModified": /* @__PURE__ */ new Date()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        error: error.message || "Failed to update user"
      };
    }
  }
  /**
   * Get user profile by UID
   */
  async getUserProfile(uid) {
    try {
      const user = await this.db.findOne("users", uid);
      return user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }
  /**
   * Get all users with optional filters
   */
  async getUsers(filters) {
    try {
      const queryFilters = [];
      if (filters?.role) {
        queryFilters.push({
          field: "role",
          operator: "==",
          value: filters.role
        });
      }
      if (filters?.status) {
        queryFilters.push({
          field: "status",
          operator: "==",
          value: filters.status
        });
      }
      if (filters?.organizationId) {
        queryFilters.push({
          field: "organizationId",
          operator: "==",
          value: filters.organizationId
        });
      }
      const users = await this.db.findMany("users", {
        filters: queryFilters,
        orderBy: "metadata.createdAt",
        orderDirection: "desc",
        limit: filters?.limit
      });
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }
  /**
   * Subscribe to users collection changes
   *
   * NOTE: Real-time subscriptions are not portable across all backends.
   * For self-hosted deployments, consider using:
   * - WebSocket connections for real-time updates
   * - Polling with SWR (recommended for most cases)
   * - Server-Sent Events (SSE)
   *
   * This method is deprecated for self-hosted mode.
   *
   * @deprecated Use polling or WebSocket-based updates instead
   */
  subscribeToUsers(callback, filters) {
    console.warn(
      "\u26A0\uFE0F  subscribeToUsers: Real-time subscriptions are Firebase-specific. Consider using polling or WebSocket for self-hosted deployments."
    );
    const intervalId = setInterval(async () => {
      const users = await this.getUsers(filters);
      callback(users);
    }, 5e3);
    return () => clearInterval(intervalId);
  }
  // ============================================================================
  // ACTIVITY TRACKING
  // ============================================================================
  /**
   * Get user activity logs
   */
  async getUserActivity(userId, limitCount = 50) {
    try {
      const queryFilters = [];
      if (userId) {
        queryFilters.push({
          field: "userId",
          operator: "==",
          value: userId
        });
      }
      const activities = await this.db.findMany("activityLogs", {
        filters: queryFilters,
        orderBy: "timestamp",
        orderDirection: "desc",
        limit: limitCount
      });
      return activities;
    } catch (error) {
      console.error("Error fetching activity:", error);
      return [];
    }
  }
  /**
   * Subscribe to activity logs
   *
   * @deprecated Use polling or WebSocket-based updates instead
   */
  subscribeToActivity(callback, userId, limitCount = 50) {
    console.warn(
      "\u26A0\uFE0F  subscribeToActivity: Real-time subscriptions are Firebase-specific. Consider using polling or WebSocket for self-hosted deployments."
    );
    const intervalId = setInterval(async () => {
      const activities = await this.getUserActivity(userId, limitCount);
      callback(activities);
    }, 5e3);
    return () => clearInterval(intervalId);
  }
  /**
   * Log user activity
   */
  async logActivity(activity) {
    try {
      await this.db.create("activityLogs", {
        ...activity,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  }
  // ============================================================================
  // USER SETTINGS
  // ============================================================================
  /**
   * Get user settings
   */
  async getUserSettings(userId) {
    try {
      const settings = await this.db.findOne("userSettings", userId);
      return settings;
    } catch (error) {
      console.error("Error fetching user settings:", error);
      return null;
    }
  }
  /**
   * Update user settings
   */
  async updateUserSettings(userId, settings) {
    try {
      await this.db.update("userSettings", userId, settings);
      return true;
    } catch (error) {
      console.error("Error updating user settings:", error);
      return false;
    }
  }
  /**
   * Create default user settings
   */
  async createDefaultUserSettings(userId) {
    const defaultSettings = {
      userId,
      dashboard: {
        layout: "grid",
        widgets: ["recent-activity", "notifications", "quick-actions"]
      },
      notifications: {
        email: true,
        browser: true,
        mobile: false,
        frequency: "realtime"
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 3600
        // 1 hour
      },
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.db.create("userSettings", defaultSettings);
    return defaultSettings;
  }
  // ============================================================================
  // ORGANIZATION MANAGEMENT
  // ============================================================================
  /**
   * Get organization members
   */
  async getOrganizationMembers(organizationId) {
    return this.getUsers({ organizationId });
  }
  /**
   * Add user to organization
   */
  async addUserToOrganization(userId, organizationId) {
    try {
      await this.db.update("users", userId, {
        organizationId,
        "metadata.lastModified": /* @__PURE__ */ new Date()
      });
      const org = await this.db.findOne("organizations", organizationId);
      if (org) {
        const currentMembers = org.members || [];
        if (!currentMembers.includes(userId)) {
          await this.db.update("organizations", organizationId, {
            members: [...currentMembers, userId],
            memberCount: currentMembers.length + 1,
            lastUpdated: /* @__PURE__ */ new Date()
          });
        }
      }
      return true;
    } catch (error) {
      console.error("Error adding user to organization:", error);
      return false;
    }
  }
  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(userId, organizationId) {
    try {
      await this.db.update("users", userId, {
        organizationId: null,
        "metadata.lastModified": /* @__PURE__ */ new Date()
      });
      const org = await this.db.findOne("organizations", organizationId);
      if (org) {
        const currentMembers = org.members || [];
        const updatedMembers = currentMembers.filter((id) => id !== userId);
        await this.db.update("organizations", organizationId, {
          members: updatedMembers,
          memberCount: updatedMembers.length,
          lastUpdated: /* @__PURE__ */ new Date()
        });
      }
      return true;
    } catch (error) {
      console.error("Error removing user from organization:", error);
      return false;
    }
  }
  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  /**
   * Get user notifications
   */
  async getUserNotifications(userId, limitCount = 20) {
    try {
      const notifications = await this.db.findMany("notifications", {
        filters: [{
          field: "userId",
          operator: "==",
          value: userId
        }],
        orderBy: "createdAt",
        orderDirection: "desc",
        limit: limitCount
      });
      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }
  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId) {
    try {
      await this.db.update("notifications", notificationId, {
        read: true,
        readAt: /* @__PURE__ */ new Date()
      });
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }
  /**
   * Create notification
   */
  async createNotification(notification) {
    try {
      await this.db.create("notifications", {
        ...notification,
        read: false,
        createdAt: /* @__PURE__ */ new Date()
      });
      return true;
    } catch (error) {
      console.error("Error creating notification:", error);
      return false;
    }
  }
  /**
   * Bulk mark notifications as read
   */
  async markAllNotificationsRead(userId) {
    try {
      const notifications = await this.getUserNotifications(userId, 100);
      const unreadNotifications = notifications.filter((n) => !n.read);
      for (const notification of unreadNotifications) {
        if (notification.id) {
          await this.markNotificationRead(notification.id);
        }
      }
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }
  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================
  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const users = await this.getUsers();
      const weekAgo = /* @__PURE__ */ new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.status === "active").length,
        newUsersThisWeek: users.filter(
          (u) => u.metadata.createdAt && new Date(u.metadata.createdAt) > weekAgo
        ).length,
        usersByRole: {},
        usersByStatus: {}
      };
      users.forEach((user) => {
        stats.usersByRole[user.role] = (stats.usersByRole[user.role] || 0) + 1;
        stats.usersByStatus[user.status] = (stats.usersByStatus[user.status] || 0) + 1;
      });
      return stats;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisWeek: 0,
        usersByRole: {},
        usersByStatus: {}
      };
    }
  }
  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================
  /**
   * Bulk update users
   */
  async bulkUpdateUsers(userIds, updates) {
    let success = 0;
    let failed = 0;
    for (const userId of userIds) {
      try {
        await this.db.update("users", userId, {
          ...updates,
          "metadata.lastModified": /* @__PURE__ */ new Date()
        });
        success++;
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        failed++;
      }
    }
    return { success, failed };
  }
  /**
   * Export users data
   */
  async exportUsers(filters) {
    return this.getUsers(filters);
  }
  /**
   * Delete user (admin only)
   * WARNING: This permanently deletes the user profile
   */
  async deleteUser(userId) {
    try {
      await this.db.delete("users", userId);
      await this.db.delete("userSettings", userId);
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
};
var userManagementService = new UserManagementService();

// src/services/user-management-api-client.ts
function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8080";
  }
  return "/api";
}
async function getAuthToken() {
  try {
    const { getAuth: getAuth3 } = await Promise.resolve().then(() => (init_auth_factory(), auth_factory_exports));
    const auth2 = getAuth3();
    const token = await auth2.getIdToken();
    return token;
  } catch (error) {
    console.warn("Failed to get auth token:", error);
    return null;
  }
}
async function apiRequest(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const token = await getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed: ${response.statusText}`);
  }
  return response.json();
}
var UserManagementApiClient = class {
  /**
   * Create a new user profile
   */
  async createUser(userData) {
    try {
      const result = await apiRequest("/api/users", {
        method: "POST",
        body: JSON.stringify(userData)
      });
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        error: error.message || "Failed to create user"
      };
    }
  }
  /**
   * Update user profile
   */
  async updateUser(userId, updates) {
    try {
      const result = await apiRequest(
        `/api/users/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify(updates)
        }
      );
      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        error: error.message || "Failed to update user"
      };
    }
  }
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    try {
      const result = await apiRequest(
        `/api/users/${userId}`
      );
      return result.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }
  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const result = await apiRequest("/api/users/me");
      return result.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  }
  /**
   * Get all users with optional filters
   */
  async getUsers(filters) {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.organizationId)
        params.append("organizationId", filters.organizationId);
      if (filters?.limit) params.append("limit", filters.limit.toString());
      const queryString = params.toString();
      const endpoint = `/api/users${queryString ? `?${queryString}` : ""}`;
      const result = await apiRequest(endpoint);
      return result.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }
  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      await apiRequest(`/api/users/${userId}`, {
        method: "DELETE"
      });
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  /**
   * Bulk update users
   */
  async bulkUpdateUsers(userIds, updates) {
    try {
      const result = await apiRequest(
        "/api/users/bulk/update",
        {
          method: "PUT",
          body: JSON.stringify({ userIds, updates })
        }
      );
      return {
        success: result.updated || 0,
        failed: userIds.length - (result.updated || 0)
      };
    } catch (error) {
      console.error("Error bulk updating users:", error);
      return {
        success: 0,
        failed: userIds.length
      };
    }
  }
  /**
   * Get organization members
   */
  async getOrganizationMembers(organizationId) {
    return this.getUsers({ organizationId });
  }
  /**
   * Export users data
   */
  async exportUsers(filters) {
    return this.getUsers(filters);
  }
};
var userManagementApiClient = new UserManagementApiClient();

// src/services/user-activity-service.ts
var STORAGE_KEYS = {
  NOTES: "user_notes",
  MEETINGS: "user_meetings",
  TIMELINE: "user_timeline",
  PREFERENCES: "user_preferences",
  ACTIVITY: "user_activity",
  ACTION_ITEMS: "action_items"
};
var UserActivityService = class {
  constructor() {
    this.currentUser = "current-user@company.com";
    this.sessionId = Date.now().toString();
  }
  // Notes Management
  async createNote(note) {
    const newNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      author: this.currentUser
    };
    const notes = this.getNotes();
    notes.push(newNote);
    this.saveNotes(notes);
    this.addTimelineEvent({
      type: "note",
      title: "Note Created",
      description: `Created note: ${note.title}`,
      associatedId: newNote.id,
      metadata: { noteType: note.type, tags: note.tags },
      priority: "low",
      category: note.type === "customer" ? "customer" : "administrative"
    });
    return newNote;
  }
  async updateNote(noteId, updates) {
    const notes = this.getNotes();
    const noteIndex = notes.findIndex((note) => note.id === noteId);
    if (noteIndex === -1) return null;
    const updatedNote = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    notes[noteIndex] = updatedNote;
    this.saveNotes(notes);
    return updatedNote;
  }
  getNotes(filters) {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
    let notes = stored ? JSON.parse(stored) : [];
    if (filters) {
      if (filters.type) {
        notes = notes.filter((note) => note.type === filters.type);
      }
      if (filters.tags?.length) {
        notes = notes.filter(
          (note) => filters.tags.some((tag) => note.tags.includes(tag))
        );
      }
      if (filters.pinned !== void 0) {
        notes = notes.filter((note) => note.pinned === filters.pinned);
      }
      if (filters.archived !== void 0) {
        notes = notes.filter((note) => note.archived === filters.archived);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        notes = notes.filter(
          (note) => note.title.toLowerCase().includes(searchLower) || note.content.toLowerCase().includes(searchLower)
        );
      }
    }
    return notes.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }
  async deleteNote(noteId) {
    const notes = this.getNotes();
    const filteredNotes = notes.filter((note) => note.id !== noteId);
    if (filteredNotes.length === notes.length) return false;
    this.saveNotes(filteredNotes);
    return true;
  }
  saveNotes(notes) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
  }
  // Meeting Management
  async scheduleMeeting(meeting) {
    const newMeeting = {
      ...meeting,
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: "scheduled",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const meetings = this.getMeetings();
    meetings.push(newMeeting);
    this.saveMeetings(meetings);
    this.addTimelineEvent({
      type: "meeting",
      title: "Meeting Scheduled",
      description: `${meeting.type} meeting: ${meeting.title}`,
      associatedId: newMeeting.id,
      metadata: { meetingType: meeting.type, participants: meeting.participants },
      priority: "medium",
      category: meeting.type === "customer" ? "customer" : "administrative"
    });
    return newMeeting;
  }
  async updateMeeting(meetingId, updates) {
    const meetings = this.getMeetings();
    const meetingIndex = meetings.findIndex((meeting) => meeting.id === meetingId);
    if (meetingIndex === -1) return null;
    const updatedMeeting = {
      ...meetings[meetingIndex],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    meetings[meetingIndex] = updatedMeeting;
    this.saveMeetings(meetings);
    return updatedMeeting;
  }
  getMeetings(filters) {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    let meetings = stored ? JSON.parse(stored) : [];
    if (filters) {
      if (filters.type) {
        meetings = meetings.filter((meeting) => meeting.type === filters.type);
      }
      if (filters.status) {
        meetings = meetings.filter((meeting) => meeting.status === filters.status);
      }
      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        meetings = meetings.filter((meeting) => {
          const meetingDate = new Date(meeting.scheduledAt);
          return meetingDate >= start && meetingDate <= end;
        });
      }
      if (filters.relatedPOV) {
        meetings = meetings.filter((meeting) => meeting.relatedPOV === filters.relatedPOV);
      }
    }
    return meetings.sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }
  saveMeetings(meetings) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    }
  }
  // Action Items Management
  async createActionItem(item) {
    const newItem = {
      ...item,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const items = this.getActionItems();
    items.push(newItem);
    this.saveActionItems(items);
    return newItem;
  }
  async updateActionItem(itemId, updates) {
    const items = this.getActionItems();
    const itemIndex = items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return null;
    const updatedItem = {
      ...items[itemIndex],
      ...updates,
      ...updates.status === "done" && { completedAt: (/* @__PURE__ */ new Date()).toISOString() }
    };
    items[itemIndex] = updatedItem;
    this.saveActionItems(items);
    if (updates.status === "done") {
      this.addTimelineEvent({
        type: "action-item",
        title: "Action Item Completed",
        description: `Completed: ${updatedItem.description}`,
        associatedId: itemId,
        metadata: { priority: updatedItem.priority, assignee: updatedItem.assignee },
        priority: "medium",
        category: "administrative"
      });
    }
    return updatedItem;
  }
  getActionItems(filters) {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ACTION_ITEMS);
    let items = stored ? JSON.parse(stored) : [];
    if (filters) {
      if (filters.status) {
        items = items.filter((item) => item.status === filters.status);
      }
      if (filters.assignee) {
        items = items.filter((item) => item.assignee === filters.assignee);
      }
      if (filters.priority) {
        items = items.filter((item) => item.priority === filters.priority);
      }
      if (filters.overdue) {
        const now = /* @__PURE__ */ new Date();
        items = items.filter(
          (item) => item.dueDate && new Date(item.dueDate) < now && item.status !== "done"
        );
      }
    }
    return items.sort((a, b) => {
      const statusOrder = { "todo": 0, "in-progress": 1, "blocked": 2, "done": 3 };
      const priorityOrder = { "urgent": 0, "high": 1, "medium": 2, "low": 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }
  saveActionItems(items) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACTION_ITEMS, JSON.stringify(items));
    }
  }
  // Timeline Management
  addTimelineEvent(event) {
    const newEvent = {
      ...event,
      id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      author: this.currentUser
    };
    const timeline = this.getTimelineEvents();
    timeline.push(newEvent);
    this.saveTimeline(timeline);
    return newEvent;
  }
  getTimelineEvents(filters) {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TIMELINE);
    let events = stored ? JSON.parse(stored) : [];
    if (filters) {
      if (filters.type) {
        events = events.filter((event) => event.type === filters.type);
      }
      if (filters.category) {
        events = events.filter((event) => event.category === filters.category);
      }
      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        events = events.filter((event) => {
          const eventDate = new Date(event.timestamp);
          return eventDate >= start && eventDate <= end;
        });
      }
      if (filters.associatedId) {
        events = events.filter((event) => event.associatedId === filters.associatedId);
      }
      if (filters.priority) {
        events = events.filter((event) => event.priority === filters.priority);
      }
    }
    return events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  saveTimeline(events) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(events));
    }
  }
  // User Preferences
  async updatePreferences(updates) {
    const currentPrefs = this.getPreferences();
    const updatedPrefs = {
      ...currentPrefs,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updatedPrefs));
    }
    return updatedPrefs;
  }
  getPreferences() {
    if (typeof window === "undefined") {
      return this.getDefaultPreferences();
    }
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (stored) {
      return JSON.parse(stored);
    }
    const defaultPrefs = this.getDefaultPreferences();
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(defaultPrefs));
    return defaultPrefs;
  }
  getDefaultPreferences() {
    return {
      userId: this.currentUser,
      theme: "dark",
      notifications: {
        email: true,
        inApp: true,
        meetingReminders: true,
        povUpdates: true,
        actionItemDues: true
      },
      defaultView: "dashboard",
      timeZone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
      dateFormat: "MM/dd/yyyy",
      autoSaveInterval: 3e4,
      // 30 seconds
      favoriteCommands: [],
      customTags: [],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // Activity Tracking
  trackActivity(action, component, metadata = {}) {
    if (typeof window === "undefined") return;
    const activity = {
      userId: this.currentUser,
      sessionId: this.sessionId,
      action,
      component,
      metadata,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    const activities = this.getActivities();
    activities.push(activity);
    if (activities.length > 1e3) {
      activities.splice(0, activities.length - 1e3);
    }
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activities));
  }
  getActivities(limit = 100) {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    const activities = stored ? JSON.parse(stored) : [];
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  }
  // Analytics and Insights
  getInsights() {
    const notes = this.getNotes();
    const meetings = this.getMeetings();
    const actionItems = this.getActionItems();
    const activities = this.getActivities();
    const weekAgo = /* @__PURE__ */ new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivities = activities.filter(
      (activity) => new Date(activity.timestamp) > weekAgo
    );
    const pendingItems = actionItems.filter(
      (item) => item.status === "todo" || item.status === "in-progress"
    );
    const completedItems = actionItems.filter((item) => item.status === "done");
    const productivityScore = actionItems.length > 0 ? Math.round(completedItems.length / actionItems.length * 100) : 100;
    const trendsLastWeek = {};
    recentActivities.forEach((activity) => {
      trendsLastWeek[activity.action] = (trendsLastWeek[activity.action] || 0) + 1;
    });
    return {
      totalNotes: notes.length,
      totalMeetings: meetings.length,
      pendingActionItems: pendingItems.length,
      recentActivity: recentActivities.length,
      productivityScore,
      trendsLastWeek
    };
  }
  // Data Management
  exportUserData() {
    return {
      notes: this.getNotes(),
      meetings: this.getMeetings(),
      timeline: this.getTimelineEvents(),
      actionItems: this.getActionItems(),
      preferences: this.getPreferences(),
      exportedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async importUserData(data) {
    try {
      if (data.notes) this.saveNotes(data.notes);
      if (data.meetings) this.saveMeetings(data.meetings);
      if (data.timeline) this.saveTimeline(data.timeline);
      if (data.actionItems) this.saveActionItems(data.actionItems);
      if (data.preferences && typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
      }
      return true;
    } catch (error) {
      console.error("Failed to import user data:", error);
      return false;
    }
  }
  clearAllData() {
    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    }
  }
};
var userActivityService = new UserActivityService();

// src/services/rbac-middleware.ts
var ROLE_PERMISSIONS2 = {
  admin: {
    canViewAllUsers: true,
    canViewAllPOVs: true,
    canViewAllTRRs: true,
    canModifySystemSettings: true,
    allowedCustomers: "all",
    allowedProjects: "all"
  },
  manager: {
    canViewAllUsers: false,
    // Only their team
    canViewAllPOVs: true,
    canViewAllTRRs: true,
    canModifySystemSettings: false,
    allowedCustomers: "all",
    allowedProjects: "all"
  },
  senior_dc: {
    canViewAllUsers: false,
    canViewAllPOVs: false,
    // Only assigned POVs
    canViewAllTRRs: false,
    // Only their TRRs
    canModifySystemSettings: false,
    allowedCustomers: ["assigned"],
    allowedProjects: ["assigned"]
  },
  dc: {
    canViewAllUsers: false,
    canViewAllPOVs: false,
    canViewAllTRRs: false,
    canModifySystemSettings: false,
    allowedCustomers: ["assigned"],
    allowedProjects: ["assigned"]
  },
  analyst: {
    canViewAllUsers: false,
    canViewAllPOVs: false,
    canViewAllTRRs: false,
    canModifySystemSettings: false,
    allowedCustomers: ["assigned"],
    allowedProjects: ["assigned"]
  }
};
var RBACMiddleware = class {
  /**
   * Apply role-based filtering to database queries
   */
  static filterQuery(context, baseQuery = {}) {
    const permissions = ROLE_PERMISSIONS2[context.userRole];
    if (!permissions) {
      throw new Error(`Unknown role: ${context.userRole}`);
    }
    if (permissions.canViewAllPOVs && permissions.canViewAllTRRs) {
      return baseQuery;
    }
    const userFilter = {
      OR: [
        { assignedUserId: context.userId },
        { createdBy: context.userId },
        { ownerId: context.userId },
        // Include team assignments if user is part of a team
        ...context.userTeam ? [{ teamId: context.userTeam }] : [],
        // Include project assignments
        ...context.assignedProjects?.length ? [
          { projectId: { in: context.assignedProjects } }
        ] : [],
        // Include customer assignments
        ...context.assignedCustomers?.length ? [
          { customerId: { in: context.assignedCustomers } }
        ] : []
      ]
    };
    return {
      ...baseQuery,
      where: {
        ...baseQuery.where,
        AND: [
          baseQuery.where || {},
          userFilter
        ]
      }
    };
  }
  /**
   * Check if user has permission to perform an action on a resource
   */
  static canAccessResource(userRole, resource, action, context) {
    const permissions = ROLE_PERMISSIONS2[userRole];
    if (!permissions) {
      return false;
    }
    const resourcePermissions = {
      users: {
        read: permissions.canViewAllUsers,
        create: userRole === "admin",
        update: userRole === "admin",
        delete: userRole === "admin"
      },
      povs: {
        read: permissions.canViewAllPOVs || this.isOwnerOrAssigned(context),
        create: ["admin", "manager", "senior_dc", "dc"].includes(userRole),
        update: permissions.canViewAllPOVs || this.isOwnerOrAssigned(context),
        delete: ["admin", "manager"].includes(userRole)
      },
      trrs: {
        read: permissions.canViewAllTRRs || this.isOwnerOrAssigned(context),
        create: ["admin", "manager", "senior_dc", "dc"].includes(userRole),
        update: permissions.canViewAllTRRs || this.isOwnerOrAssigned(context),
        delete: ["admin", "manager"].includes(userRole)
      },
      scenarios: {
        read: ["admin", "manager", "senior_dc", "dc"].includes(userRole),
        create: ["admin", "manager", "senior_dc", "dc"].includes(userRole),
        update: ["admin", "manager", "senior_dc", "dc"].includes(userRole),
        delete: ["admin", "manager"].includes(userRole)
      },
      system_settings: {
        read: permissions.canModifySystemSettings,
        create: permissions.canModifySystemSettings,
        update: permissions.canModifySystemSettings,
        delete: permissions.canModifySystemSettings
      }
    };
    const resourcePerms = resourcePermissions[resource];
    if (!resourcePerms) {
      return false;
    }
    return resourcePerms[action] || false;
  }
  /**
   * Filter data based on user's role and assignments
   */
  static filterData(data, context) {
    const permissions = ROLE_PERMISSIONS2[context.userRole];
    if (permissions.canViewAllPOVs && permissions.canViewAllTRRs) {
      return data;
    }
    return data.filter((item) => {
      return item.assignedUserId === context.userId || item.createdBy === context.userId || item.ownerId === context.userId || // Add additional filtering logic as needed
      this.isUserAssignedToItem(item, context);
    });
  }
  /**
   * Apply RBAC filtering to command execution
   */
  static filterCommand(command, userRole, userId) {
    const permissions = ROLE_PERMISSIONS2[userRole];
    if (!permissions) {
      throw new Error(`Unknown role: ${userRole}`);
    }
    if (!permissions.canViewAllPOVs) {
      if (command.includes("pov list")) {
        command += ` --user-filter ${userId}`;
      }
      if (command.includes("pov report")) {
        command += ` --assigned-only`;
      }
    }
    if (!permissions.canViewAllTRRs) {
      if (command.includes("trr list")) {
        command += ` --user-scope ${userId}`;
      }
      if (command.includes("trr export")) {
        command += ` --user-data-only`;
      }
    }
    if (userRole !== "admin") {
      const blockedCommands = ["system delete", "user delete", "admin"];
      for (const blocked of blockedCommands) {
        if (command.toLowerCase().includes(blocked)) {
          throw new Error(`Command '${blocked}' not allowed for role '${userRole}'`);
        }
      }
    }
    return command;
  }
  /**
   * Get user's effective permissions summary
   */
  static getUserPermissions(userRole) {
    const permissions = ROLE_PERMISSIONS2[userRole];
    if (!permissions) {
      return { canView: [], canCreate: [], canUpdate: [], canDelete: [] };
    }
    const resources = ["povs", "trrs", "scenarios", "users", "system_settings"];
    return {
      canView: resources.filter(
        (resource) => this.canAccessResource(userRole, resource, "read")
      ),
      canCreate: resources.filter(
        (resource) => this.canAccessResource(userRole, resource, "create")
      ),
      canUpdate: resources.filter(
        (resource) => this.canAccessResource(userRole, resource, "update")
      ),
      canDelete: resources.filter(
        (resource) => this.canAccessResource(userRole, resource, "delete")
      )
    };
  }
  /**
   * Audit log for RBAC events
   */
  static logRBACEvent(event) {
    const logEntry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...event
    };
    console.log("[RBAC Audit]", logEntry);
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("rbac_audit_log") || "[]");
      existing.push(logEntry);
      const trimmed = existing.slice(-1e3);
      localStorage.setItem("rbac_audit_log", JSON.stringify(trimmed));
    }
  }
  static isOwnerOrAssigned(context) {
    if (!context || !context.userId) return false;
    return context.ownerId === context.userId;
  }
  static isUserAssignedToItem(item, context) {
    if (context.assignedProjects?.includes(item.projectId)) {
      return true;
    }
    if (context.assignedCustomers?.includes(item.customerId)) {
      return true;
    }
    return false;
  }
};

// src/services/dc-context-store.ts
var DCContextStore = class _DCContextStore {
  constructor() {
    this.data = {
      currentUser: null,
      customerEngagements: /* @__PURE__ */ new Map(),
      activePOVs: /* @__PURE__ */ new Map(),
      trrRecords: /* @__PURE__ */ new Map(),
      workflowHistory: []
    };
    this.loadFromStorage();
  }
  static getInstance() {
    if (!_DCContextStore.instance) {
      _DCContextStore.instance = new _DCContextStore();
    }
    return _DCContextStore.instance;
  }
  // Load data from localStorage/sessionStorage
  loadFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("dc_context_store");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data.currentUser = parsed.currentUser;
        this.data.customerEngagements = new Map(parsed.customerEngagements || []);
        this.data.activePOVs = new Map(parsed.activePOVs || []);
        this.data.trrRecords = new Map(parsed.trrRecords || []);
        this.data.workflowHistory = parsed.workflowHistory || [];
      }
    } catch (error) {
      console.warn("Failed to load DC context from storage:", error);
    }
  }
  // Save data to localStorage
  saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      const toSave = {
        currentUser: this.data.currentUser,
        customerEngagements: Array.from(this.data.customerEngagements.entries()),
        activePOVs: Array.from(this.data.activePOVs.entries()),
        trrRecords: Array.from(this.data.trrRecords.entries()),
        workflowHistory: this.data.workflowHistory.slice(-100)
        // Keep last 100 entries
      };
      localStorage.setItem("dc_context_store", JSON.stringify(toSave));
    } catch (error) {
      console.warn("Failed to save DC context to storage:", error);
    }
  }
  // User Management
  setCurrentUser(user) {
    this.data.currentUser = user;
    this.saveToStorage();
  }
  getCurrentUser() {
    return this.data.currentUser;
  }
  // Customer Engagement Management
  addCustomerEngagement(engagement) {
    this.data.customerEngagements.set(engagement.id, engagement);
    this.saveToStorage();
  }
  replaceCustomerEngagements(engagements) {
    this.data.customerEngagements = new Map(engagements.map((eng) => [eng.id, eng]));
    this.saveToStorage();
  }
  getCustomerEngagement(id) {
    return this.data.customerEngagements.get(id);
  }
  getAllCustomerEngagements() {
    return Array.from(this.data.customerEngagements.values());
  }
  updateCustomerEngagement(id, updates) {
    const existing = this.data.customerEngagements.get(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      this.data.customerEngagements.set(id, updated);
      this.saveToStorage();
    }
  }
  // POV Management
  addActivePOV(pov) {
    this.data.activePOVs.set(pov.id, pov);
    this.saveToStorage();
  }
  replaceActivePOVs(povs) {
    this.data.activePOVs = new Map(povs.map((pov) => [pov.id, pov]));
    this.saveToStorage();
  }
  getActivePOV(id) {
    return this.data.activePOVs.get(id);
  }
  getAllActivePOVs() {
    return Array.from(this.data.activePOVs.values());
  }
  updateActivePOV(id, updates) {
    const existing = this.data.activePOVs.get(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      this.data.activePOVs.set(id, updated);
      this.saveToStorage();
    }
  }
  recordPOVInsight(id, insight) {
    const existing = this.data.activePOVs.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      aiInsights: [...existing.aiInsights || [], insight],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.activePOVs.set(id, updated);
    this.saveToStorage();
    return updated;
  }
  // TRR Management
  addTRRRecord(trr) {
    this.data.trrRecords.set(trr.id, trr);
    this.saveToStorage();
  }
  replaceTRRRecords(trrs) {
    this.data.trrRecords = new Map(trrs.map((trr) => [trr.id, trr]));
    this.saveToStorage();
  }
  getTRRRecord(id) {
    return this.data.trrRecords.get(id);
  }
  getAllTRRRecords() {
    return Array.from(this.data.trrRecords.values());
  }
  getTRRsByCustomer(customerId) {
    return this.getAllTRRRecords().filter((trr) => trr.customerId === customerId);
  }
  getTRRsByPOV(povId) {
    return this.getAllTRRRecords().filter((trr) => trr.povId === povId);
  }
  updateTRRRecord(id, updates) {
    const existing = this.data.trrRecords.get(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      this.data.trrRecords.set(id, updated);
      this.saveToStorage();
    }
  }
  recordTRRInsight(id, insight) {
    const existing = this.data.trrRecords.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      aiInsights: [...existing.aiInsights || [], insight],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.trrRecords.set(id, updated);
    this.saveToStorage();
    return updated;
  }
  // Workflow History
  addWorkflowHistory(entry) {
    const historyEntry = {
      ...entry,
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.workflowHistory.push(historyEntry);
    this.saveToStorage();
  }
  getWorkflowHistory(userId, workflowType) {
    let history = [...this.data.workflowHistory];
    if (userId) {
      history = history.filter((h) => h.userId === userId);
    }
    if (workflowType) {
      history = history.filter((h) => h.workflowType === workflowType);
    }
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  // Context Analysis
  getCurrentWorkflowContext() {
    const activeCustomers = this.getAllCustomerEngagements().filter(
      (c) => this.getAllActivePOVs().some((p) => p.customerId === c.id && p.status !== "completed")
    ).length;
    const activePOVs = this.getAllActivePOVs().filter(
      (p) => p.status === "executing" || p.status === "planning"
    ).length;
    const pendingTRRs = this.getAllTRRRecords().filter(
      (t) => t.status === "pending" || t.status === "in-review"
    ).length;
    const recentActivity = this.getWorkflowHistory().slice(0, 10);
    const upcomingMilestones = [];
    this.getAllActivePOVs().forEach((pov) => {
      pov.timeline.milestones.forEach((milestone) => {
        if (!milestone.actual && new Date(milestone.planned) > /* @__PURE__ */ new Date()) {
          upcomingMilestones.push({
            name: `${pov.name}: ${milestone.name}`,
            date: milestone.planned,
            type: "pov_milestone"
          });
        }
      });
    });
    this.getAllTRRRecords().forEach((trr) => {
      if (trr.status !== "validated" && new Date(trr.timeline.targetValidation) > /* @__PURE__ */ new Date()) {
        upcomingMilestones.push({
          name: `TRR: ${trr.title}`,
          date: trr.timeline.targetValidation,
          type: "trr_deadline"
        });
      }
    });
    upcomingMilestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      activeCustomers,
      activePOVs,
      pendingTRRs,
      recentActivity,
      upcomingMilestones: upcomingMilestones.slice(0, 10)
    };
  }
  // Onboarding starter data generation scoped to authenticated user
  seedStarterDataForUser(user) {
    if (!user?.id) {
      throw new Error("Valid user profile required to seed starter data");
    }
    const existingRecords = Array.from(this.data.trrRecords.values()).some((record) => record.ownerId === user.id);
    if (existingRecords) {
      return { seeded: false };
    }
    const customerId = `cust_${user.id}_starter`;
    const povId = `pov_${user.id}_starter`;
    const sampleCustomer = {
      id: customerId,
      ownerId: user.id,
      name: "Starter Engagement",
      industry: "Technology",
      size: "enterprise",
      maturityLevel: "intermediate",
      primaryConcerns: ["Cloud Security", "Insider Threats", "Compliance"],
      techStack: ["AWS", "Kubernetes", "Splunk", "ServiceNow"],
      stakeholders: [
        { name: "Executive Sponsor", role: "CISO", influence: "high", technical: true },
        { name: "Security Manager", role: "Security Manager", influence: "medium", technical: true }
      ],
      timeline: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString(),
        targetDecision: new Date(Date.now() + 21 * 24 * 60 * 60 * 1e3).toISOString(),
        keyMilestones: [
          { name: "Initial Assessment", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString(), status: "complete" },
          { name: "POV Kickoff", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(), status: "complete" },
          { name: "Executive Briefing", date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3).toISOString(), status: "pending" }
        ]
      },
      budget: {
        range: "$250K-$500K",
        decisionMaker: "Executive Sponsor",
        approvalProcess: "Executive Steering Committee"
      },
      competition: ["CrowdStrike", "Microsoft Sentinel"],
      notes: [
        "Starter engagement generated for onboarding",
        "Customize this record with real customer information"
      ],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const samplePOV = {
      id: povId,
      ownerId: user.id,
      customerId,
      name: "Starter XSIAM POV",
      status: "planning",
      scenarios: [
        { id: `sc_${user.id}_001`, name: "Cloud Posture Assessment", type: "cloud-posture", status: "planned" },
        { id: `sc_${user.id}_002`, name: "Insider Threat Detection", type: "insider-threat", status: "planned" }
      ],
      objectives: [
        "Demonstrate detection and response capabilities",
        "Integrate with existing cloud infrastructure"
      ],
      successMetrics: [
        "Detect 90% of simulated attacks",
        "Automate 70% of tier-1 responses"
      ],
      timeline: {
        planned: (/* @__PURE__ */ new Date()).toISOString(),
        actual: void 0,
        milestones: [
          { name: "Environment Setup", planned: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3).toISOString() },
          { name: "Scenario Execution", planned: new Date(Date.now() + 10 * 24 * 60 * 60 * 1e3).toISOString() }
        ]
      },
      resources: {
        dcHours: 32,
        seHours: 16,
        infrastructure: ["XSIAM Tenant", "Sample Data Sets"]
      },
      outcomes: {
        technicalWins: [],
        businessImpact: [],
        lessonsLearned: []
      },
      nextSteps: ["Complete ransomware scenario", "Prepare executive presentation", "Draft technical proposal"],
      aiInsights: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const sampleTRRs = [
      {
        id: `trr_${user.id}_001`,
        ownerId: user.id,
        customerId,
        povId,
        title: "CloudTrail Integration Validation",
        category: "integration",
        priority: "high",
        status: "draft",
        description: "Validate ingestion and parsing of AWS CloudTrail logs into XSIAM.",
        acceptanceCriteria: [
          "Logs ingested within 5 minutes",
          "Standard fields parsed correctly",
          "Custom queries execute successfully"
        ],
        validationMethod: "Demonstration with sample datasets",
        validationEvidence: [],
        assignedTo: user.name,
        reviewers: ["Security Manager"],
        timeline: {
          created: (/* @__PURE__ */ new Date()).toISOString(),
          targetValidation: new Date(Date.now() + 14 * 24 * 60 * 60 * 1e3).toISOString(),
          actualValidation: void 0
        },
        dependencies: ["AWS account access", "CloudTrail configuration"],
        riskLevel: "medium",
        businessImpact: "Critical for establishing cloud visibility",
        customerStakeholder: "Executive Sponsor",
        notes: ["Starter TRR created for onboarding"],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.setCurrentUser(user);
    this.addCustomerEngagement(sampleCustomer);
    this.addActivePOV(samplePOV);
    sampleTRRs.forEach((trr) => this.addTRRRecord(trr));
    return {
      seeded: true,
      customer: sampleCustomer,
      pov: samplePOV,
      trrs: sampleTRRs
    };
  }
};
var dcContextStore = DCContextStore.getInstance();

// src/adapters/firebase-storage.adapter.ts
var import_storage2 = require("firebase/storage");
var FirebaseStorageAdapter = class {
  constructor(storage2) {
    this.storage = null;
    this.initialized = false;
    if (storage2) {
      this.storage = storage2;
      this.initialized = true;
    }
  }
  async initialize() {
    if (this.initialized) return;
    try {
      const { storage: storage2 } = await Promise.resolve().then(() => (init_firebase_config(), firebase_config_exports));
      if (storage2) {
        this.storage = storage2;
        this.initialized = true;
      } else {
        throw new Error("Firebase storage not available");
      }
    } catch (error) {
      throw new Error(`Failed to initialize Firebase storage: ${error}`);
    }
  }
  isInitialized() {
    return this.initialized && this.storage !== null;
  }
  ensureInitialized() {
    if (!this.storage) {
      throw new Error("Firebase storage not initialized");
    }
  }
  async upload(path, data, options) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = (0, import_storage2.ref)(this.storage, path);
    const metadata = {
      contentType: options?.contentType,
      customMetadata: options?.customMetadata,
      cacheControl: options?.cacheControl
    };
    const uploadResult = await (0, import_storage2.uploadBytes)(storageRef, data, metadata);
    const downloadURL = await (0, import_storage2.getDownloadURL)(uploadResult.ref);
    return this.mapToStorageFile(uploadResult.metadata, downloadURL);
  }
  async getDownloadURL(path) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = (0, import_storage2.ref)(this.storage, path);
    return await (0, import_storage2.getDownloadURL)(storageRef);
  }
  async download(path) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = (0, import_storage2.ref)(this.storage, path);
    const arrayBuffer = await (0, import_storage2.getBytes)(storageRef);
    return new Uint8Array(arrayBuffer);
  }
  async delete(path) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = (0, import_storage2.ref)(this.storage, path);
    await (0, import_storage2.deleteObject)(storageRef);
  }
  async list(path, options) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = (0, import_storage2.ref)(this.storage, path);
    const listResult = await (0, import_storage2.listAll)(storageRef);
    const items = await Promise.all(
      listResult.items.map(async (item) => {
        const metadata = await (0, import_storage2.getMetadata)(item);
        const downloadURL = await (0, import_storage2.getDownloadURL)(item);
        return this.mapToStorageFile(metadata, downloadURL);
      })
    );
    return {
      items,
      nextPageToken: void 0
    };
  }
  async getMetadata(path) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = (0, import_storage2.ref)(this.storage, path);
    const metadata = await (0, import_storage2.getMetadata)(storageRef);
    const downloadURL = await (0, import_storage2.getDownloadURL)(storageRef);
    return this.mapToStorageFile(metadata, downloadURL);
  }
  async updateMetadata(path, metadata) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = (0, import_storage2.ref)(this.storage, path);
    const newMetadata = {
      contentType: metadata.contentType,
      customMetadata: metadata.metadata,
      cacheControl: metadata.metadata?.cacheControl
    };
    const updatedMetadata = await (0, import_storage2.updateMetadata)(storageRef, newMetadata);
    const downloadURL = await (0, import_storage2.getDownloadURL)(storageRef);
    return this.mapToStorageFile(updatedMetadata, downloadURL);
  }
  async exists(path) {
    try {
      await this.getMetadata(path);
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Map Firebase Storage metadata to StorageFile
   */
  mapToStorageFile(metadata, downloadURL) {
    return {
      name: metadata.name,
      fullPath: metadata.fullPath,
      size: metadata.size,
      contentType: metadata.contentType || void 0,
      bucket: metadata.bucket,
      metadata: {
        ...metadata.customMetadata,
        downloadURL
      },
      timeCreated: new Date(metadata.timeCreated),
      updated: new Date(metadata.updated)
    };
  }
};
var firebaseStorageAdapter = null;
function getFirebaseStorageAdapter() {
  if (!firebaseStorageAdapter) {
    firebaseStorageAdapter = new FirebaseStorageAdapter();
  }
  return firebaseStorageAdapter;
}

// src/adapters/minio-storage.adapter.ts
var MinIOStorageAdapter = class {
  constructor(config) {
    this.s3Client = null;
    this.initialized = false;
    this.endpoint = config?.endpoint || process.env.MINIO_ENDPOINT || "http://localhost:9000";
    this.accessKey = config?.accessKey || process.env.MINIO_ACCESS_KEY || "minioadmin";
    this.secretKey = config?.secretKey || process.env.MINIO_SECRET_KEY || "minioadmin";
    this.bucket = config?.bucket || process.env.MINIO_BUCKET || "cortex-storage";
  }
  async initialize() {
    if (this.initialized) return;
    try {
      const { S3Client } = await import("@aws-sdk/client-s3");
      this.s3Client = new S3Client({
        endpoint: this.endpoint,
        region: "us-east-1",
        // MinIO doesn't use regions, but SDK requires it
        credentials: {
          accessKeyId: this.accessKey,
          secretAccessKey: this.secretKey
        },
        forcePathStyle: true
        // Required for MinIO
      });
      await this.ensureBucket();
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize MinIO storage: ${error}`);
    }
  }
  isInitialized() {
    return this.initialized && this.s3Client !== null;
  }
  ensureInitialized() {
    if (!this.s3Client) {
      throw new Error("MinIO storage not initialized");
    }
  }
  /**
   * Ensure the bucket exists, create if it doesn't
   */
  async ensureBucket() {
    try {
      const { HeadBucketCommand, CreateBucketCommand } = await import("@aws-sdk/client-s3");
      try {
        await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      } catch (error) {
        if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
          console.log(`Created MinIO bucket: ${this.bucket}`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error ensuring MinIO bucket exists:", error);
      throw error;
    }
  }
  async upload(path, data, options) {
    await this.initialize();
    this.ensureInitialized();
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    let buffer;
    if (data instanceof ArrayBuffer) {
      buffer = Buffer.from(data);
    } else if (data instanceof Uint8Array) {
      buffer = Buffer.from(data);
    } else if (data instanceof Blob) {
      buffer = Buffer.from(await data.arrayBuffer());
    } else {
      buffer = Buffer.from(data);
    }
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: path,
      Body: buffer,
      ContentType: options?.contentType,
      Metadata: options?.customMetadata,
      CacheControl: options?.cacheControl
    });
    await this.s3Client.send(command);
    return {
      name: path.split("/").pop() || path,
      fullPath: path,
      size: buffer.length,
      contentType: options?.contentType,
      bucket: this.bucket,
      metadata: options?.customMetadata,
      timeCreated: /* @__PURE__ */ new Date(),
      updated: /* @__PURE__ */ new Date()
    };
  }
  async getDownloadURL(path) {
    await this.initialize();
    this.ensureInitialized();
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path
    });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return url;
  }
  async download(path) {
    await this.initialize();
    this.ensureInitialized();
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path
    });
    const response = await this.s3Client.send(command);
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
  async delete(path) {
    await this.initialize();
    this.ensureInitialized();
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: path
    });
    await this.s3Client.send(command);
  }
  async list(path, options) {
    await this.initialize();
    this.ensureInitialized();
    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: path,
      MaxKeys: options?.maxResults,
      ContinuationToken: options?.pageToken
    });
    const response = await this.s3Client.send(command);
    const items = (response.Contents || []).map((obj) => ({
      name: obj.Key?.split("/").pop() || obj.Key || "",
      fullPath: obj.Key || "",
      size: obj.Size || 0,
      bucket: this.bucket,
      timeCreated: obj.LastModified,
      updated: obj.LastModified
    }));
    return {
      items,
      nextPageToken: response.NextContinuationToken
    };
  }
  async getMetadata(path) {
    await this.initialize();
    this.ensureInitialized();
    const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: path
    });
    const response = await this.s3Client.send(command);
    return {
      name: path.split("/").pop() || path,
      fullPath: path,
      size: response.ContentLength || 0,
      contentType: response.ContentType,
      bucket: this.bucket,
      metadata: response.Metadata,
      timeCreated: response.LastModified,
      updated: response.LastModified
    };
  }
  async updateMetadata(path, metadata) {
    await this.initialize();
    this.ensureInitialized();
    const { CopyObjectCommand } = await import("@aws-sdk/client-s3");
    const command = new CopyObjectCommand({
      Bucket: this.bucket,
      Key: path,
      CopySource: `${this.bucket}/${path}`,
      Metadata: metadata.metadata,
      ContentType: metadata.contentType,
      MetadataDirective: "REPLACE"
    });
    await this.s3Client.send(command);
    return this.getMetadata(path);
  }
  async exists(path) {
    try {
      await this.getMetadata(path);
      return true;
    } catch (error) {
      return false;
    }
  }
};
var minioStorageAdapter = null;
function getMinIOStorageAdapter() {
  if (!minioStorageAdapter) {
    minioStorageAdapter = new MinIOStorageAdapter();
  }
  return minioStorageAdapter;
}

// src/adapters/storage.factory.ts
var StorageFactory = class {
  /**
   * Get the storage adapter based on environment configuration
   */
  static getAdapter() {
    const mode = this.getMode();
    switch (mode) {
      case "minio":
      case "s3":
        console.log("[Storage] Using MinIO/S3 storage adapter");
        return getMinIOStorageAdapter();
      case "firebase":
      default:
        console.log("[Storage] Using Firebase storage adapter");
        return getFirebaseStorageAdapter();
    }
  }
  /**
   * Determine storage mode based on environment variables
   */
  static getMode() {
    const storageMode = process.env.STORAGE_MODE || process.env.NEXT_PUBLIC_STORAGE_MODE;
    if (storageMode === "minio" || storageMode === "s3") {
      return "minio";
    }
    const deploymentMode = process.env.DEPLOYMENT_MODE || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;
    if (deploymentMode === "self-hosted") {
      return "minio";
    }
    if (process.env.MINIO_ENDPOINT || process.env.NEXT_PUBLIC_MINIO_ENDPOINT) {
      return "minio";
    }
    if (process.env.AWS_S3_BUCKET || process.env.NEXT_PUBLIC_AWS_S3_BUCKET) {
      return "s3";
    }
    return "firebase";
  }
  /**
   * Get storage mode information
   */
  static getInfo() {
    const mode = this.getMode();
    const info = {
      firebase: {
        mode: "firebase",
        description: "Using Firebase Storage",
        config: {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        }
      },
      minio: {
        mode: "minio",
        description: "Using MinIO (S3-compatible) Storage",
        config: {
          endpoint: process.env.MINIO_ENDPOINT || process.env.NEXT_PUBLIC_MINIO_ENDPOINT,
          bucket: process.env.MINIO_BUCKET || process.env.NEXT_PUBLIC_MINIO_BUCKET,
          accessKey: process.env.MINIO_ACCESS_KEY ? "[CONFIGURED]" : "[NOT SET]",
          secretKey: process.env.MINIO_SECRET_KEY ? "[CONFIGURED]" : "[NOT SET]"
        }
      },
      s3: {
        mode: "s3",
        description: "Using AWS S3 Storage",
        config: {
          bucket: process.env.AWS_S3_BUCKET || process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
          region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION,
          accessKey: process.env.AWS_ACCESS_KEY_ID ? "[CONFIGURED]" : "[NOT SET]",
          secretKey: process.env.AWS_SECRET_ACCESS_KEY ? "[CONFIGURED]" : "[NOT SET]"
        }
      }
    };
    return info[mode === "s3" ? "minio" : mode];
  }
};
function getStorage2() {
  return StorageFactory.getAdapter();
}
async function initializeStorage(config) {
  const adapter = config?.mode ? config.mode === "firebase" ? getFirebaseStorageAdapter() : getMinIOStorageAdapter() : StorageFactory.getAdapter();
  await adapter.initialize();
  return adapter;
}

// src/services/database-validation-service.ts
var DatabaseValidationService = class {
  /**
   * Run comprehensive database validation tests
   */
  async validate() {
    const results = [];
    const startTime = Date.now();
    results.push(await this.testDatabaseConnection());
    results.push(await this.testCRUDOperations());
    results.push(await this.testQueryOperations());
    results.push(await this.testTransactions());
    results.push(await this.testStorageOperations());
    results.push(await this.testRelationshipIntegrity());
    const totalDuration = Date.now() - startTime;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const mode = (process.env.DEPLOYMENT_MODE || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE) === "self-hosted" ? "self-hosted" : "firebase";
    return {
      overall: failed === 0 ? "passed" : passed > 0 ? "partial" : "failed",
      timestamp: /* @__PURE__ */ new Date(),
      mode,
      results,
      summary: {
        total: results.length,
        passed,
        failed,
        duration: totalDuration
      }
    };
  }
  /**
   * Test database connection
   */
  async testDatabaseConnection() {
    const start = Date.now();
    try {
      const db2 = getDatabase();
      if (!db2.isConnected()) {
        await db2.connect();
      }
      const connected = db2.isConnected();
      return {
        passed: connected,
        test: "Database Connection",
        duration: Date.now() - start,
        details: { connected }
      };
    } catch (error) {
      return {
        passed: false,
        test: "Database Connection",
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : "Connection failed"
      };
    }
  }
  /**
   * Test CRUD operations
   */
  async testCRUDOperations() {
    const start = Date.now();
    try {
      const db2 = getDatabase();
      const testId = `test-${Date.now()}`;
      const created = await db2.create("test_records", {
        id: testId,
        name: "Test Record",
        value: 123,
        createdAt: /* @__PURE__ */ new Date()
      });
      if (!created || created.id !== testId) {
        throw new Error("Create operation failed");
      }
      const found = await db2.findOne("test_records", testId);
      if (!found || found.id !== testId) {
        throw new Error("Read operation failed");
      }
      const updated = await db2.update("test_records", testId, {
        value: 456,
        updatedAt: /* @__PURE__ */ new Date()
      });
      if (!updated || updated.value !== 456) {
        throw new Error("Update operation failed");
      }
      await db2.delete("test_records", testId);
      const deleted = await db2.findOne("test_records", testId);
      if (deleted !== null) {
        throw new Error("Delete operation failed");
      }
      return {
        passed: true,
        test: "CRUD Operations",
        duration: Date.now() - start,
        details: { operations: ["create", "read", "update", "delete"] }
      };
    } catch (error) {
      return {
        passed: false,
        test: "CRUD Operations",
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : "CRUD operations failed"
      };
    }
  }
  /**
   * Test query operations
   */
  async testQueryOperations() {
    const start = Date.now();
    try {
      const db2 = getDatabase();
      const results = await db2.findMany("users", {
        limit: 10,
        orderBy: "createdAt",
        orderDirection: "desc"
      });
      if (results.length > 0) {
        const exists = await db2.exists("users", results[0].id);
        if (!exists) {
          throw new Error("Exists check failed");
        }
      }
      const count = await db2.count("users");
      if (typeof count !== "number") {
        throw new Error("Count operation failed");
      }
      return {
        passed: true,
        test: "Query Operations",
        duration: Date.now() - start,
        details: { resultCount: results.length, totalCount: count }
      };
    } catch (error) {
      return {
        passed: false,
        test: "Query Operations",
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : "Query operations failed"
      };
    }
  }
  /**
   * Test transaction support
   */
  async testTransactions() {
    const start = Date.now();
    try {
      const db2 = getDatabase();
      const testId1 = `test-txn-1-${Date.now()}`;
      const testId2 = `test-txn-2-${Date.now()}`;
      await db2.transaction(async (tx) => {
        await tx.create("test_records", {
          id: testId1,
          name: "Transaction Test 1",
          createdAt: /* @__PURE__ */ new Date()
        });
        await tx.create("test_records", {
          id: testId2,
          name: "Transaction Test 2",
          createdAt: /* @__PURE__ */ new Date()
        });
      });
      const record1 = await db2.findOne("test_records", testId1);
      const record2 = await db2.findOne("test_records", testId2);
      if (!record1 || !record2) {
        throw new Error("Transaction records not found");
      }
      await db2.delete("test_records", testId1);
      await db2.delete("test_records", testId2);
      return {
        passed: true,
        test: "Transaction Support",
        duration: Date.now() - start
      };
    } catch (error) {
      return {
        passed: false,
        test: "Transaction Support",
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : "Transaction failed"
      };
    }
  }
  /**
   * Test storage operations
   */
  async testStorageOperations() {
    const start = Date.now();
    try {
      const storage2 = getStorage2();
      await storage2.initialize();
      const testPath = `test/${Date.now()}.txt`;
      const testData = new TextEncoder().encode("Test storage data");
      const uploaded = await storage2.upload(testPath, testData, {
        contentType: "text/plain",
        customMetadata: { test: "true" }
      });
      if (!uploaded) {
        throw new Error("Upload failed");
      }
      const url = await storage2.getDownloadURL(testPath);
      if (!url) {
        throw new Error("Failed to get download URL");
      }
      const exists = await storage2.exists(testPath);
      if (!exists) {
        throw new Error("File existence check failed");
      }
      await storage2.delete(testPath);
      const deletedExists = await storage2.exists(testPath);
      if (deletedExists) {
        throw new Error("Delete failed");
      }
      return {
        passed: true,
        test: "Storage Operations",
        duration: Date.now() - start
      };
    } catch (error) {
      return {
        passed: false,
        test: "Storage Operations",
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : "Storage operations failed"
      };
    }
  }
  /**
   * Test relationship integrity
   */
  async testRelationshipIntegrity() {
    const start = Date.now();
    try {
      const db2 = getDatabase();
      const povs = await db2.findMany("povs", { limit: 5 });
      const trrs = await db2.findMany("trrs", { limit: 5 });
      let validRelationships = 0;
      for (const trr of trrs) {
        if (trr.povId) {
          const pov = await db2.findOne("povs", trr.povId);
          if (pov) {
            validRelationships++;
          }
        }
      }
      const projects = await db2.findMany("projects", { limit: 5 });
      for (const project of projects) {
        if (project.povIds && Array.isArray(project.povIds)) {
          for (const povId of project.povIds) {
            const pov = await db2.findOne("povs", povId);
            if (pov) {
              validRelationships++;
            }
          }
        }
      }
      return {
        passed: true,
        test: "Relationship Integrity",
        duration: Date.now() - start,
        details: { validRelationships, totalChecked: trrs.length + projects.length }
      };
    } catch (error) {
      return {
        passed: false,
        test: "Relationship Integrity",
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : "Relationship check failed"
      };
    }
  }
  /**
   * Quick health check (subset of full validation)
   */
  async healthCheck() {
    try {
      const db2 = getDatabase();
      if (!db2.isConnected()) {
        await db2.connect();
      }
      await db2.findMany("users", { limit: 1 });
      return {
        healthy: true,
        details: {
          mode: process.env.DEPLOYMENT_MODE || "firebase",
          timestamp: /* @__PURE__ */ new Date()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : "Health check failed",
          timestamp: /* @__PURE__ */ new Date()
        }
      };
    }
  }
};
var databaseValidationService = new DatabaseValidationService();

// src/services/analytics-service.ts
var AnalyticsService = class {
  /**
   * Get user-specific analytics
   */
  async getUserAnalytics(userId, period = "month") {
    const db2 = getDatabase();
    const { startDate, endDate } = this.getPeriodDates(period);
    const povs = await db2.findMany("povs", {
      filters: [{ field: "owner", operator: "==", value: userId }]
    });
    const recentPOVs = povs.filter(
      (pov) => new Date(pov.createdAt) >= startDate && new Date(pov.createdAt) <= endDate
    );
    const activePOVs = povs.filter(
      (pov) => pov.status === "in_progress" || pov.status === "testing"
    );
    const completedPOVs = recentPOVs.filter(
      (pov) => pov.status === "completed"
    );
    const trrs = await db2.findMany("trrs", {
      filters: [{ field: "owner", operator: "==", value: userId }]
    });
    const recentTRRs = trrs.filter(
      (trr) => new Date(trr.createdAt) >= startDate && new Date(trr.createdAt) <= endDate
    );
    const completedTRRs = recentTRRs.filter(
      (trr) => trr.status === "completed" || trr.status === "approved"
    );
    const projects = await db2.findMany("projects", {
      filters: [{ field: "owner", operator: "==", value: userId }]
    });
    const activeProjects = projects.filter(
      (proj) => proj.status === "active"
    );
    const trends = this.calculateTrends(recentPOVs, recentTRRs, period);
    const topProjects = projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5).map((proj) => ({
      id: proj.id,
      title: proj.title,
      status: proj.status,
      lastActivity: proj.updatedAt
    }));
    const recentActivity = await this.getUserRecentActivity(userId, 10);
    return {
      userId,
      period,
      metrics: {
        totalPOVs: povs.length,
        activePOVs: activePOVs.length,
        completedPOVs: completedPOVs.length,
        totalTRRs: trrs.length,
        completedTRRs: completedTRRs.length,
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        hoursLogged: 0,
        // TODO: Implement time tracking
        tasksCompleted: 0,
        // TODO: Get from tasks
        collaborations: 0
        // TODO: Count team memberships
      },
      trends,
      topProjects,
      recentActivity
    };
  }
  /**
   * Get admin-level analytics
   */
  async getAdminAnalytics(period = "month") {
    const db2 = getDatabase();
    const { startDate, endDate } = this.getPeriodDates(period);
    const users = await db2.findMany("users");
    const newUsers = users.filter(
      (user) => new Date(user.createdAt) >= startDate && new Date(user.createdAt) <= endDate
    );
    const activityLogs = await db2.findMany("activityLogs", {
      filters: [{ field: "timestamp", operator: ">=", value: startDate }]
    });
    const activeUserIds = new Set(activityLogs.map((log) => log.userId));
    const povs = await db2.findMany("povs");
    const activePOVs = povs.filter(
      (pov) => pov.status === "in_progress" || pov.status === "testing"
    );
    const trrs = await db2.findMany("trrs");
    const pendingTRRs = trrs.filter(
      (trr) => trr.status === "pending_validation" || trr.status === "in_review"
    );
    const projects = await db2.findMany("projects");
    const activeProjects = projects.filter(
      (proj) => proj.status === "active"
    );
    const projectHealth = {
      good: 0,
      warning: 0,
      atRisk: 0
    };
    projects.forEach((proj) => {
      const health = this.calculateProjectHealth(proj);
      projectHealth[health]++;
    });
    const topUsers = await this.getTopUsers(5);
    const trendsOverTime = this.calculateSystemTrends(povs, trrs, projects, period);
    const userEngagement = this.calculateUserEngagement(activityLogs, period);
    return {
      period,
      systemMetrics: {
        totalUsers: users.length,
        activeUsers: activeUserIds.size,
        newUsers: newUsers.length,
        totalPOVs: povs.length,
        activePOVs: activePOVs.length,
        totalTRRs: trrs.length,
        pendingTRRs: pendingTRRs.length,
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        storageUsed: 0,
        // TODO: Calculate from storage
        apiCalls: 0
        // TODO: Track API calls
      },
      performance: {
        avgResponseTime: 0,
        // TODO: Implement performance tracking
        errorRate: 0,
        uptime: 99.9
      },
      userEngagement,
      projectHealth,
      topUsers,
      trendsOverTime
    };
  }
  /**
   * Get recent activity for a user
   */
  async getUserRecentActivity(userId, limit = 10) {
    const db2 = getDatabase();
    try {
      const activities = await db2.findMany("activityLogs", {
        filters: [{ field: "userId", operator: "==", value: userId }],
        orderBy: "timestamp",
        orderDirection: "desc",
        limit
      });
      return activities.map((activity) => ({
        id: activity.id,
        type: activity.entityType,
        action: activity.action,
        timestamp: activity.timestamp,
        entityTitle: activity.entityTitle || "Unknown"
      }));
    } catch (error) {
      console.error("Error fetching user activity:", error);
      return [];
    }
  }
  /**
   * Get top performing users
   */
  async getTopUsers(limit = 5) {
    const db2 = getDatabase();
    try {
      const users = await db2.findMany("users");
      const userStats = await Promise.all(
        users.map(async (user) => {
          const povs = await db2.findMany("povs", {
            filters: [{ field: "owner", operator: "==", value: user.id }]
          });
          const trrs = await db2.findMany("trrs", {
            filters: [{ field: "owner", operator: "==", value: user.id }]
          });
          const completedTRRs = trrs.filter(
            (trr) => trr.status === "completed" || trr.status === "approved"
          );
          const activityScore = povs.length * 10 + completedTRRs.length * 20;
          return {
            userId: user.id,
            displayName: user.displayName || user.email,
            povsCreated: povs.length,
            trrsCompleted: completedTRRs.length,
            activityScore
          };
        })
      );
      return userStats.sort((a, b) => b.activityScore - a.activityScore).slice(0, limit);
    } catch (error) {
      console.error("Error fetching top users:", error);
      return [];
    }
  }
  /**
   * Calculate trends for a period
   */
  calculateTrends(povs, trrs, period) {
    const intervals = this.getIntervals(period);
    const povsCreated = new Array(intervals.length).fill(0);
    const trrsSubmitted = new Array(intervals.length).fill(0);
    const activityScore = new Array(intervals.length).fill(0);
    povs.forEach((pov) => {
      const index = this.getIntervalIndex(new Date(pov.createdAt), intervals);
      if (index >= 0 && index < intervals.length) {
        povsCreated[index]++;
        activityScore[index] += 10;
      }
    });
    trrs.forEach((trr) => {
      const index = this.getIntervalIndex(new Date(trr.createdAt), intervals);
      if (index >= 0 && index < intervals.length) {
        trrsSubmitted[index]++;
        activityScore[index] += 20;
      }
    });
    return {
      povsCreated,
      trrsSubmitted,
      activityScore,
      dates: intervals.map((d) => d.toISOString().split("T")[0])
    };
  }
  /**
   * Calculate system-wide trends
   */
  calculateSystemTrends(povs, trrs, projects, period) {
    const intervals = this.getIntervals(period);
    const povsPerWeek = new Array(intervals.length).fill(0);
    const trrsPerWeek = new Array(intervals.length).fill(0);
    const projectsPerWeek = new Array(intervals.length).fill(0);
    povs.forEach((pov) => {
      const index = this.getIntervalIndex(new Date(pov.createdAt), intervals);
      if (index >= 0 && index < intervals.length) {
        povsPerWeek[index]++;
      }
    });
    trrs.forEach((trr) => {
      const index = this.getIntervalIndex(new Date(trr.createdAt), intervals);
      if (index >= 0 && index < intervals.length) {
        trrsPerWeek[index]++;
      }
    });
    projects.forEach((project) => {
      const index = this.getIntervalIndex(new Date(project.createdAt), intervals);
      if (index >= 0 && index < intervals.length) {
        projectsPerWeek[index]++;
      }
    });
    return {
      povsPerWeek,
      trrsPerWeek,
      projectsPerWeek,
      dates: intervals.map((d) => d.toISOString().split("T")[0])
    };
  }
  /**
   * Calculate user engagement metrics
   */
  calculateUserEngagement(activityLogs, period) {
    const intervals = this.getIntervals(period);
    const dailyActiveUsers = new Array(intervals.length).fill(0);
    const weeklyActiveUsers = new Array(intervals.length).fill(0);
    intervals.forEach((date, index) => {
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const uniqueUsers = new Set(
        activityLogs.filter((log) => {
          const logDate = new Date(log.timestamp);
          return logDate >= dayStart && logDate < dayEnd;
        }).map((log) => log.userId)
      );
      dailyActiveUsers[index] = uniqueUsers.size;
      if (index >= 6) {
        const weekStart = new Date(intervals[index - 6]);
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 1);
        const weeklyUnique = new Set(
          activityLogs.filter((log) => {
            const logDate = new Date(log.timestamp);
            return logDate >= weekStart && logDate < weekEnd;
          }).map((log) => log.userId)
        );
        weeklyActiveUsers[index] = weeklyUnique.size;
      }
    });
    return {
      dailyActiveUsers,
      weeklyActiveUsers,
      dates: intervals.map((d) => d.toISOString().split("T")[0])
    };
  }
  /**
   * Calculate project health score
   */
  calculateProjectHealth(project) {
    let score = 100;
    if (project.endDate && new Date(project.endDate) < /* @__PURE__ */ new Date() && project.status !== "completed") {
      score -= 30;
    }
    if (project.status === "on_hold") {
      score -= 20;
    }
    if (project.priority === "critical" || project.priority === "high") {
      score -= 10;
    }
    if (score >= 80) return "good";
    if (score >= 60) return "warning";
    return "atRisk";
  }
  /**
   * Get period date range
   */
  getPeriodDates(period) {
    const endDate = /* @__PURE__ */ new Date();
    const startDate = /* @__PURE__ */ new Date();
    switch (period) {
      case "week":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    return { startDate, endDate };
  }
  /**
   * Get time intervals for a period
   */
  getIntervals(period) {
    const intervals = [];
    const endDate = /* @__PURE__ */ new Date();
    let count = 0;
    switch (period) {
      case "week":
        count = 7;
        break;
      case "month":
        count = 30;
        break;
      case "quarter":
        count = 90;
        break;
      case "year":
        count = 52;
        break;
    }
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      intervals.push(date);
    }
    return intervals;
  }
  /**
   * Get interval index for a date
   */
  getIntervalIndex(date, intervals) {
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      const nextInterval = i < intervals.length - 1 ? intervals[i + 1] : /* @__PURE__ */ new Date();
      if (date >= interval && date < nextInterval) {
        return i;
      }
    }
    return intervals.length - 1;
  }
};
var analyticsService = new AnalyticsService();

// src/services/relationship-management-service.ts
var RelationshipManagementService = class {
  /**
   * Associate a TRR with a POV
   */
  async associateTRRWithPOV(trrId, povId) {
    const db2 = getDatabase();
    try {
      const trr = await db2.findOne("trrs", trrId);
      if (!trr) {
        return { success: false, error: "TRR not found" };
      }
      const pov = await db2.findOne("povs", povId);
      if (!pov) {
        return { success: false, error: "POV not found" };
      }
      if (trr.projectId !== pov.projectId) {
        return { success: false, error: "TRR and POV must belong to the same project" };
      }
      await db2.update("trrs", trrId, {
        povId,
        lastModifiedBy: "system",
        // TODO: Use actual user ID
        updatedAt: /* @__PURE__ */ new Date()
      });
      await this.logRelationshipChange("trr_pov_association", {
        trrId,
        povId,
        projectId: trr.projectId
      });
      return { success: true };
    } catch (error) {
      console.error("Error associating TRR with POV:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Association failed"
      };
    }
  }
  /**
   * Associate a POV with a Demo Scenario
   */
  async associatePOVWithScenario(povId, scenarioId) {
    const db2 = getDatabase();
    try {
      const pov = await db2.findOne("povs", povId);
      if (!pov) {
        return { success: false, error: "POV not found" };
      }
      const scenario = await db2.findOne("scenarios", scenarioId);
      if (!scenario) {
        return { success: false, error: "Scenario not found" };
      }
      const testPlan = pov.testPlan || { scenarios: [] };
      if (!testPlan.scenarios.includes(scenarioId)) {
        testPlan.scenarios.push(scenarioId);
      }
      await db2.update("povs", povId, {
        testPlan,
        lastModifiedBy: "system",
        // TODO: Use actual user ID
        updatedAt: /* @__PURE__ */ new Date()
      });
      await db2.update("scenarios", scenarioId, {
        povId,
        updatedAt: /* @__PURE__ */ new Date()
      });
      await this.logRelationshipChange("pov_scenario_association", {
        povId,
        scenarioId,
        projectId: pov.projectId
      });
      return { success: true };
    } catch (error) {
      console.error("Error associating POV with Scenario:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Association failed"
      };
    }
  }
  /**
   * Associate POV with Project
   */
  async associatePOVWithProject(povId, projectId) {
    const db2 = getDatabase();
    try {
      const pov = await db2.findOne("povs", povId);
      if (!pov) {
        return { success: false, error: "POV not found" };
      }
      const project = await db2.findOne("projects", projectId);
      if (!project) {
        return { success: false, error: "Project not found" };
      }
      await db2.update("povs", povId, {
        projectId,
        lastModifiedBy: "system",
        // TODO: Use actual user ID
        updatedAt: /* @__PURE__ */ new Date()
      });
      const povIds = project.povIds || [];
      if (!povIds.includes(povId)) {
        povIds.push(povId);
        await db2.update("projects", projectId, {
          povIds,
          lastModifiedBy: "system",
          // TODO: Use actual user ID
          updatedAt: /* @__PURE__ */ new Date()
        });
      }
      await this.logRelationshipChange("pov_project_association", {
        povId,
        projectId
      });
      return { success: true };
    } catch (error) {
      console.error("Error associating POV with Project:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Association failed"
      };
    }
  }
  /**
   * Associate TRR with Project
   */
  async associateTRRWithProject(trrId, projectId) {
    const db2 = getDatabase();
    try {
      const trr = await db2.findOne("trrs", trrId);
      if (!trr) {
        return { success: false, error: "TRR not found" };
      }
      const project = await db2.findOne("projects", projectId);
      if (!project) {
        return { success: false, error: "Project not found" };
      }
      await db2.update("trrs", trrId, {
        projectId,
        lastModifiedBy: "system",
        // TODO: Use actual user ID
        updatedAt: /* @__PURE__ */ new Date()
      });
      const trrIds = project.trrIds || [];
      if (!trrIds.includes(trrId)) {
        trrIds.push(trrId);
        await db2.update("projects", projectId, {
          trrIds,
          lastModifiedBy: "system",
          // TODO: Use actual user ID
          updatedAt: /* @__PURE__ */ new Date()
        });
      }
      await this.logRelationshipChange("trr_project_association", {
        trrId,
        projectId
      });
      return { success: true };
    } catch (error) {
      console.error("Error associating TRR with Project:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Association failed"
      };
    }
  }
  /**
   * Get relationship graph for a project
   */
  async getProjectRelationshipGraph(projectId) {
    const db2 = getDatabase();
    try {
      const project = await db2.findOne("projects", projectId);
      if (!project) {
        return null;
      }
      const povs = await db2.findMany("povs", {
        filters: [{ field: "projectId", operator: "==", value: projectId }]
      });
      const trrs = await db2.findMany("trrs", {
        filters: [{ field: "projectId", operator: "==", value: projectId }]
      });
      const scenarios = await db2.findMany("scenarios", {
        filters: [{ field: "projectId", operator: "==", value: projectId }]
      });
      const povToTRR = {};
      const povToScenario = {};
      const trrToPOV = {};
      const scenarioToPOV = {};
      trrs.forEach((trr) => {
        if (trr.povId) {
          trrToPOV[trr.id] = trr.povId;
          if (!povToTRR[trr.povId]) {
            povToTRR[trr.povId] = [];
          }
          povToTRR[trr.povId].push(trr.id);
        }
      });
      povs.forEach((pov) => {
        if (pov.testPlan?.scenarios) {
          povToScenario[pov.id] = pov.testPlan.scenarios;
          pov.testPlan.scenarios.forEach((scenarioId) => {
            scenarioToPOV[scenarioId] = pov.id;
          });
        }
      });
      return {
        projectId,
        povs,
        trrs,
        scenarios,
        relationships: {
          povToTRR,
          povToScenario,
          trrToPOV,
          scenarioToPOV
        }
      };
    } catch (error) {
      console.error("Error getting relationship graph:", error);
      return null;
    }
  }
  /**
   * Validate relationships for integrity
   */
  async validateRelationships(projectId) {
    const errors = [];
    const warnings = [];
    try {
      const graph = await this.getProjectRelationshipGraph(projectId);
      if (!graph) {
        errors.push("Project not found");
        return { valid: false, errors, warnings };
      }
      graph.trrs.forEach((trr) => {
        if (!trr.povId) {
          warnings.push(`TRR "${trr.title}" (${trr.id}) is not associated with any POV`);
        } else if (!graph.povs.find((pov) => pov.id === trr.povId)) {
          errors.push(`TRR "${trr.title}" (${trr.id}) references non-existent POV ${trr.povId}`);
        }
      });
      graph.scenarios.forEach((scenario) => {
        if (!scenario.povId) {
          warnings.push(`Scenario "${scenario.title}" (${scenario.id}) is not associated with any POV`);
        } else if (!graph.povs.find((pov) => pov.id === scenario.povId)) {
          errors.push(`Scenario "${scenario.title}" (${scenario.id}) references non-existent POV ${scenario.povId}`);
        }
      });
      graph.povs.forEach((pov) => {
        if (pov.testPlan?.scenarios) {
          pov.testPlan.scenarios.forEach((scenarioId) => {
            if (!graph.scenarios.find((s) => s.id === scenarioId)) {
              errors.push(`POV "${pov.title}" (${pov.id}) references non-existent scenario ${scenarioId}`);
            }
          });
        }
      });
      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Validation failed");
      return { valid: false, errors, warnings };
    }
  }
  /**
   * Automatically fix broken relationships
   */
  async repairRelationships(projectId) {
    const db2 = getDatabase();
    let fixed = 0;
    const errors = [];
    try {
      const graph = await this.getProjectRelationshipGraph(projectId);
      if (!graph) {
        errors.push("Project not found");
        return { fixed, errors };
      }
      for (const trr of graph.trrs) {
        if (trr.povId && !graph.povs.find((pov) => pov.id === trr.povId)) {
          await db2.update("trrs", trr.id, {
            povId: null,
            updatedAt: /* @__PURE__ */ new Date()
          });
          fixed++;
        }
      }
      for (const scenario of graph.scenarios) {
        if (scenario.povId && !graph.povs.find((pov) => pov.id === scenario.povId)) {
          await db2.update("scenarios", scenario.id, {
            povId: null,
            updatedAt: /* @__PURE__ */ new Date()
          });
          fixed++;
        }
      }
      for (const pov of graph.povs) {
        if (pov.testPlan?.scenarios) {
          const validScenarios = pov.testPlan.scenarios.filter(
            (scenarioId) => graph.scenarios.find((s) => s.id === scenarioId)
          );
          if (validScenarios.length !== pov.testPlan.scenarios.length) {
            await db2.update("povs", pov.id, {
              testPlan: {
                ...pov.testPlan,
                scenarios: validScenarios
              },
              updatedAt: /* @__PURE__ */ new Date()
            });
            fixed++;
          }
        }
      }
      return { fixed, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Repair failed");
      return { fixed, errors };
    }
  }
  /**
   * Log relationship changes for audit
   */
  async logRelationshipChange(type, metadata) {
    const db2 = getDatabase();
    try {
      await db2.create("relationshipLogs", {
        id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        metadata,
        timestamp: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error logging relationship change:", error);
    }
  }
  /**
   * Get POVs for a TRR
   */
  async getPOVForTRR(trrId) {
    const db2 = getDatabase();
    try {
      const trr = await db2.findOne("trrs", trrId);
      if (!trr || !trr.povId) {
        return null;
      }
      return await db2.findOne("povs", trr.povId);
    } catch (error) {
      console.error("Error getting POV for TRR:", error);
      return null;
    }
  }
  /**
   * Get TRRs for a POV
   */
  async getTRRsForPOV(povId) {
    const db2 = getDatabase();
    try {
      return await db2.findMany("trrs", {
        filters: [{ field: "povId", operator: "==", value: povId }]
      });
    } catch (error) {
      console.error("Error getting TRRs for POV:", error);
      return [];
    }
  }
  /**
   * Get Scenarios for a POV
   */
  async getScenariosForPOV(povId) {
    const db2 = getDatabase();
    try {
      const pov = await db2.findOne("povs", povId);
      if (!pov || !pov.testPlan?.scenarios) {
        return [];
      }
      const scenarios = await Promise.all(
        pov.testPlan.scenarios.map(
          (scenarioId) => db2.findOne("scenarios", scenarioId)
        )
      );
      return scenarios.filter((s) => s !== null);
    } catch (error) {
      console.error("Error getting Scenarios for POV:", error);
      return [];
    }
  }
};
var relationshipManagementService = new RelationshipManagementService();

// src/services/dynamic-record-service.ts
var DynamicRecordService = class {
  /**
   * Create a new POV with defaults and relationships
   */
  async createPOV(data, projectId, options = {}) {
    const db2 = getDatabase();
    const userId = options.userId || "system";
    try {
      const project = await db2.findOne("projects", projectId);
      if (!project) {
        return { success: false, error: "Project not found" };
      }
      const povId = data.id || `pov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const povData = {
        id: povId,
        projectId,
        title: data.title || "New POV",
        description: data.description || "",
        status: data.status || "planning",
        priority: data.priority || "medium",
        objectives: data.objectives || [],
        testPlan: data.testPlan || {
          scenarios: [],
          timeline: {
            start: /* @__PURE__ */ new Date(),
            end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3),
            // 90 days
            milestones: []
          },
          resources: []
        },
        successMetrics: data.successMetrics || {},
        phases: data.phases || [
          {
            id: "phase-1",
            name: "Planning",
            description: "Initial planning and scoping",
            startDate: /* @__PURE__ */ new Date(),
            status: "in_progress",
            tasks: []
          },
          {
            id: "phase-2",
            name: "Execution",
            description: "Execute POV plan",
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
            status: "todo",
            tasks: []
          },
          {
            id: "phase-3",
            name: "Validation",
            description: "Validate results",
            startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1e3),
            status: "todo",
            tasks: []
          }
        ],
        owner: data.owner || userId,
        team: data.team || [],
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        createdBy: userId,
        lastModifiedBy: userId
      };
      await db2.create("povs", povData);
      if (options.createRelationships !== false) {
        await relationshipManagementService.associatePOVWithProject(povId, projectId);
      }
      await this.logLifecycleEvent({
        recordId: povId,
        recordType: "pov",
        from: "none",
        to: "planning",
        triggeredBy: userId,
        timestamp: /* @__PURE__ */ new Date(),
        metadata: { projectId, title: povData.title }
      });
      await this.logActivity({
        userId,
        action: "create",
        entityType: "pov",
        entityId: povId,
        entityTitle: povData.title,
        details: { projectId }
      });
      return { success: true, povId };
    } catch (error) {
      console.error("Error creating POV:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create POV"
      };
    }
  }
  /**
   * Create a new TRR with defaults and relationships
   */
  async createTRR(data, projectId, povId, options = {}) {
    const db2 = getDatabase();
    const userId = options.userId || "system";
    try {
      const project = await db2.findOne("projects", projectId);
      if (!project) {
        return { success: false, error: "Project not found" };
      }
      if (povId) {
        const pov = await db2.findOne("povs", povId);
        if (!pov) {
          return { success: false, error: "POV not found" };
        }
        if (pov.projectId !== projectId) {
          return { success: false, error: "POV and Project mismatch" };
        }
      }
      const trrId = data.id || `trr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const trrData = {
        id: trrId,
        projectId,
        povId: povId || null,
        title: data.title || "New Technical Risk Review",
        description: data.description || "",
        status: data.status || "draft",
        priority: data.priority || "medium",
        riskAssessment: data.riskAssessment || {
          overall_score: 5,
          categories: [
            {
              category: "Technical Feasibility",
              score: 5,
              description: "Pending assessment",
              mitigation: "",
              evidence: []
            },
            {
              category: "Security",
              score: 5,
              description: "Pending assessment",
              mitigation: "",
              evidence: []
            },
            {
              category: "Performance",
              score: 5,
              description: "Pending assessment",
              mitigation: "",
              evidence: []
            },
            {
              category: "Scalability",
              score: 5,
              description: "Pending assessment",
              mitigation: "",
              evidence: []
            }
          ]
        },
        findings: data.findings || [],
        validation: data.validation || {},
        signoff: data.signoff || {},
        owner: data.owner || userId,
        reviewers: data.reviewers || [],
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        createdBy: userId,
        lastModifiedBy: userId
      };
      await db2.create("trrs", trrData);
      if (options.createRelationships !== false) {
        await relationshipManagementService.associateTRRWithProject(trrId, projectId);
        if (povId) {
          await relationshipManagementService.associateTRRWithPOV(trrId, povId);
        }
      }
      await this.logLifecycleEvent({
        recordId: trrId,
        recordType: "trr",
        from: "none",
        to: "draft",
        triggeredBy: userId,
        timestamp: /* @__PURE__ */ new Date(),
        metadata: { projectId, povId, title: trrData.title }
      });
      await this.logActivity({
        userId,
        action: "create",
        entityType: "trr",
        entityId: trrId,
        entityTitle: trrData.title,
        details: { projectId, povId }
      });
      return { success: true, trrId };
    } catch (error) {
      console.error("Error creating TRR:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create TRR"
      };
    }
  }
  /**
   * Create a new Demo Scenario
   */
  async createScenario(data, povId, options = {}) {
    const db2 = getDatabase();
    const userId = options.userId || "system";
    try {
      let projectId = data.projectId;
      if (povId) {
        const pov = await db2.findOne("povs", povId);
        if (!pov) {
          return { success: false, error: "POV not found" };
        }
        projectId = pov.projectId;
      }
      const scenarioId = data.id || `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const scenarioData = {
        id: scenarioId,
        projectId,
        povId: povId || null,
        title: data.title || "New Demo Scenario",
        description: data.description || "",
        type: data.type || "demo",
        status: data.status || "draft",
        steps: data.steps || [],
        expectedOutcomes: data.expectedOutcomes || [],
        actualOutcomes: data.actualOutcomes || [],
        testData: data.testData || {},
        environment: data.environment || "test",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        createdBy: userId,
        lastModifiedBy: userId
      };
      await db2.create("scenarios", scenarioData);
      if (povId && options.createRelationships !== false) {
        await relationshipManagementService.associatePOVWithScenario(povId, scenarioId);
      }
      await this.logActivity({
        userId,
        action: "create",
        entityType: "scenario",
        entityId: scenarioId,
        entityTitle: scenarioData.title,
        details: { projectId, povId }
      });
      return { success: true, scenarioId };
    } catch (error) {
      console.error("Error creating Scenario:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create Scenario"
      };
    }
  }
  /**
   * Transition POV to next phase
   */
  async transitionPOVPhase(povId, userId) {
    const db2 = getDatabase();
    try {
      const pov = await db2.findOne("povs", povId);
      if (!pov) {
        return { success: false, error: "POV not found" };
      }
      const povData = pov;
      const currentPhaseIndex = povData.phases.findIndex((p) => p.status === "in_progress");
      if (currentPhaseIndex === -1) {
        return { success: false, error: "No active phase found" };
      }
      const currentPhase = povData.phases[currentPhaseIndex];
      povData.phases[currentPhaseIndex].status = "done";
      povData.phases[currentPhaseIndex].endDate = /* @__PURE__ */ new Date();
      if (currentPhaseIndex < povData.phases.length - 1) {
        povData.phases[currentPhaseIndex + 1].status = "in_progress";
        povData.phases[currentPhaseIndex + 1].startDate = /* @__PURE__ */ new Date();
      } else {
        povData.status = "completed";
      }
      await db2.update("povs", povId, {
        phases: povData.phases,
        status: povData.status,
        updatedAt: /* @__PURE__ */ new Date(),
        lastModifiedBy: userId
      });
      await this.logLifecycleEvent({
        recordId: povId,
        recordType: "pov",
        from: currentPhase.name,
        to: povData.phases[currentPhaseIndex + 1]?.name || "completed",
        triggeredBy: userId,
        timestamp: /* @__PURE__ */ new Date(),
        metadata: { phaseIndex: currentPhaseIndex + 1 }
      });
      await this.logActivity({
        userId,
        action: "phase_transition",
        entityType: "pov",
        entityId: povId,
        entityTitle: povData.title,
        details: {
          from: currentPhase.name,
          to: povData.phases[currentPhaseIndex + 1]?.name || "completed"
        }
      });
      return {
        success: true,
        nextPhase: povData.phases[currentPhaseIndex + 1]?.name || "completed"
      };
    } catch (error) {
      console.error("Error transitioning POV phase:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Phase transition failed"
      };
    }
  }
  /**
   * Transition TRR through workflow
   */
  async transitionTRRStatus(trrId, newStatus, userId) {
    const db2 = getDatabase();
    try {
      const trr = await db2.findOne("trrs", trrId);
      if (!trr) {
        return { success: false, error: "TRR not found" };
      }
      const trrData = trr;
      const oldStatus = trrData.status;
      await db2.update("trrs", trrId, {
        status: newStatus,
        updatedAt: /* @__PURE__ */ new Date(),
        lastModifiedBy: userId
      });
      await this.logLifecycleEvent({
        recordId: trrId,
        recordType: "trr",
        from: oldStatus,
        to: newStatus,
        triggeredBy: userId,
        timestamp: /* @__PURE__ */ new Date()
      });
      await this.logActivity({
        userId,
        action: "status_change",
        entityType: "trr",
        entityId: trrId,
        entityTitle: trrData.title,
        details: {
          from: oldStatus,
          to: newStatus
        }
      });
      return { success: true };
    } catch (error) {
      console.error("Error transitioning TRR status:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Status transition failed"
      };
    }
  }
  /**
   * Log lifecycle event
   */
  async logLifecycleEvent(event) {
    const db2 = getDatabase();
    try {
      await db2.create("lifecycleEvents", {
        id: `lifecycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...event,
        createdAt: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error logging lifecycle event:", error);
    }
  }
  /**
   * Log user activity
   */
  async logActivity(activity) {
    const db2 = getDatabase();
    try {
      await db2.create("activityLogs", {
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...activity,
        timestamp: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  }
  /**
   * Auto-populate related records when creating a POV
   */
  async autoPopulatePOVRecords(povId, userId) {
    const created = [];
    const errors = [];
    try {
      const pov = await this.getDatabase().findOne("povs", povId);
      if (!pov) {
        errors.push("POV not found");
        return { created, errors };
      }
      const povData = pov;
      const trrResult = await this.createTRR(
        {
          title: `TRR for ${povData.title}`,
          description: `Technical Risk Review for POV: ${povData.title}`
        },
        povData.projectId,
        povId,
        { userId, createRelationships: true }
      );
      if (trrResult.success && trrResult.trrId) {
        created.push(`TRR: ${trrResult.trrId}`);
      } else if (trrResult.error) {
        errors.push(`TRR creation failed: ${trrResult.error}`);
      }
      const scenarioResult = await this.createScenario(
        {
          title: `Demo Scenario for ${povData.title}`,
          description: `Demo scenario for POV: ${povData.title}`,
          type: "demo"
        },
        povId,
        { userId, createRelationships: true }
      );
      if (scenarioResult.success && scenarioResult.scenarioId) {
        created.push(`Scenario: ${scenarioResult.scenarioId}`);
      } else if (scenarioResult.error) {
        errors.push(`Scenario creation failed: ${scenarioResult.error}`);
      }
      return { created, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Auto-population failed");
      return { created, errors };
    }
  }
  getDatabase() {
    return getDatabase();
  }
};
var dynamicRecordService = new DynamicRecordService();

// src/services/terraform-generation-service.ts
var TerraformGenerationService = class {
  /**
   * Generate Terraform configuration from a scenario
   */
  async generateTerraformForScenario(scenarioId, options = {}) {
    const db2 = getDatabase();
    const scenario = await db2.findOne("scenarios", scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }
    const provider = options.provider || "gcp";
    const format = options.format || "hcl";
    const scenarioData = scenario;
    const config = {
      version: "1.5",
      provider,
      region: scenarioData.environment === "production" ? "us-central1" : "us-east1",
      projectId: scenarioData.projectId,
      resources: []
    };
    config.resources = await this.generateResourcesFromScenario(scenarioData);
    if (format === "hcl") {
      const hcl = this.generateHCL(config, options);
      return {
        filename: `${scenarioData.id}-deployment.tf`,
        content: hcl,
        format: "hcl",
        variables: this.extractVariables(config),
        outputs: this.generateOutputs(config)
      };
    } else {
      const json = this.generateJSON(config, options);
      return {
        filename: `${scenarioData.id}-deployment.tf.json`,
        content: json,
        format: "json",
        variables: this.extractVariables(config),
        outputs: this.generateOutputs(config)
      };
    }
  }
  /**
   * Generate Terraform resources from scenario configuration
   */
  async generateResourcesFromScenario(scenario) {
    const resources = [];
    resources.push({
      type: "google_project",
      name: "project",
      config: {
        name: scenario.projectId || "cortex-dc-demo",
        project_id: scenario.projectId || "cortex-dc-demo",
        billing_account: "${var.billing_account}"
      }
    });
    resources.push({
      type: "google_compute_network",
      name: "vpc_network",
      config: {
        name: `${scenario.id}-vpc`,
        project: "${google_project.project.project_id}",
        auto_create_subnetworks: false
      },
      dependencies: ["google_project.project"]
    });
    resources.push({
      type: "google_compute_subnetwork",
      name: "subnet",
      config: {
        name: `${scenario.id}-subnet`,
        network: "${google_compute_network.vpc_network.id}",
        ip_cidr_range: "10.0.0.0/24",
        region: "${var.region}",
        project: "${google_project.project.project_id}"
      },
      dependencies: ["google_compute_network.vpc_network"]
    });
    if (this.requiresGKE(scenario)) {
      resources.push({
        type: "google_container_cluster",
        name: "primary",
        config: {
          name: `${scenario.id}-gke`,
          location: "${var.region}",
          project: "${google_project.project.project_id}",
          network: "${google_compute_network.vpc_network.name}",
          subnetwork: "${google_compute_subnetwork.subnet.name}",
          remove_default_node_pool: true,
          initial_node_count: 1
        },
        dependencies: ["google_compute_subnetwork.subnet"]
      });
      resources.push({
        type: "google_container_node_pool",
        name: "primary_nodes",
        config: {
          name: "primary-pool",
          cluster: "${google_container_cluster.primary.name}",
          location: "${var.region}",
          project: "${google_project.project.project_id}",
          node_count: 3,
          node_config: {
            machine_type: "n2-standard-4",
            disk_size_gb: 100,
            disk_type: "pd-standard",
            oauth_scopes: [
              "https://www.googleapis.com/auth/cloud-platform"
            ]
          }
        },
        dependencies: ["google_container_cluster.primary"]
      });
    }
    if (this.requiresFirestore(scenario)) {
      resources.push({
        type: "google_firestore_database",
        name: "database",
        config: {
          name: `${scenario.id}-firestore`,
          project: "${google_project.project.project_id}",
          location_id: "${var.region}",
          type: "FIRESTORE_NATIVE"
        },
        dependencies: ["google_project.project"]
      });
    }
    if (this.requiresStorage(scenario)) {
      resources.push({
        type: "google_storage_bucket",
        name: "storage",
        config: {
          name: `${scenario.id}-storage`,
          project: "${google_project.project.project_id}",
          location: "${var.region}",
          force_destroy: true,
          uniform_bucket_level_access: true
        },
        dependencies: ["google_project.project"]
      });
    }
    if (this.requiresBigQuery(scenario)) {
      resources.push({
        type: "google_bigquery_dataset",
        name: "dataset",
        config: {
          dataset_id: scenario.id.replace(/-/g, "_"),
          project: "${google_project.project.project_id}",
          location: "${var.region}",
          description: `BigQuery dataset for ${scenario.title}`
        },
        dependencies: ["google_project.project"]
      });
    }
    if (this.requiresCloudFunctions(scenario)) {
      resources.push({
        type: "google_storage_bucket",
        name: "functions_bucket",
        config: {
          name: `${scenario.id}-functions`,
          project: "${google_project.project.project_id}",
          location: "${var.region}"
        },
        dependencies: ["google_project.project"]
      });
      resources.push({
        type: "google_cloudfunctions2_function",
        name: "function",
        config: {
          name: `${scenario.id}-function`,
          project: "${google_project.project.project_id}",
          location: "${var.region}",
          description: `Cloud Function for ${scenario.title}`,
          build_config: {
            runtime: "nodejs22",
            entry_point: "handler",
            source: {
              storage_source: {
                bucket: "${google_storage_bucket.functions_bucket.name}",
                object: "${var.function_source_archive}"
              }
            }
          },
          service_config: {
            max_instance_count: 10,
            available_memory: "256M",
            timeout_seconds: 60
          }
        },
        dependencies: ["google_storage_bucket.functions_bucket"]
      });
    }
    for (const step of scenario.steps || []) {
      const stepResources = this.generateResourcesFromStep(step, scenario);
      resources.push(...stepResources);
    }
    return resources;
  }
  /**
   * Generate resources from scenario step
   */
  generateResourcesFromStep(step, scenario) {
    const resources = [];
    if (step.type === "deployment") {
    } else if (step.type === "configuration") {
    } else if (step.type === "test") {
    }
    return resources;
  }
  /**
   * Generate HCL format Terraform configuration
   */
  generateHCL(config, options = {}) {
    let hcl = "";
    hcl += `terraform {
`;
    hcl += `  required_version = ">= ${config.version}"
`;
    hcl += `  required_providers {
`;
    if (config.provider === "gcp") {
      hcl += `    google = {
`;
      hcl += `      source  = "hashicorp/google"
`;
      hcl += `      version = "~> 5.0"
`;
      hcl += `    }
`;
    }
    hcl += `  }
`;
    hcl += `}

`;
    if (config.provider === "gcp") {
      hcl += `provider "google" {
`;
      hcl += `  project = var.project_id
`;
      hcl += `  region  = var.region
`;
      hcl += `}

`;
    }
    if (options.includeVariables !== false) {
      hcl += this.generateVariablesHCL(config);
    }
    for (const resource of config.resources) {
      hcl += this.generateResourceHCL(resource);
    }
    if (options.includeOutputs !== false) {
      hcl += this.generateOutputsHCL(config);
    }
    return hcl;
  }
  /**
   * Generate variables block in HCL
   */
  generateVariablesHCL(config) {
    let hcl = "# Variables\n\n";
    hcl += `variable "project_id" {
`;
    hcl += `  description = "GCP Project ID"
`;
    hcl += `  type        = string
`;
    if (config.projectId) {
      hcl += `  default     = "${config.projectId}"
`;
    }
    hcl += `}

`;
    hcl += `variable "region" {
`;
    hcl += `  description = "GCP Region"
`;
    hcl += `  type        = string
`;
    hcl += `  default     = "${config.region}"
`;
    hcl += `}

`;
    hcl += `variable "billing_account" {
`;
    hcl += `  description = "GCP Billing Account ID"
`;
    hcl += `  type        = string
`;
    hcl += `}

`;
    return hcl;
  }
  /**
   * Generate resource block in HCL
   */
  generateResourceHCL(resource) {
    let hcl = `resource "${resource.type}" "${resource.name}" {
`;
    for (const [key, value] of Object.entries(resource.config)) {
      hcl += this.formatHCLValue(key, value, 2);
    }
    if (resource.dependencies && resource.dependencies.length > 0) {
      hcl += `
  depends_on = [
`;
      for (const dep of resource.dependencies) {
        hcl += `    ${dep},
`;
      }
      hcl += `  ]
`;
    }
    hcl += `}

`;
    return hcl;
  }
  /**
   * Format HCL value with proper indentation
   */
  formatHCLValue(key, value, indent) {
    const spaces = " ".repeat(indent);
    if (typeof value === "string") {
      if (value.startsWith("${") && value.endsWith("}")) {
        return `${spaces}${key} = ${value}
`;
      }
      return `${spaces}${key} = "${value}"
`;
    } else if (typeof value === "number" || typeof value === "boolean") {
      return `${spaces}${key} = ${value}
`;
    } else if (Array.isArray(value)) {
      let result = `${spaces}${key} = [
`;
      for (const item of value) {
        if (typeof item === "string") {
          result += `${spaces}  "${item}",
`;
        } else {
          result += `${spaces}  ${JSON.stringify(item)},
`;
        }
      }
      result += `${spaces}]
`;
      return result;
    } else if (typeof value === "object" && value !== null) {
      let result = `${spaces}${key} {
`;
      for (const [k, v] of Object.entries(value)) {
        result += this.formatHCLValue(k, v, indent + 2);
      }
      result += `${spaces}}
`;
      return result;
    }
    return "";
  }
  /**
   * Generate outputs block in HCL
   */
  generateOutputsHCL(config) {
    let hcl = "# Outputs\n\n";
    const outputs = this.generateOutputs(config);
    for (const [name, output] of Object.entries(outputs)) {
      hcl += `output "${name}" {
`;
      hcl += `  description = "${output.description}"
`;
      hcl += `  value       = ${output.value}
`;
      hcl += `}

`;
    }
    return hcl;
  }
  /**
   * Generate JSON format Terraform configuration
   */
  generateJSON(config, options = {}) {
    const json = {
      terraform: {
        required_version: `>= ${config.version}`,
        required_providers: {}
      },
      provider: {},
      variable: {},
      resource: {},
      output: {}
    };
    if (config.provider === "gcp") {
      json.terraform.required_providers.google = {
        source: "hashicorp/google",
        version: "~> 5.0"
      };
      json.provider.google = {
        project: "${var.project_id}",
        region: "${var.region}"
      };
    }
    if (options.includeVariables !== false) {
      json.variable = this.extractVariables(config);
    }
    for (const resource of config.resources) {
      if (!json.resource[resource.type]) {
        json.resource[resource.type] = {};
      }
      json.resource[resource.type][resource.name] = resource.config;
      if (resource.dependencies && resource.dependencies.length > 0) {
        json.resource[resource.type][resource.name].depends_on = resource.dependencies;
      }
    }
    if (options.includeOutputs !== false) {
      json.output = this.generateOutputs(config);
    }
    return JSON.stringify(json, null, 2);
  }
  /**
   * Extract variables from configuration
   */
  extractVariables(config) {
    return {
      project_id: {
        description: "GCP Project ID",
        type: "string",
        default: config.projectId || null
      },
      region: {
        description: "GCP Region",
        type: "string",
        default: config.region
      },
      billing_account: {
        description: "GCP Billing Account ID",
        type: "string"
      }
    };
  }
  /**
   * Generate output values
   */
  generateOutputs(config) {
    const outputs = {};
    const hasGKE = config.resources.some((r) => r.type === "google_container_cluster");
    if (hasGKE) {
      outputs.gke_cluster_name = {
        description: "GKE Cluster Name",
        value: "${google_container_cluster.primary.name}"
      };
      outputs.gke_cluster_endpoint = {
        description: "GKE Cluster Endpoint",
        value: "${google_container_cluster.primary.endpoint}"
      };
    }
    const hasFirestore = config.resources.some((r) => r.type === "google_firestore_database");
    if (hasFirestore) {
      outputs.firestore_database_name = {
        description: "Firestore Database Name",
        value: "${google_firestore_database.database.name}"
      };
    }
    return outputs;
  }
  /**
   * Helper methods to determine required resources
   */
  requiresGKE(scenario) {
    return scenario.type === "deployment" || scenario.environment === "production" || scenario.steps && scenario.steps.some((s) => s.type === "deployment");
  }
  requiresFirestore(scenario) {
    return true;
  }
  requiresStorage(scenario) {
    return scenario.testData && Object.keys(scenario.testData).length > 0;
  }
  requiresBigQuery(scenario) {
    return scenario.type === "analytics" || scenario.type === "demo";
  }
  requiresCloudFunctions(scenario) {
    return scenario.steps && scenario.steps.some((s) => s.type === "function");
  }
  /**
   * Generate Terraform configuration as downloadable file
   */
  async generateDownloadableFile(scenarioId, format = "hcl") {
    const output = await this.generateTerraformForScenario(scenarioId, { format });
    return {
      filename: output.filename,
      content: Buffer.from(output.content, "utf-8"),
      mimeType: format === "hcl" ? "text/plain" : "application/json"
    };
  }
};
var terraformGenerationService = new TerraformGenerationService();

// src/services/redis-cache-service.ts
var import_redis = require("redis");
var RedisCacheService = class {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.stats = {
      hits: 0,
      misses: 0
    };
  }
  /**
   * Initialize Redis connection
   */
  async connect() {
    if (this.isConnected) {
      return;
    }
    try {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
      this.client = (0, import_redis.createClient)({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error("Max Redis reconnection attempts reached");
              return new Error("Max reconnection attempts reached");
            }
            return Math.min(retries * 100, 3e3);
          }
        }
      });
      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
      });
      this.client.on("connect", () => {
        console.log("[RedisCacheService] Connected to Redis");
      });
      this.client.on("reconnecting", () => {
        console.log("[RedisCacheService] Reconnecting to Redis...");
      });
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      this.isConnected = false;
    }
  }
  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
  /**
   * Check if Redis is connected
   */
  isReady() {
    return this.isConnected && this.client !== null;
  }
  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.isReady()) {
      return null;
    }
    try {
      const value = await this.client.get(key);
      if (value) {
        this.stats.hits++;
        return JSON.parse(value);
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      console.error("Redis GET error:", error);
      this.stats.misses++;
      return null;
    }
  }
  /**
   * Set value in cache with optional TTL
   */
  async set(key, value, options) {
    if (!this.isReady()) {
      return;
    }
    try {
      const serialized = JSON.stringify(value);
      const ttl = options?.ttl || 300;
      await this.client.setEx(key, ttl, serialized);
    } catch (error) {
      console.error("Redis SET error:", error);
    }
  }
  /**
   * Delete value from cache
   */
  async delete(key) {
    if (!this.isReady()) {
      return;
    }
    try {
      await this.client.del(key);
    } catch (error) {
      console.error("Redis DELETE error:", error);
    }
  }
  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(pattern) {
    if (!this.isReady()) {
      return;
    }
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error("Redis DELETE PATTERN error:", error);
    }
  }
  /**
   * Get or set pattern - returns cached value or computes and caches result
   */
  async getOrSet(key, fetchFn, options) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }
    const data = await fetchFn();
    await this.set(key, data, options);
    return data;
  }
  /**
   * Invalidate cache by pattern (e.g., "user:*", "analytics:*")
   */
  async invalidate(pattern) {
    await this.deletePattern(pattern);
  }
  /**
   * Clear all cache
   */
  async flush() {
    if (!this.isReady()) {
      return;
    }
    try {
      await this.client.flushDb();
    } catch (error) {
      console.error("Redis FLUSH error:", error);
    }
  }
  /**
   * Get cache statistics
   */
  async getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    let size = 0;
    if (this.isReady()) {
      try {
        const info = await this.client.info("memory");
        const match = info.match(/used_memory:(\d+)/);
        size = match ? parseInt(match[1], 10) : 0;
      } catch (error) {
        console.error("Error getting cache stats:", error);
      }
    }
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      size
    };
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats.hits = 0;
    this.stats.misses = 0;
  }
  /**
   * Utility: Generate cache key with prefix
   */
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(":")}`;
  }
};
var CacheKeys = {
  // User data
  user: (userId) => `user:${userId}`,
  userByEmail: (email) => `user:email:${email}`,
  userList: (filters) => `users:list:${filters}`,
  // Analytics
  loginAnalytics: (startDate, endDate) => `analytics:login:${startDate}:${endDate}`,
  userActivity: (userId) => `analytics:activity:${userId}`,
  adminAnalytics: (period) => `analytics:admin:${period}`,
  recentActivity: (limit) => `analytics:recent:${limit}`,
  // POVs and TRRs
  pov: (povId) => `pov:${povId}`,
  povList: (filters) => `povs:list:${filters}`,
  trr: (trrId) => `trr:${trrId}`,
  trrList: (filters) => `trrs:list:${filters}`,
  // Sessions
  session: (sessionId) => `session:${sessionId}`,
  userSessions: (userId) => `sessions:user:${userId}`,
  activeSessions: () => "sessions:active"
};
var CacheInvalidationPatterns = {
  // Invalidate all user-related caches
  user: (userId) => [`user:${userId}*`, `analytics:activity:${userId}*`],
  // Invalidate all analytics caches
  analytics: () => ["analytics:*"],
  // Invalidate POV-related caches
  pov: (povId) => [`pov:${povId}*`, "povs:list:*"],
  // Invalidate TRR-related caches
  trr: (trrId) => [`trr:${trrId}*`, "trrs:list:*"],
  // Invalidate session caches
  sessions: (userId) => [`sessions:user:${userId}*`, "sessions:active*"]
};
var redisCacheInstance = null;
function getRedisCacheService() {
  if (!redisCacheInstance) {
    redisCacheInstance = new RedisCacheService();
  }
  return redisCacheInstance;
}
var redisCacheService = getRedisCacheService();

// src/services/event-tracking-service.ts
var EventTrackingService = class {
  /**
   * Log a user activity event
   */
  async logActivity(event) {
    try {
      const db2 = getDatabase();
      await db2.create("activityLogs", {
        userId: event.userId,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        entityTitle: event.entityTitle,
        metadata: event.metadata,
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  }
  /**
   * Log a user login event
   */
  async logLogin(event) {
    try {
      const db2 = getDatabase();
      await db2.create("loginEvents", {
        userId: event.userId,
        email: event.email,
        loginMethod: event.loginMethod,
        success: event.success,
        failureReason: event.failureReason,
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        location: event.location,
        deviceType: event.deviceType,
        browser: event.browser,
        os: event.os,
        timestamp: /* @__PURE__ */ new Date()
      });
      if (event.success) {
        await this.logActivity({
          userId: event.userId,
          action: "login",
          entityType: "User",
          entityId: event.userId,
          metadata: {
            method: event.loginMethod,
            deviceType: event.deviceType
          },
          sessionId: event.sessionId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent
        });
      }
    } catch (error) {
      console.error("Error logging login event:", error);
    }
  }
  /**
   * Create or update a user session
   */
  async createSession(session) {
    try {
      const db2 = getDatabase();
      const existingSession = await db2.findByField(
        "userSessions",
        "sessionId",
        session.sessionId
      );
      if (existingSession) {
        await db2.update("userSessions", existingSession.id, {
          lastActivity: /* @__PURE__ */ new Date(),
          isActive: true
        });
      } else {
        await db2.create("userSessions", {
          userId: session.userId,
          sessionId: session.sessionId,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          isActive: true,
          lastActivity: /* @__PURE__ */ new Date(),
          createdAt: /* @__PURE__ */ new Date(),
          expiresAt: session.expiresAt
        });
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  }
  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId) {
    try {
      const db2 = getDatabase();
      const session = await db2.findByField("userSessions", "sessionId", sessionId);
      if (session) {
        await db2.update("userSessions", session.id, {
          lastActivity: /* @__PURE__ */ new Date()
        });
      }
    } catch (error) {
      console.error("Error updating session activity:", error);
    }
  }
  /**
   * End a user session
   */
  async endSession(sessionId) {
    try {
      const db2 = getDatabase();
      const session = await db2.findByField("userSessions", "sessionId", sessionId);
      if (session) {
        await db2.update("userSessions", session.id, {
          isActive: false
        });
      }
    } catch (error) {
      console.error("Error ending session:", error);
    }
  }
  /**
   * Get login analytics for a time period (with Redis caching)
   */
  async getLoginAnalytics(startDate, endDate) {
    const cacheKey = CacheKeys.loginAnalytics(
      startDate.toISOString(),
      endDate.toISOString()
    );
    const cached = await redisCacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const db2 = getDatabase();
      const loginEvents = await db2.findMany("loginEvents", {
        filters: [
          { field: "timestamp", operator: ">=", value: startDate },
          { field: "timestamp", operator: "<=", value: endDate }
        ],
        orderBy: "timestamp",
        orderDirection: "desc"
      });
      const totalLogins = loginEvents.length;
      const successfulLogins = loginEvents.filter((e) => e.success).length;
      const failedLogins = totalLogins - successfulLogins;
      const uniqueUsers = new Set(loginEvents.map((e) => e.userId)).size;
      const loginsByMethod = {};
      loginEvents.forEach((event) => {
        loginsByMethod[event.loginMethod] = (loginsByMethod[event.loginMethod] || 0) + 1;
      });
      const loginsByDay = [];
      const dayMap = /* @__PURE__ */ new Map();
      loginEvents.forEach((event) => {
        const date = new Date(event.timestamp).toISOString().split("T")[0];
        dayMap.set(date, (dayMap.get(date) || 0) + 1);
      });
      dayMap.forEach((count, date) => {
        loginsByDay.push({ date, count });
      });
      loginsByDay.sort((a, b) => a.date.localeCompare(b.date));
      const recentLogins = loginEvents.slice(0, 50);
      const analytics = {
        totalLogins,
        successfulLogins,
        failedLogins,
        uniqueUsers,
        loginsByMethod,
        loginsByDay,
        recentLogins
      };
      await redisCacheService.set(cacheKey, analytics, { ttl: 600 });
      return analytics;
    } catch (error) {
      console.error("Error getting login analytics:", error);
      return {
        totalLogins: 0,
        successfulLogins: 0,
        failedLogins: 0,
        uniqueUsers: 0,
        loginsByMethod: {},
        loginsByDay: [],
        recentLogins: []
      };
    }
  }
  /**
   * Get user activity analytics (with Redis caching)
   */
  async getUserActivityAnalytics(userId) {
    const cacheKey = CacheKeys.userActivity(userId);
    const cached = await redisCacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const db2 = getDatabase();
      const activities = await db2.findMany("activityLogs", {
        filters: [{ field: "userId", operator: "==", value: userId }],
        orderBy: "timestamp",
        orderDirection: "desc"
      });
      const totalActions = activities.length;
      const actionsByType = {};
      activities.forEach((activity) => {
        actionsByType[activity.action] = (actionsByType[activity.action] || 0) + 1;
      });
      const recentActivity = activities.slice(0, 50);
      const lastActive = activities.length > 0 ? new Date(activities[0].timestamp) : null;
      const sessions = await db2.findMany("userSessions", {
        filters: [
          { field: "userId", operator: "==", value: userId },
          { field: "isActive", operator: "==", value: true }
        ]
      });
      const analytics = {
        userId,
        totalActions,
        actionsByType,
        recentActivity,
        lastActive,
        sessionsCount: sessions.length
      };
      await redisCacheService.set(cacheKey, analytics, { ttl: 300 });
      return analytics;
    } catch (error) {
      console.error("Error getting user activity analytics:", error);
      return {
        userId,
        totalActions: 0,
        actionsByType: {},
        recentActivity: [],
        lastActive: null,
        sessionsCount: 0
      };
    }
  }
  /**
   * Get recent activity logs for admin dashboard
   */
  async getRecentActivity(limit = 100) {
    try {
      const db2 = getDatabase();
      const activities = await db2.findMany("activityLogs", {
        orderBy: "timestamp",
        orderDirection: "desc",
        limit
      });
      return activities;
    } catch (error) {
      console.error("Error getting recent activity:", error);
      return [];
    }
  }
  /**
   * Get active user sessions
   */
  async getActiveSessions(userId) {
    try {
      const db2 = getDatabase();
      const filters = [
        { field: "isActive", operator: "==", value: true }
      ];
      if (userId) {
        filters.push({ field: "userId", operator: "==", value: userId });
      }
      const sessions = await db2.findMany("userSessions", {
        filters,
        orderBy: "lastActivity",
        orderDirection: "desc"
      });
      return sessions;
    } catch (error) {
      console.error("Error getting active sessions:", error);
      return [];
    }
  }
  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    try {
      const db2 = getDatabase();
      const expiredSessions = await db2.findMany("userSessions", {
        filters: [
          { field: "expiresAt", operator: "<", value: /* @__PURE__ */ new Date() },
          { field: "isActive", operator: "==", value: true }
        ]
      });
      for (const session of expiredSessions) {
        await db2.update("userSessions", session.id, {
          isActive: false
        });
      }
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
    }
  }
};
var eventTrackingService = new EventTrackingService();

// src/services/migration/record-processing-orchestrator.ts
var import_events = require("events");
var DEFAULT_CONFIG = {
  initialBatchSize: 1e3,
  minBatchSize: 100,
  maxBatchSize: 1e4,
  maxParallelBatches: 8,
  maxWorkersPerBatch: 4,
  memoryThresholdMB: 1024,
  dbConnectionPoolSize: 20,
  prefetchSize: 5e3,
  maxRetries: 3,
  retryBackoffMs: [1e3, 5e3, 15e3],
  errorThresholdPercent: 10,
  pauseBetweenBatchesMs: 100,
  healthCheckIntervalMs: 5e3,
  progressReportIntervalMs: 2e3
};
var FastValidationStage = class {
  async process(records) {
    const results = {
      valid: [],
      invalid: [],
      warnings: []
    };
    const chunkSize = Math.ceil(records.length / 4);
    const chunks = this.chunkArray(records, chunkSize);
    for (const chunk of chunks) {
      const validChunk = chunk.filter((record) => this.validateRecord(record));
      results.valid.push(...validChunk);
    }
    return results;
  }
  validateRecord(record) {
    return record.rawData && Object.keys(record.rawData).length > 0;
  }
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
};
var TransformationStage = class {
  constructor() {
    this.transformationCache = /* @__PURE__ */ new Map();
  }
  async process(records, config) {
    const orderedTransforms = config.transformations.sort((a, b) => a.order - b.order);
    const results = await Promise.all(
      records.map((record) => this.transformRecord(record, orderedTransforms))
    );
    return results;
  }
  async transformRecord(record, transforms) {
    let data = { ...record.rawData };
    for (const transform of transforms) {
      const cacheKey = this.getCacheKey(transform, data);
      if (this.transformationCache.has(cacheKey)) {
        data = this.transformationCache.get(cacheKey);
        continue;
      }
      data = await this.applyTransformation(data, transform);
      if (this.isDeterministic(transform)) {
        this.transformationCache.set(cacheKey, data);
      }
    }
    return {
      id: record.id,
      originalData: record.rawData,
      transformedData: data,
      timestamp: /* @__PURE__ */ new Date()
    };
  }
  getCacheKey(transform, data) {
    return `${transform.id}:${JSON.stringify(data)}`;
  }
  isDeterministic(transform) {
    return !["timestamp", "now", "random"].includes(transform.type);
  }
  async applyTransformation(data, transform) {
    switch (transform.type) {
      case "trim":
        return Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
        );
      case "lowercase":
        return Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, typeof v === "string" ? v.toLowerCase() : v])
        );
      case "uppercase":
        return Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, typeof v === "string" ? v.toUpperCase() : v])
        );
      default:
        return data;
    }
  }
};
var DatabaseValidationStage = class {
  constructor() {
    this.validationCache = /* @__PURE__ */ new Map();
    this.batchLookupCache = /* @__PURE__ */ new Map();
  }
  async process(records) {
    const db2 = getDatabase();
    await this.prefetchValidationData(records, db2);
    const validationPromises = records.map(
      (record) => this.validateRecord(record, db2)
    );
    const results = await Promise.all(validationPromises);
    return this.aggregateResults(results);
  }
  async prefetchValidationData(records, db2) {
    const foreignKeyChecks = this.extractForeignKeys(records);
    for (const [entity, ids] of Array.from(foreignKeyChecks.entries())) {
      try {
        const existingRecords = await db2.findMany(entity, {
          filters: [{ field: "id", operator: "in", value: Array.from(ids) }]
        });
        this.batchLookupCache.set(entity, new Set(existingRecords.map((r) => r.id)));
      } catch (error) {
        console.error(`Failed to prefetch ${entity}:`, error);
      }
    }
  }
  extractForeignKeys(records) {
    const foreignKeys = /* @__PURE__ */ new Map();
    records.forEach((record) => {
      Object.entries(record.transformedData).forEach(([key, value]) => {
        if (key.endsWith("_id") || key.endsWith("Id")) {
          const entity = key.replace(/_?id$/i, "");
          if (!foreignKeys.has(entity)) {
            foreignKeys.set(entity, /* @__PURE__ */ new Set());
          }
          foreignKeys.get(entity).add(value);
        }
      });
    });
    return foreignKeys;
  }
  async validateRecord(record, db2) {
    const errors = [];
    for (const [key, value] of Object.entries(record.transformedData)) {
      if (key.endsWith("_id") || key.endsWith("Id")) {
        const entity = key.replace(/_?id$/i, "");
        const cache = this.batchLookupCache.get(entity);
        if (cache && !cache.has(value)) {
          errors.push({
            field: key,
            ruleId: "foreign_key",
            severity: "error",
            message: `Referenced ${entity} does not exist`,
            currentValue: value
          });
        }
      }
    }
    return { record, errors };
  }
  aggregateResults(results) {
    return {
      valid: results.filter((r) => r.errors.length === 0).map((r) => r.record),
      invalid: results.filter((r) => r.errors.some((e) => e.severity === "error")),
      warnings: results.filter((r) => r.errors.length > 0 && r.errors.every((e) => e.severity === "warning"))
    };
  }
};
var DatabaseWriteStage = class {
  async process(records, config) {
    const db2 = getDatabase();
    const batchSize = 500;
    const batches = this.chunkArray(records, batchSize);
    const results = {
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: []
    };
    for (const batch of batches) {
      try {
        const created = await db2.createMany(config.targetTable, batch.map((r) => r.transformedData));
        results.inserted += created.length;
      } catch (error) {
        results.failed += batch.length;
        results.errors.push({
          batch: batch.map((r) => r.id),
          error: error.message
        });
      }
    }
    return results;
  }
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
};
var RecordProcessingOrchestrator = class extends import_events.EventEmitter {
  constructor(config = {}) {
    super();
    this.isPaused = false;
    this.isHealthy = true;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = this.initializeMetrics();
  }
  async processImportJob(jobId) {
    this.emit("job:started", { jobId });
    try {
      const db2 = getDatabase();
      const stages = {
        validation: new FastValidationStage(),
        transformation: new TransformationStage(),
        dbValidation: new DatabaseValidationStage(),
        write: new DatabaseWriteStage()
      };
      this.startHealthMonitoring();
      this.startProgressReporting(jobId);
      let currentBatchSize = this.config.initialBatchSize;
      let offset = 0;
      let hasMoreRecords = true;
      while (hasMoreRecords && this.isHealthy && !this.isPaused) {
        const records = await this.fetchStagingRecords(
          jobId,
          offset,
          currentBatchSize
        );
        if (records.length === 0) {
          hasMoreRecords = false;
          break;
        }
        const startTime = Date.now();
        await this.processBatch(records, stages, jobId);
        const processingTime = Date.now() - startTime;
        this.updateMetrics(records.length, processingTime);
        currentBatchSize = this.adjustBatchSize(currentBatchSize, processingTime);
        offset += records.length;
        if (this.config.pauseBetweenBatchesMs > 0) {
          await this.sleep(this.config.pauseBetweenBatchesMs);
        }
        if (this.shouldPauseOnErrors()) {
          this.isPaused = true;
          this.emit("job:paused", {
            jobId,
            reason: "Error threshold exceeded",
            errorRate: this.metrics.errorRate
          });
          break;
        }
      }
      return this.finalizeJob(jobId);
    } catch (error) {
      this.emit("job:failed", { jobId, error: error.message });
      throw error;
    } finally {
      this.stopMonitoring();
    }
  }
  async processBatch(records, stages, jobId) {
    const startTime = Date.now();
    try {
      const validationResult = await stages.validation.process(records);
      this.emit("batch:validated", {
        valid: validationResult.valid.length,
        invalid: validationResult.invalid.length
      });
      if (validationResult.valid.length === 0) {
        await this.handleInvalidRecords(validationResult.invalid, jobId);
        return;
      }
      const transformedRecords = await stages.transformation.process(
        validationResult.valid,
        await this.getJobConfig(jobId)
      );
      this.emit("batch:transformed", { count: transformedRecords.length });
      const dbValidationResult = await stages.dbValidation.process(transformedRecords);
      if (dbValidationResult.valid.length === 0) {
        await this.handleInvalidRecords(dbValidationResult.invalid, jobId);
        return;
      }
      const writeResult = await stages.write.process(
        dbValidationResult.valid,
        await this.getJobConfig(jobId)
      );
      this.emit("batch:written", writeResult);
      await this.updateStagingRecordsStatus(records, writeResult);
      this.metrics.totalProcessed += records.length;
      this.metrics.successfulRecords += writeResult.inserted + writeResult.updated;
      this.metrics.failedRecords += writeResult.failed;
    } catch (error) {
      this.emit("batch:error", { error: error.message });
      this.metrics.batchErrors++;
      throw error;
    }
    const processingTime = Date.now() - startTime;
    this.metrics.averageProcessingTimeMs = (this.metrics.averageProcessingTimeMs * this.metrics.batchesProcessed + processingTime) / (this.metrics.batchesProcessed + 1);
    this.metrics.batchesProcessed++;
  }
  adjustBatchSize(currentSize, processingTimeMs) {
    const targetProcessingTime = 5e3;
    if (processingTimeMs < targetProcessingTime * 0.5) {
      return Math.min(currentSize * 1.5, this.config.maxBatchSize);
    } else if (processingTimeMs > targetProcessingTime * 1.5) {
      return Math.max(currentSize * 0.7, this.config.minBatchSize);
    }
    return currentSize;
  }
  shouldPauseOnErrors() {
    return this.metrics.errorRate > this.config.errorThresholdPercent;
  }
  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
      if (heapUsedMB > this.config.memoryThresholdMB) {
        this.isHealthy = false;
        this.emit("health:warning", {
          reason: "Memory threshold exceeded",
          heapUsedMB
        });
      }
    }, this.config.healthCheckIntervalMs);
  }
  startProgressReporting(jobId) {
    this.progressInterval = setInterval(() => {
      this.emit("progress:update", {
        jobId,
        metrics: this.metrics,
        timestamp: /* @__PURE__ */ new Date()
      });
    }, this.config.progressReportIntervalMs);
  }
  stopMonitoring() {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.progressInterval) clearInterval(this.progressInterval);
  }
  async fetchStagingRecords(jobId, offset, limit) {
    const db2 = getDatabase();
    try {
      const records = await db2.findMany("stagingRecords", {
        filters: [
          { field: "importJobId", operator: "==", value: jobId },
          { field: "processingStatus", operator: "==", value: "pending" }
        ],
        orderBy: "rowNumber",
        orderDirection: "asc",
        limit,
        offset
      });
      return records;
    } catch (error) {
      console.error("Failed to fetch staging records:", error);
      return [];
    }
  }
  initializeMetrics() {
    return {
      totalProcessed: 0,
      successfulRecords: 0,
      failedRecords: 0,
      batchesProcessed: 0,
      batchErrors: 0,
      averageProcessingTimeMs: 0,
      errorRate: 0,
      throughputRecordsPerSecond: 0,
      startTime: /* @__PURE__ */ new Date()
    };
  }
  updateMetrics(recordCount, processingTimeMs) {
    const throughput = recordCount / processingTimeMs * 1e3;
    this.metrics.throughputRecordsPerSecond = (this.metrics.throughputRecordsPerSecond * this.metrics.batchesProcessed + throughput) / (this.metrics.batchesProcessed + 1);
    this.metrics.errorRate = this.metrics.failedRecords / Math.max(this.metrics.totalProcessed, 1) * 100;
  }
  async finalizeJob(jobId) {
    this.emit("job:completed", {
      jobId,
      metrics: this.metrics
    });
    return {
      jobId,
      status: "completed",
      metrics: this.metrics,
      duration: Date.now() - this.metrics.startTime.getTime()
    };
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async getJobConfig(jobId) {
    const db2 = getDatabase();
    try {
      const job = await db2.findOne("dataImportJobs", jobId);
      return job.configuration;
    } catch (error) {
      console.error("Failed to get job config:", error);
      throw error;
    }
  }
  async handleInvalidRecords(invalid, jobId) {
    const db2 = getDatabase();
    const ids = invalid.map((r) => r.record?.id || r.id);
    await db2.updateMany("stagingRecords", ids, {
      processingStatus: "failed",
      validationStatus: "invalid"
    });
  }
  async updateStagingRecordsStatus(records, writeResult) {
    const db2 = getDatabase();
    const successIds = records.map((r) => r.id);
    await db2.updateMany("stagingRecords", successIds, {
      processingStatus: "processed"
    });
  }
};

// src/services/search/opensearch-service.ts
var import_opensearch = require("@opensearch-project/opensearch");
var OpenSearchService = class {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.indexes = ["povs", "trrs", "users", "projects"];
  }
  /**
   * Connect to OpenSearch cluster
   */
  async connect() {
    try {
      const node = process.env.OPENSEARCH_URL || "http://localhost:9200";
      const username = process.env.OPENSEARCH_USERNAME || "";
      const password = process.env.OPENSEARCH_PASSWORD || "";
      this.client = new import_opensearch.Client({
        node,
        ...username && password ? {
          auth: {
            username,
            password
          }
        } : {},
        ssl: {
          rejectUnauthorized: process.env.NODE_ENV === "production"
        }
      });
      const health = await this.client.cluster.health({});
      console.log("[OpenSearch] Connected successfully. Status:", health.body.status);
      this.isConnected = true;
      await this.createIndexes();
    } catch (error) {
      console.error("[OpenSearch] Connection failed:", error);
      this.isConnected = false;
    }
  }
  /**
   * Disconnect from OpenSearch
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log("[OpenSearch] Disconnected");
    }
  }
  /**
   * Check if connected to OpenSearch
   */
  isReady() {
    return this.isConnected && this.client !== null;
  }
  /**
   * Create indexes with optimized settings
   */
  async createIndexes() {
    if (!this.client) return;
    for (const index of this.indexes) {
      try {
        const { body: exists } = await this.client.indices.exists({ index });
        if (!exists) {
          await this.client.indices.create({
            index,
            body: {
              settings: {
                number_of_shards: 1,
                number_of_replicas: process.env.NODE_ENV === "production" ? 1 : 0,
                max_result_window: 1e4,
                analysis: {
                  analyzer: {
                    autocomplete: {
                      type: "custom",
                      tokenizer: "standard",
                      filter: ["lowercase", "autocomplete_filter"]
                    },
                    autocomplete_search: {
                      type: "custom",
                      tokenizer: "standard",
                      filter: ["lowercase"]
                    }
                  },
                  filter: {
                    autocomplete_filter: {
                      type: "edge_ngram",
                      min_gram: 2,
                      max_gram: 20
                    }
                  }
                }
              },
              mappings: {
                properties: {
                  // Common fields
                  title: {
                    type: "text",
                    analyzer: "autocomplete",
                    search_analyzer: "autocomplete_search",
                    fields: {
                      keyword: { type: "keyword" },
                      raw: { type: "text", analyzer: "standard" }
                    }
                  },
                  description: {
                    type: "text",
                    analyzer: "standard"
                  },
                  status: {
                    type: "keyword"
                  },
                  owner: {
                    type: "keyword"
                  },
                  createdBy: {
                    type: "keyword"
                  },
                  createdAt: {
                    type: "date"
                  },
                  updatedAt: {
                    type: "date"
                  },
                  // User-specific fields
                  email: {
                    type: "text",
                    fields: {
                      keyword: { type: "keyword" }
                    }
                  },
                  displayName: {
                    type: "text",
                    analyzer: "autocomplete",
                    search_analyzer: "autocomplete_search"
                  },
                  role: {
                    type: "keyword"
                  },
                  // POV/TRR specific fields
                  customer: {
                    type: "text",
                    fields: {
                      keyword: { type: "keyword" }
                    }
                  },
                  industry: {
                    type: "keyword"
                  },
                  priority: {
                    type: "keyword"
                  },
                  // Flexible metadata field
                  metadata: {
                    type: "object",
                    enabled: true
                  }
                }
              }
            }
          });
          console.log(`[OpenSearch] Created index: ${index}`);
        }
      } catch (error) {
        console.error(`[OpenSearch] Error creating index ${index}:`, error);
      }
    }
  }
  /**
   * Index a single document
   */
  async indexDocument(type, id, document) {
    if (!this.isReady()) return;
    try {
      await this.client.index({
        index: type,
        id,
        body: document,
        refresh: true
      });
      await redisCacheService.invalidate(`search:*`);
      console.log(`[OpenSearch] Indexed document: ${type}/${id}`);
    } catch (error) {
      console.error(`[OpenSearch] Error indexing document:`, error);
    }
  }
  /**
   * Bulk index multiple documents (optimized for large datasets)
   */
  async bulkIndex(type, documents) {
    if (!this.isReady() || documents.length === 0) return;
    try {
      const body = documents.flatMap(({ id, doc: doc2 }) => [
        { index: { _index: type, _id: id } },
        doc2
      ]);
      const response = await this.client.bulk({
        body,
        refresh: true
      });
      if (response.body.errors) {
        const errors = response.body.items.filter((item) => item.index?.error).map((item) => item.index.error);
        console.error(`[OpenSearch] Bulk indexing errors:`, errors);
      } else {
        console.log(`[OpenSearch] Bulk indexed ${documents.length} documents in ${type}`);
      }
      await redisCacheService.invalidate(`search:*`);
    } catch (error) {
      console.error(`[OpenSearch] Error bulk indexing:`, error);
    }
  }
  /**
   * Search across indexes with advanced features
   */
  async search(options) {
    if (!this.isReady()) {
      console.warn("[OpenSearch] Service not ready, returning empty results");
      return [];
    }
    try {
      const {
        query: query2,
        types = [],
        limit = 10,
        offset = 0,
        filters = {}
      } = options;
      const cacheKey = `search:${query2}:${types.join(",")}:${limit}:${offset}`;
      const cached = await redisCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
      const must = [];
      const should = [
        // Multi-match across key fields with boosting
        {
          multi_match: {
            query: query2,
            fields: [
              "title^3",
              // Boost title matches
              "displayName^3",
              // Boost name matches
              "email^2",
              // Email matches
              "description^2",
              // Description matches
              "customer^2",
              // Customer name matches
              "metadata.*"
              // Metadata fields
            ],
            type: "best_fields",
            fuzziness: "AUTO",
            prefix_length: 2
          }
        },
        // Phrase prefix for autocomplete
        {
          match_phrase_prefix: {
            title: {
              query: query2,
              boost: 2
            }
          }
        },
        // Exact match boost
        {
          term: {
            "title.keyword": {
              value: query2,
              boost: 5
            }
          }
        }
      ];
      Object.entries(filters).forEach(([field, value]) => {
        must.push({
          term: { [field]: value }
        });
      });
      const searchBody = {
        query: {
          bool: {
            must,
            should,
            minimum_should_match: must.length === 0 ? 1 : 0
          }
        },
        from: offset,
        size: limit,
        highlight: {
          fields: {
            title: {},
            description: {},
            displayName: {},
            customer: {}
          },
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"]
        },
        // Sort by relevance, then by date
        sort: [
          "_score",
          { createdAt: { order: "desc" } }
        ]
      };
      const indexes = types.length > 0 ? types.join(",") : this.indexes.join(",");
      const { body } = await this.client.search({
        index: indexes,
        body: searchBody
      });
      const results = body.hits.hits.map((hit) => ({
        id: hit._id,
        type: hit._index,
        title: hit._source.title || hit._source.displayName || hit._source.name || "Untitled",
        description: hit._source.description,
        metadata: {
          status: hit._source.status,
          createdAt: hit._source.createdAt,
          owner: hit._source.owner || hit._source.createdBy,
          customer: hit._source.customer,
          industry: hit._source.industry,
          priority: hit._source.priority,
          role: hit._source.role,
          email: hit._source.email
        },
        score: hit._score,
        highlight: hit.highlight
      }));
      await redisCacheService.set(cacheKey, results, { ttl: 120 });
      return results;
    } catch (error) {
      console.error("[OpenSearch] Search error:", error);
      return [];
    }
  }
  /**
   * Update an existing document
   */
  async updateDocument(type, id, doc2) {
    if (!this.isReady()) return;
    try {
      await this.client.update({
        index: type,
        id,
        body: {
          doc: doc2
        },
        refresh: true
      });
      await redisCacheService.invalidate(`search:*`);
      console.log(`[OpenSearch] Updated document: ${type}/${id}`);
    } catch (error) {
      console.error(`[OpenSearch] Error updating document:`, error);
    }
  }
  /**
   * Delete a document from the index
   */
  async deleteDocument(type, id) {
    if (!this.isReady()) return;
    try {
      await this.client.delete({
        index: type,
        id,
        refresh: true
      });
      await redisCacheService.invalidate(`search:*`);
      console.log(`[OpenSearch] Deleted document: ${type}/${id}`);
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        console.warn(`[OpenSearch] Document not found: ${type}/${id}`);
      } else {
        console.error(`[OpenSearch] Error deleting document:`, error);
      }
    }
  }
  /**
   * Get suggestions for autocomplete
   */
  async getSuggestions(query2, type, limit = 5) {
    if (!this.isReady() || query2.length < 2) return [];
    try {
      const indexes = type ? type : this.indexes.join(",");
      const { body } = await this.client.search({
        index: indexes,
        body: {
          suggest: {
            text: query2,
            completion: {
              field: "title.keyword",
              size: limit,
              skip_duplicates: true
            }
          }
        }
      });
      const options = body.suggest?.completion?.[0]?.options;
      if (Array.isArray(options)) {
        return options.map((opt) => opt.text);
      }
      return [];
    } catch (error) {
      console.error("[OpenSearch] Error getting suggestions:", error);
      return [];
    }
  }
  /**
   * Get index statistics
   */
  async getIndexStats(type) {
    if (!this.isReady()) return null;
    try {
      const { body } = await this.client.count({ index: type });
      const totalDocuments = body.count;
      const { body: stats } = await this.client.indices.stats({ index: type });
      const indexSize = stats.indices?.[type]?.total?.store?.size_in_bytes || 0;
      return {
        totalDocuments,
        indexSize: this.formatBytes(indexSize),
        lastIndexed: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.error(`[OpenSearch] Error getting stats for ${type}:`, error);
      return null;
    }
  }
  /**
   * Reindex all documents from database (useful for initial setup)
   */
  async reindexAll() {
    if (!this.isReady()) {
      throw new Error("OpenSearch not connected");
    }
    console.log("[OpenSearch] Starting full reindex...");
    console.log("[OpenSearch] Reindex completed");
  }
  /**
   * Delete an entire index
   */
  async deleteIndex(type) {
    if (!this.isReady()) return;
    try {
      await this.client.indices.delete({ index: type });
      console.log(`[OpenSearch] Deleted index: ${type}`);
    } catch (error) {
      console.error(`[OpenSearch] Error deleting index ${type}:`, error);
    }
  }
  /**
   * Format bytes to human-readable size
   */
  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }
};
var openSearchService = new OpenSearchService();

// src/services/search/memgraph-service.ts
var import_neo4j_driver = __toESM(require("neo4j-driver"));
var MemgraphService = class {
  constructor() {
    this.driver = null;
    this.isConnected = false;
  }
  /**
   * Connect to Memgraph database
   */
  async connect() {
    try {
      const uri = process.env.MEMGRAPH_URI || "bolt://localhost:7687";
      const user = process.env.MEMGRAPH_USER || "";
      const password = process.env.MEMGRAPH_PASSWORD || "";
      this.driver = import_neo4j_driver.default.driver(
        uri,
        user && password ? import_neo4j_driver.default.auth.basic(user, password) : {}
      );
      await this.driver.verifyConnectivity();
      this.isConnected = true;
      console.log("[Memgraph] Connected successfully");
      await this.createConstraintsAndIndexes();
    } catch (error) {
      console.error("[Memgraph] Connection failed:", error);
      this.isConnected = false;
    }
  }
  /**
   * Disconnect from Memgraph
   */
  async disconnect() {
    if (this.driver) {
      await this.driver.close();
      this.isConnected = false;
      console.log("[Memgraph] Disconnected");
    }
  }
  /**
   * Check if connected to Memgraph
   */
  isReady() {
    return this.isConnected && this.driver !== null;
  }
  /**
   * Get a database session
   */
  getSession() {
    if (!this.driver) {
      throw new Error("Memgraph driver not initialized");
    }
    return this.driver.session();
  }
  /**
   * Create database constraints and indexes
   */
  async createConstraintsAndIndexes() {
    const session = this.getSession();
    try {
      const indexQueries = [
        "CREATE INDEX ON :User(id);",
        "CREATE INDEX ON :POV(id);",
        "CREATE INDEX ON :TRR(id);",
        "CREATE INDEX ON :Project(id);",
        "CREATE INDEX ON :User(id);"
      ];
      for (const query2 of indexQueries) {
        try {
          await session.run(query2);
        } catch (error) {
          if (!error.message.includes("already exists")) {
            console.warn(`[Memgraph] Index creation warning:`, error.message);
          }
        }
      }
      console.log("[Memgraph] Constraints and indexes created");
    } catch (error) {
      console.error("[Memgraph] Error creating constraints:", error);
    } finally {
      await session.close();
    }
  }
  /**
   * Track a user interaction
   */
  async trackInteraction(interaction) {
    if (!this.isReady()) {
      console.warn("[Memgraph] Service not ready, skipping interaction tracking");
      return;
    }
    const session = this.getSession();
    try {
      const { userId, action, entityType, entityId, metadata = {}, timestamp } = interaction;
      const query2 = `
        MERGE (u:User {id: $userId})
        MERGE (e:${entityType} {id: $entityId})
        CREATE (u)-[r:${action.toUpperCase().replace(/-/g, "_")} {
          timestamp: datetime($timestamp),
          metadata: $metadata
        }]->(e)
        RETURN u, e, r
      `;
      await session.run(query2, {
        userId,
        entityId,
        timestamp: (timestamp || /* @__PURE__ */ new Date()).toISOString(),
        metadata: JSON.stringify(metadata)
      });
      console.log(`[Memgraph] Tracked interaction: ${userId} -[${action}]-> ${entityType}:${entityId}`);
    } catch (error) {
      console.error("[Memgraph] Error tracking interaction:", error);
    } finally {
      await session.close();
    }
  }
  /**
   * Get personalized recommendations for a user
   * Uses collaborative filtering based on similar users' interactions
   */
  async getRecommendations(userId, limit = 10) {
    if (!this.isReady()) return [];
    const session = this.getSession();
    try {
      const query2 = `
        MATCH (u:User {id: $userId})-[r1]->(e)
        MATCH (similar:User)-[r2]->(e)
        WHERE u <> similar

        WITH similar,
             COUNT(DISTINCT e) AS commonInterests,
             COUNT(r2) AS totalInteractions
        ORDER BY commonInterests DESC, totalInteractions DESC
        LIMIT 20

        MATCH (similar)-[r]->(recommended)
        WHERE NOT (u)-[]->(recommended)
          AND type(r) IN ['VIEW', 'CLICK', 'SEARCH_CLICK']

        WITH recommended,
             labels(recommended)[0] AS entityType,
             type(r) AS interactionType,
             COUNT(DISTINCT similar) AS userCount,
             COUNT(r) AS interactionCount,
             MAX(commonInterests) AS maxCommonInterests

        WITH recommended,
             entityType,
             userCount,
             interactionCount,
             maxCommonInterests,
             (userCount * 1.0 / 20.0) * (interactionCount * 1.0 / (userCount * 1.0)) * maxCommonInterests AS score,
             (userCount * 1.0 / 20.0) AS confidence

        RETURN
          recommended.id AS entityId,
          entityType,
          score,
          confidence,
          'Users similar to you also viewed this' AS reason,
          userCount,
          interactionCount
        ORDER BY score DESC
        LIMIT $limit
      `;
      const result = await session.run(query2, { userId, limit });
      return result.records.map((record) => ({
        entityId: record.get("entityId"),
        entityType: record.get("entityType"),
        score: record.get("score"),
        confidence: Math.min(record.get("confidence"), 1),
        reason: `${record.get("userCount")} similar users interacted with this ${record.get("interactionCount")} times`
      }));
    } catch (error) {
      console.error("[Memgraph] Error getting recommendations:", error);
      return [];
    } finally {
      await session.close();
    }
  }
  /**
   * Get trending entities based on recent interactions
   */
  async getTrending(entityType, days = 7, limit = 10) {
    if (!this.isReady()) return [];
    const session = this.getSession();
    try {
      const typeFilter = entityType ? `:${entityType}` : "";
      const query2 = `
        MATCH (u:User)-[r]->(e${typeFilter})
        WHERE r.timestamp > datetime() - duration({days: $days})

        WITH e,
             labels(e)[0] AS entityType,
             COUNT(r) AS interactionCount,
             COUNT(DISTINCT u) AS uniqueUsers

        WITH e,
             entityType,
             interactionCount,
             uniqueUsers,
             (interactionCount * 1.0 * uniqueUsers * 1.0) / $days AS trendScore

        RETURN
          e.id AS entityId,
          entityType,
          interactionCount,
          uniqueUsers,
          trendScore
        ORDER BY trendScore DESC
        LIMIT $limit
      `;
      const result = await session.run(query2, { days, limit });
      return result.records.map((record) => ({
        entityId: record.get("entityId"),
        entityType: record.get("entityType"),
        interactionCount: record.get("interactionCount").toNumber(),
        uniqueUsers: record.get("uniqueUsers").toNumber(),
        trendScore: record.get("trendScore")
      }));
    } catch (error) {
      console.error("[Memgraph] Error getting trending:", error);
      return [];
    } finally {
      await session.close();
    }
  }
  /**
   * Get user's interaction history
   */
  async getUserInteractions(userId, limit = 50) {
    if (!this.isReady()) return [];
    const session = this.getSession();
    try {
      const query2 = `
        MATCH (u:User {id: $userId})-[r]->(e)
        RETURN
          type(r) AS action,
          labels(e)[0] AS entityType,
          e.id AS entityId,
          r.timestamp AS timestamp,
          r.metadata AS metadata
        ORDER BY r.timestamp DESC
        LIMIT $limit
      `;
      const result = await session.run(query2, { userId, limit });
      return result.records.map((record) => ({
        action: record.get("action"),
        entityType: record.get("entityType"),
        entityId: record.get("entityId"),
        timestamp: record.get("timestamp"),
        metadata: this.parseJSON(record.get("metadata"))
      }));
    } catch (error) {
      console.error("[Memgraph] Error getting user interactions:", error);
      return [];
    } finally {
      await session.close();
    }
  }
  /**
   * Find similar users based on interaction patterns
   */
  async findSimilarUsers(userId, limit = 10) {
    if (!this.isReady()) return [];
    const session = this.getSession();
    try {
      const query2 = `
        MATCH (u:User {id: $userId})-[r1]->(e)
        MATCH (similar:User)-[r2]->(e)
        WHERE u <> similar

        WITH similar,
             COUNT(DISTINCT e) AS commonInterests,
             COUNT(r1) AS userInteractions,
             COUNT(r2) AS similarInteractions

        WITH similar,
             commonInterests,
             commonInterests * 1.0 / (userInteractions + similarInteractions - commonInterests) AS jaccardSimilarity

        RETURN
          similar.id AS userId,
          jaccardSimilarity AS similarityScore,
          commonInterests
        ORDER BY similarityScore DESC
        LIMIT $limit
      `;
      const result = await session.run(query2, { userId, limit });
      return result.records.map((record) => ({
        userId: record.get("userId"),
        similarityScore: record.get("similarityScore"),
        commonInterests: record.get("commonInterests").toNumber()
      }));
    } catch (error) {
      console.error("[Memgraph] Error finding similar users:", error);
      return [];
    } finally {
      await session.close();
    }
  }
  /**
   * Get interaction statistics
   */
  async getInteractionStats() {
    if (!this.isReady()) return null;
    const session = this.getSession();
    try {
      const totalQuery = "MATCH ()-[r]->() RETURN COUNT(r) AS total";
      const totalResult = await session.run(totalQuery);
      const totalInteractions = totalResult.records[0].get("total").toNumber();
      const uniqueQuery = `
        MATCH (u:User)-[r]->(e)
        RETURN
          COUNT(DISTINCT u) AS uniqueUsers,
          COUNT(DISTINCT e) AS uniqueEntities
      `;
      const uniqueResult = await session.run(uniqueQuery);
      const uniqueUsers = uniqueResult.records[0].get("uniqueUsers").toNumber();
      const uniqueEntities = uniqueResult.records[0].get("uniqueEntities").toNumber();
      const actionsQuery = `
        MATCH ()-[r]->()
        RETURN type(r) AS action, COUNT(r) AS count
        ORDER BY count DESC
        LIMIT 10
      `;
      const actionsResult = await session.run(actionsQuery);
      const topActions = actionsResult.records.map((record) => ({
        action: record.get("action"),
        count: record.get("count").toNumber()
      }));
      const activityQuery = `
        MATCH ()-[r]->()
        WHERE r.timestamp > datetime() - duration({days: 30})
        WITH date(r.timestamp) AS day, COUNT(r) AS count
        RETURN toString(day) AS date, count
        ORDER BY day
      `;
      const activityResult = await session.run(activityQuery);
      const activityByDay = activityResult.records.map((record) => ({
        date: record.get("date"),
        count: record.get("count").toNumber()
      }));
      return {
        totalInteractions,
        uniqueUsers,
        uniqueEntities,
        topActions,
        activityByDay
      };
    } catch (error) {
      console.error("[Memgraph] Error getting stats:", error);
      return null;
    } finally {
      await session.close();
    }
  }
  /**
   * Delete all user interactions (for privacy/GDPR compliance)
   */
  async deleteUserData(userId) {
    if (!this.isReady()) return;
    const session = this.getSession();
    try {
      const query2 = `
        MATCH (u:User {id: $userId})-[r]-()
        DELETE r
        WITH u
        DELETE u
      `;
      await session.run(query2, { userId });
      console.log(`[Memgraph] Deleted all data for user: ${userId}`);
    } catch (error) {
      console.error("[Memgraph] Error deleting user data:", error);
    } finally {
      await session.close();
    }
  }
  /**
   * Clear all data (use with caution!)
   */
  async clearAllData() {
    if (!this.isReady()) return;
    const session = this.getSession();
    try {
      await session.run("MATCH (n) DETACH DELETE n");
      console.log("[Memgraph] Cleared all data");
    } catch (error) {
      console.error("[Memgraph] Error clearing data:", error);
    } finally {
      await session.close();
    }
  }
  /**
   * Parse JSON string safely
   */
  parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString || "{}");
    } catch {
      return {};
    }
  }
};
var memgraphService = new MemgraphService();

// src/schemas/user.ts
var import_zod2 = require("zod");
var USER_COLLECTION = "users";
var UserValidationRules = {
  required: ["email", "role"],
  maxNameLength: 100,
  maxBioLength: 500,
  validRoles: ["admin", "user", "viewer"]
};
var UserSchema = import_zod2.z.object({
  id: import_zod2.z.string(),
  email: import_zod2.z.string().email(),
  name: import_zod2.z.string(),
  role: import_zod2.z.enum(["admin", "user"]),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date()
});

// src/schemas/chat.ts
var CHAT_COLLECTION = "chats";
var ChatValidationRules = {
  required: ["userId", "sessionId", "messages"],
  maxMessages: 1e3,
  maxTitleLength: 100
};

// src/index.ts
init_auth_factory();

// src/types/projects.ts
var import_zod3 = require("zod");
var ProjectStatus = /* @__PURE__ */ ((ProjectStatus2) => {
  ProjectStatus2["DRAFT"] = "draft";
  ProjectStatus2["ACTIVE"] = "active";
  ProjectStatus2["ON_HOLD"] = "on_hold";
  ProjectStatus2["COMPLETED"] = "completed";
  ProjectStatus2["CANCELLED"] = "cancelled";
  return ProjectStatus2;
})(ProjectStatus || {});
var Priority = /* @__PURE__ */ ((Priority2) => {
  Priority2["LOW"] = "low";
  Priority2["MEDIUM"] = "medium";
  Priority2["HIGH"] = "high";
  Priority2["CRITICAL"] = "critical";
  return Priority2;
})(Priority || {});
var POVStatus = /* @__PURE__ */ ((POVStatus2) => {
  POVStatus2["PLANNING"] = "planning";
  POVStatus2["IN_PROGRESS"] = "in_progress";
  POVStatus2["TESTING"] = "testing";
  POVStatus2["VALIDATING"] = "validating";
  POVStatus2["COMPLETED"] = "completed";
  POVStatus2["AT_RISK"] = "at_risk";
  POVStatus2["CANCELLED"] = "cancelled";
  return POVStatus2;
})(POVStatus || {});
var TRRStatus = /* @__PURE__ */ ((TRRStatus2) => {
  TRRStatus2["DRAFT"] = "draft";
  TRRStatus2["IN_REVIEW"] = "in_review";
  TRRStatus2["PENDING_VALIDATION"] = "pending_validation";
  TRRStatus2["VALIDATED"] = "validated";
  TRRStatus2["APPROVED"] = "approved";
  TRRStatus2["REJECTED"] = "rejected";
  TRRStatus2["COMPLETED"] = "completed";
  return TRRStatus2;
})(TRRStatus || {});
var TaskStatus = /* @__PURE__ */ ((TaskStatus2) => {
  TaskStatus2["TODO"] = "todo";
  TaskStatus2["IN_PROGRESS"] = "in_progress";
  TaskStatus2["REVIEW"] = "review";
  TaskStatus2["DONE"] = "done";
  TaskStatus2["BLOCKED"] = "blocked";
  return TaskStatus2;
})(TaskStatus || {});
var ProjectSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  title: import_zod3.z.string(),
  description: import_zod3.z.string().optional(),
  customer: import_zod3.z.object({
    name: import_zod3.z.string(),
    industry: import_zod3.z.string().optional(),
    size: import_zod3.z.enum(["startup", "small", "medium", "enterprise"]).optional(),
    region: import_zod3.z.string().optional(),
    contact: import_zod3.z.object({
      name: import_zod3.z.string(),
      email: import_zod3.z.string().email(),
      role: import_zod3.z.string().optional(),
      phone: import_zod3.z.string().optional()
    }).optional()
  }),
  status: import_zod3.z.nativeEnum(ProjectStatus),
  priority: import_zod3.z.nativeEnum(Priority),
  owner: import_zod3.z.string(),
  // uid of project owner
  team: import_zod3.z.array(import_zod3.z.string()),
  // array of user uids
  startDate: import_zod3.z.date(),
  endDate: import_zod3.z.date().optional(),
  estimatedValue: import_zod3.z.number().optional(),
  actualValue: import_zod3.z.number().optional(),
  tags: import_zod3.z.array(import_zod3.z.string()).default([]),
  // Relations to other entities
  povIds: import_zod3.z.array(import_zod3.z.string()).default([]),
  trrIds: import_zod3.z.array(import_zod3.z.string()).default([]),
  scenarioIds: import_zod3.z.array(import_zod3.z.string()).default([]),
  // Metadata
  createdAt: import_zod3.z.date(),
  updatedAt: import_zod3.z.date(),
  createdBy: import_zod3.z.string(),
  lastModifiedBy: import_zod3.z.string()
});
var POVSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  projectId: import_zod3.z.string(),
  // reference to parent project
  title: import_zod3.z.string(),
  description: import_zod3.z.string(),
  status: import_zod3.z.nativeEnum(POVStatus),
  priority: import_zod3.z.nativeEnum(Priority),
  // POV Specific Fields
  objectives: import_zod3.z.array(import_zod3.z.object({
    id: import_zod3.z.string(),
    description: import_zod3.z.string(),
    success_criteria: import_zod3.z.string(),
    status: import_zod3.z.enum(["pending", "in_progress", "completed", "failed"]),
    weight: import_zod3.z.number().min(0).max(100).default(100)
    // percentage weight
  })).default([]),
  testPlan: import_zod3.z.object({
    scenarios: import_zod3.z.array(import_zod3.z.string()),
    // scenario IDs
    environment: import_zod3.z.string().optional(),
    timeline: import_zod3.z.object({
      start: import_zod3.z.date(),
      end: import_zod3.z.date(),
      milestones: import_zod3.z.array(import_zod3.z.object({
        id: import_zod3.z.string(),
        title: import_zod3.z.string(),
        date: import_zod3.z.date(),
        status: import_zod3.z.enum(["upcoming", "in_progress", "completed", "overdue"])
      }))
    }),
    resources: import_zod3.z.array(import_zod3.z.object({
      type: import_zod3.z.enum(["personnel", "equipment", "software", "budget"]),
      description: import_zod3.z.string(),
      quantity: import_zod3.z.number().optional(),
      cost: import_zod3.z.number().optional()
    })).default([])
  }).optional(),
  // Success Metrics
  successMetrics: import_zod3.z.object({
    businessValue: import_zod3.z.object({
      roi: import_zod3.z.number().optional(),
      costSavings: import_zod3.z.number().optional(),
      riskReduction: import_zod3.z.string().optional(),
      efficiency_gains: import_zod3.z.string().optional()
    }).optional(),
    technicalMetrics: import_zod3.z.object({
      performance: import_zod3.z.record(import_zod3.z.number()).optional(),
      reliability: import_zod3.z.number().optional(),
      // percentage
      security_score: import_zod3.z.number().optional()
    }).optional()
  }).default({}),
  // Timeline tracking
  phases: import_zod3.z.array(import_zod3.z.object({
    id: import_zod3.z.string(),
    name: import_zod3.z.string(),
    description: import_zod3.z.string().optional(),
    startDate: import_zod3.z.date(),
    endDate: import_zod3.z.date().optional(),
    status: import_zod3.z.nativeEnum(TaskStatus),
    tasks: import_zod3.z.array(import_zod3.z.string()).default([])
    // task IDs
  })).default([]),
  // Assignment
  owner: import_zod3.z.string(),
  // uid of POV owner
  team: import_zod3.z.array(import_zod3.z.string()).default([]),
  // Metadata
  createdAt: import_zod3.z.date(),
  updatedAt: import_zod3.z.date(),
  createdBy: import_zod3.z.string(),
  lastModifiedBy: import_zod3.z.string()
});
var TRRSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  projectId: import_zod3.z.string(),
  // reference to parent project
  povId: import_zod3.z.string().optional(),
  // optional reference to related POV
  title: import_zod3.z.string(),
  description: import_zod3.z.string(),
  status: import_zod3.z.nativeEnum(TRRStatus),
  priority: import_zod3.z.nativeEnum(Priority),
  // TRR Specific Fields
  riskAssessment: import_zod3.z.object({
    overall_score: import_zod3.z.number().min(0).max(10),
    categories: import_zod3.z.array(import_zod3.z.object({
      category: import_zod3.z.string(),
      score: import_zod3.z.number().min(0).max(10),
      description: import_zod3.z.string(),
      mitigation: import_zod3.z.string().optional(),
      evidence: import_zod3.z.array(import_zod3.z.string()).default([])
      // file URLs or references
    }))
  }),
  findings: import_zod3.z.array(import_zod3.z.object({
    id: import_zod3.z.string(),
    title: import_zod3.z.string(),
    description: import_zod3.z.string(),
    severity: import_zod3.z.enum(["low", "medium", "high", "critical"]),
    category: import_zod3.z.string(),
    evidence: import_zod3.z.array(import_zod3.z.object({
      type: import_zod3.z.enum(["screenshot", "log", "document", "test_result"]),
      url: import_zod3.z.string(),
      description: import_zod3.z.string().optional()
    })).default([]),
    recommendation: import_zod3.z.string().optional(),
    status: import_zod3.z.enum(["open", "addressed", "accepted_risk", "false_positive"])
  })).default([]),
  // Validation and Approval
  validation: import_zod3.z.object({
    validator: import_zod3.z.string().optional(),
    // uid of validator
    validatedAt: import_zod3.z.date().optional(),
    validationNotes: import_zod3.z.string().optional(),
    approved: import_zod3.z.boolean().optional()
  }).optional(),
  signoff: import_zod3.z.object({
    approver: import_zod3.z.string().optional(),
    // uid of approver
    approvedAt: import_zod3.z.date().optional(),
    signoffNotes: import_zod3.z.string().optional(),
    digitalSignature: import_zod3.z.string().optional()
  }).optional(),
  // Assignment
  owner: import_zod3.z.string(),
  // uid of TRR owner
  reviewers: import_zod3.z.array(import_zod3.z.string()).default([]),
  // Metadata
  createdAt: import_zod3.z.date(),
  updatedAt: import_zod3.z.date(),
  createdBy: import_zod3.z.string(),
  lastModifiedBy: import_zod3.z.string()
});
var TaskSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  title: import_zod3.z.string(),
  description: import_zod3.z.string().optional(),
  status: import_zod3.z.nativeEnum(TaskStatus),
  priority: import_zod3.z.nativeEnum(Priority),
  // Relations
  projectId: import_zod3.z.string().optional(),
  povId: import_zod3.z.string().optional(),
  trrId: import_zod3.z.string().optional(),
  parentTaskId: import_zod3.z.string().optional(),
  dependencies: import_zod3.z.array(import_zod3.z.string()).default([]),
  // task IDs this task depends on
  // Assignment and timing
  assignee: import_zod3.z.string().optional(),
  // uid of assignee
  estimatedHours: import_zod3.z.number().optional(),
  actualHours: import_zod3.z.number().optional(),
  startDate: import_zod3.z.date().optional(),
  dueDate: import_zod3.z.date().optional(),
  completedAt: import_zod3.z.date().optional(),
  // Task details
  labels: import_zod3.z.array(import_zod3.z.string()).default([]),
  checklist: import_zod3.z.array(import_zod3.z.object({
    id: import_zod3.z.string(),
    text: import_zod3.z.string(),
    completed: import_zod3.z.boolean().default(false)
  })).default([]),
  attachments: import_zod3.z.array(import_zod3.z.object({
    name: import_zod3.z.string(),
    url: import_zod3.z.string(),
    type: import_zod3.z.string(),
    size: import_zod3.z.number().optional()
  })).default([]),
  // Metadata
  createdAt: import_zod3.z.date(),
  updatedAt: import_zod3.z.date(),
  createdBy: import_zod3.z.string(),
  lastModifiedBy: import_zod3.z.string()
});
var NoteSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  title: import_zod3.z.string().optional(),
  content: import_zod3.z.string(),
  type: import_zod3.z.enum(["note", "meeting", "decision", "action_item", "issue"]).default("note"),
  // Relations - at least one must be specified
  projectId: import_zod3.z.string().optional(),
  povId: import_zod3.z.string().optional(),
  trrId: import_zod3.z.string().optional(),
  taskId: import_zod3.z.string().optional(),
  // Classification
  tags: import_zod3.z.array(import_zod3.z.string()).default([]),
  isPrivate: import_zod3.z.boolean().default(false),
  isPinned: import_zod3.z.boolean().default(false),
  // Rich content
  mentions: import_zod3.z.array(import_zod3.z.string()).default([]),
  // user IDs mentioned in note
  attachments: import_zod3.z.array(import_zod3.z.object({
    name: import_zod3.z.string(),
    url: import_zod3.z.string(),
    type: import_zod3.z.string()
  })).default([]),
  // Metadata
  createdAt: import_zod3.z.date(),
  updatedAt: import_zod3.z.date(),
  createdBy: import_zod3.z.string(),
  lastModifiedBy: import_zod3.z.string()
});
var TimelineEventSchema = import_zod3.z.object({
  id: import_zod3.z.string(),
  type: import_zod3.z.enum([
    "project_created",
    "project_updated",
    "project_completed",
    "pov_created",
    "pov_phase_completed",
    "pov_completed",
    "trr_created",
    "trr_submitted",
    "trr_approved",
    "task_created",
    "task_completed",
    "milestone_reached",
    "note_added",
    "team_member_added",
    "status_changed"
  ]),
  title: import_zod3.z.string(),
  description: import_zod3.z.string().optional(),
  // Relations
  projectId: import_zod3.z.string().optional(),
  povId: import_zod3.z.string().optional(),
  trrId: import_zod3.z.string().optional(),
  taskId: import_zod3.z.string().optional(),
  // Event details
  actor: import_zod3.z.string(),
  // uid of user who triggered the event
  metadata: import_zod3.z.record(import_zod3.z.unknown()).optional(),
  // additional event data
  // Timing
  timestamp: import_zod3.z.date(),
  createdAt: import_zod3.z.date()
});

// src/index.ts
if (typeof process !== "undefined" && process.env?.DEPLOYMENT_MODE === "self-hosted") {
  console.warn(
    "\n\u26A0\uFE0F  WARNING: Running in self-hosted mode with Firebase legacy exports\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\nFirebase exports from @cortex/db are deprecated and should not be used\nin self-hosted deployments.\n\nPlease migrate to adapter pattern:\n  - Use getDatabase() instead of direct Firebase imports\n  - Use getAuth() instead of Firebase Auth\n  - Use getStorage() instead of Firebase Storage\n\nSee packages/db/src/legacy/ for Firebase-specific code.\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AccessControlService,
  AnalyticsService,
  CHAT_COLLECTION,
  CacheInvalidationPatterns,
  CacheKeys,
  ChatValidationRules,
  DEFAULT_CONFIG,
  DatabaseValidationService,
  DynamicRecordService,
  EventTrackingService,
  FederatedDataService,
  FirestoreClient,
  FirestoreQueries,
  GroupManagementService,
  MemgraphService,
  OpenSearchService,
  POVStatus,
  Priority,
  ProjectStatus,
  RBACMiddleware,
  ROLE_PERMISSIONS,
  RecordProcessingOrchestrator,
  RedisCacheService,
  RelationshipManagementService,
  TRRStatus,
  TaskStatus,
  TerraformGenerationService,
  USER_COLLECTION,
  UserManagementService,
  UserRole,
  UserSchema,
  UserValidationRules,
  accessControlService,
  analyticsService,
  app,
  auth,
  authService,
  calculateAvgCycleDays,
  calculateWinRate,
  databaseValidationService,
  db,
  dcContextStore,
  dynamicRecordService,
  eventTrackingService,
  federatedDataService,
  fetchAnalytics,
  fetchBlueprintSummary,
  fetchRegionEngagements,
  fetchUserEngagements,
  firebaseApp,
  forceReconnectEmulators,
  functions,
  getAuth,
  getDatabase,
  getEngagementTrends,
  getFirebaseConfig,
  getRedisCacheService,
  getStorage,
  getTopPerformingUsers,
  groupManagementService,
  initializeStorage,
  isMockAuthMode,
  memgraphService,
  openSearchService,
  redisCacheService,
  relationshipManagementService,
  storage,
  terraformGenerationService,
  useEmulator,
  userActivityService,
  userManagementApiClient,
  userManagementService
});
