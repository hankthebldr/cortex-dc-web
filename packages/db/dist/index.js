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

// src/firebase-config.ts
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
  "src/firebase-config.ts"() {
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

// src/auth/auth-service.ts
var AuthService, authService;
var init_auth_service = __esm({
  "src/auth/auth-service.ts"() {
    "use strict";
    "use client";
    AuthService = class {
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
    authService = new AuthService();
  }
});

// src/auth/index.ts
var init_auth = __esm({
  "src/auth/index.ts"() {
    "use strict";
    init_auth_service();
    init_auth_service();
  }
});

// src/services/data-service.ts
async function fetchAnalytics(filters) {
  const sinceDays = filters.sinceDays ?? 90;
  const since = new Date(Date.now() - sinceDays * 864e5);
  try {
    const col = (0, import_firestore2.collection)(db, "dc_engagements");
    const constraints = [];
    constraints.push((0, import_firestore2.where)("createdAt", ">=", import_firestore2.Timestamp.fromDate(since)));
    if (filters.region && filters.region !== "GLOBAL") {
      constraints.push((0, import_firestore2.where)("region", "==", filters.region));
    }
    if (filters.theatre && filters.theatre !== "all") {
      constraints.push((0, import_firestore2.where)("theatre", "==", filters.theatre));
    }
    if (filters.user && filters.user !== "all") {
      constraints.push((0, import_firestore2.where)("user", "==", filters.user));
    }
    let q = (0, import_firestore2.query)(col, ...constraints);
    let snap = await (0, import_firestore2.getDocs)(q);
    if (snap.empty && constraints.length > 1) {
      console.warn("Query with filters returned empty, falling back to date-only filter");
      q = (0, import_firestore2.query)(col, (0, import_firestore2.where)("createdAt", ">=", import_firestore2.Timestamp.fromDate(since)));
      snap = await (0, import_firestore2.getDocs)(q);
    }
    const records = snap.docs.map((d) => {
      const v = d.data();
      const createdAt = v.createdAt?.toDate ? v.createdAt.toDate() : new Date(v.createdAt || Date.now());
      const completedAt = v.completedAt?.toDate ? v.completedAt.toDate() : v.completedAt ? new Date(v.completedAt) : null;
      const cycleDays = v.cycleDays ?? (completedAt ? Math.max(0, Math.round((completedAt.getTime() - createdAt.getTime()) / 864e5)) : void 0);
      return {
        region: v.region || "UNKNOWN",
        theatre: v.theatre || "UNKNOWN",
        user: (v.user || "unknown").toLowerCase(),
        location: v.location || "N/A",
        customer: v.customer || "unknown",
        createdAt,
        completedAt,
        scenariosExecuted: v.scenariosExecuted ?? 0,
        detectionsValidated: v.detectionsValidated ?? 0,
        trrOutcome: v.trrOutcome ?? null,
        cycleDays
      };
    });
    const okrSnap = await (0, import_firestore2.getDocs)((0, import_firestore2.collection)(db, "dc_okrs"));
    const okrs = okrSnap.docs.map((d) => {
      const v = d.data();
      return {
        id: d.id,
        name: v.name || d.id,
        progress: Number(v.progress ?? 0)
      };
    });
    return {
      records,
      okrs,
      source: records.length ? "firestore" : "empty"
    };
  } catch (e) {
    console.error("Error fetching analytics:", e);
    return { records: [], okrs: [], source: "mock" };
  }
}
async function fetchBlueprintSummary(customer, sinceDays = 90) {
  const since = new Date(Date.now() - sinceDays * 864e5);
  try {
    const col = (0, import_firestore2.collection)(db, "dc_engagements");
    const q = (0, import_firestore2.query)(
      col,
      (0, import_firestore2.where)("customer", "==", customer),
      (0, import_firestore2.where)("createdAt", ">=", import_firestore2.Timestamp.fromDate(since))
    );
    const snap = await (0, import_firestore2.getDocs)(q);
    const records = snap.docs.map((d) => {
      const v = d.data();
      const createdAt = v.createdAt?.toDate ? v.createdAt.toDate() : new Date(v.createdAt || Date.now());
      const completedAt = v.completedAt?.toDate ? v.completedAt.toDate() : v.completedAt ? new Date(v.completedAt) : null;
      const cycleDays = v.cycleDays ?? (completedAt ? Math.max(0, Math.round((completedAt.getTime() - createdAt.getTime()) / 864e5)) : void 0);
      return {
        region: v.region || "UNKNOWN",
        theatre: v.theatre || "UNKNOWN",
        user: (v.user || "unknown").toLowerCase(),
        location: v.location || "N/A",
        customer: v.customer || "unknown",
        createdAt,
        completedAt,
        scenariosExecuted: v.scenariosExecuted ?? 0,
        detectionsValidated: v.detectionsValidated ?? 0,
        trrOutcome: v.trrOutcome ?? null,
        cycleDays
      };
    });
    const sum = (a, b) => a + b;
    const engagements = records.length;
    const scenariosExecuted = records.map((r2) => r2.scenariosExecuted ?? 0).reduce(sum, 0);
    const detectionsValidated = records.map((r2) => r2.detectionsValidated ?? 0).reduce(sum, 0);
    const trrWins = records.filter((r2) => r2.trrOutcome === "win").length;
    const trrLosses = records.filter((r2) => r2.trrOutcome === "loss").length;
    const avgCycleDays = records.length ? Math.round(records.map((r2) => r2.cycleDays ?? 0).reduce(sum, 0) / records.length) : 0;
    return {
      engagements,
      scenariosExecuted,
      detectionsValidated,
      trrWins,
      trrLosses,
      avgCycleDays,
      source: engagements ? "firestore" : "empty"
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
  const trrRecords = records.filter((r2) => r2.trrOutcome !== null);
  if (trrRecords.length === 0) return 0;
  const wins = trrRecords.filter((r2) => r2.trrOutcome === "win").length;
  return Math.round(wins / trrRecords.length * 100);
}
function calculateAvgCycleDays(records) {
  const withCycleDays = records.filter((r2) => r2.cycleDays !== void 0);
  if (withCycleDays.length === 0) return 0;
  const total = withCycleDays.reduce((sum, r2) => sum + (r2.cycleDays ?? 0), 0);
  return Math.round(total / withCycleDays.length);
}
var import_firestore2;
var init_data_service = __esm({
  "src/services/data-service.ts"() {
    "use strict";
    "use client";
    import_firestore2 = require("firebase/firestore");
    init_firebase_config();
  }
});

// ../utils/src/api/api-service.ts
var ApiService, apiService, api;
var init_api_service = __esm({
  "../utils/src/api/api-service.ts"() {
    "use strict";
    ApiService = class {
      constructor() {
        this.baseVersion = "1.0";
        this.mockData = {
          povs: [],
          trrs: [],
          scenarios: []
        };
        this.initializeMockData();
      }
      /**
       * Initialize mock data for development/testing
       */
      initializeMockData() {
        this.mockData.povs = [
          {
            id: "POV-001",
            name: "Enterprise Banking Security Assessment",
            customer: "Global Bank Corp",
            status: "in_progress",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-20T15:30:00Z",
            scenarios: ["ransomware-defense", "cloud-posture"],
            tags: ["banking", "enterprise", "multi-cloud"],
            metadata: { priority: "high", estimated_duration: "90d" }
          },
          {
            id: "POV-002",
            name: "Healthcare SIEM Integration",
            customer: "MedTech Solutions",
            status: "completed",
            createdAt: "2024-01-10T09:00:00Z",
            updatedAt: "2024-01-25T16:45:00Z",
            scenarios: ["compliance-audit", "threat-hunting"],
            tags: ["healthcare", "compliance", "HIPAA"],
            metadata: { priority: "medium", estimated_duration: "60d" }
          }
        ];
        this.mockData.trrs = [
          {
            id: "TRR-2024-001",
            title: "Multi-Cloud Security Assessment",
            status: "validated",
            priority: "high",
            assignee: "john.smith@company.com",
            createdAt: "2024-01-12T11:00:00Z",
            updatedAt: "2024-01-18T14:20:00Z",
            blockchain_hash: "0x7d4a...f2e9",
            metadata: { customer: "Global Bank Corp", estimated_effort: "40h" }
          },
          {
            id: "TRR-2024-002",
            title: "Zero Trust Architecture Review",
            status: "in_progress",
            priority: "medium",
            assignee: "sarah.johnson@company.com",
            createdAt: "2024-01-15T13:00:00Z",
            updatedAt: "2024-01-20T10:15:00Z",
            metadata: { customer: "MedTech Solutions", estimated_effort: "32h" }
          }
        ];
        this.mockData.scenarios = [
          {
            id: "SC-001",
            name: "Ransomware Defense Chain",
            type: "threat-simulation",
            status: "deployed",
            mitre_techniques: ["T1486", "T1055", "T1021.001"],
            cloud_providers: ["AWS", "Azure"],
            resources: { k8s_deployments: 3, cloud_functions: 7, data_stores: 2 },
            metadata: { complexity: "advanced", duration_hours: 4 }
          },
          {
            id: "SC-002",
            name: "Cloud Posture Assessment",
            type: "compliance-check",
            status: "available",
            mitre_techniques: ["T1078", "T1087"],
            cloud_providers: ["GCP", "AWS"],
            resources: { compliance_checks: 45, policy_validations: 23 },
            metadata: { complexity: "intermediate", duration_hours: 2 }
          }
        ];
      }
      /**
       * Create standardized API response
       */
      createResponse(data, success = true, error) {
        return {
          success,
          data: success ? data : void 0,
          error: error || void 0,
          timestamp: Date.now(),
          version: this.baseVersion
        };
      }
      /**
       * Create paginated response
       */
      createPaginatedResponse(data, page = 1, limit2 = 20, total) {
        const actualTotal = total || data.length;
        const start = (page - 1) * limit2;
        const end = start + limit2;
        const paginatedData = data.slice(start, end);
        return {
          success: true,
          data: paginatedData,
          timestamp: Date.now(),
          version: this.baseVersion,
          pagination: {
            page,
            limit: limit2,
            total: actualTotal,
            hasMore: end < actualTotal
          }
        };
      }
      /**
       * Simulate network delay for realistic mock responses
       */
      async delay(ms = 300) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      // POV API Methods
      async getPOVs(options) {
        await this.delay();
        let filtered = [...this.mockData.povs];
        if (options?.status) {
          filtered = filtered.filter((pov) => pov.status === options.status);
        }
        if (options?.customer) {
          filtered = filtered.filter(
            (pov) => pov.customer.toLowerCase().includes(options.customer.toLowerCase())
          );
        }
        if (options?.tags?.length) {
          filtered = filtered.filter(
            (pov) => options.tags.some((tag) => pov.tags.includes(tag))
          );
        }
        return this.createPaginatedResponse(filtered, options?.page, options?.limit);
      }
      async getPOV(id) {
        await this.delay(200);
        const pov = this.mockData.povs.find((p) => p.id === id);
        return pov ? this.createResponse(pov) : this.createResponse(null, false, `POV ${id} not found`);
      }
      async createPOV(povData) {
        await this.delay(500);
        const newPOV = {
          ...povData,
          id: `POV-${String(this.mockData.povs.length + 1).padStart(3, "0")}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.mockData.povs.push(newPOV);
        return this.createResponse(newPOV);
      }
      async updatePOV(id, updates) {
        await this.delay(400);
        const index = this.mockData.povs.findIndex((p) => p.id === id);
        if (index === -1) {
          return this.createResponse(null, false, `POV ${id} not found`);
        }
        this.mockData.povs[index] = {
          ...this.mockData.povs[index],
          ...updates,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        return this.createResponse(this.mockData.povs[index]);
      }
      // TRR API Methods
      async getTRRs(options) {
        await this.delay();
        let filtered = [...this.mockData.trrs];
        if (options?.status) {
          filtered = filtered.filter((trr) => trr.status === options.status);
        }
        if (options?.priority) {
          filtered = filtered.filter((trr) => trr.priority === options.priority);
        }
        if (options?.assignee) {
          filtered = filtered.filter((trr) => trr.assignee === options.assignee);
        }
        return this.createPaginatedResponse(filtered, options?.page, options?.limit);
      }
      async getTRR(id) {
        await this.delay(200);
        const trr = this.mockData.trrs.find((t) => t.id === id);
        return trr ? this.createResponse(trr) : this.createResponse(null, false, `TRR ${id} not found`);
      }
      async createTRR(trrData) {
        await this.delay(500);
        const newTRR = {
          ...trrData,
          id: `TRR-2024-${String(this.mockData.trrs.length + 1).padStart(3, "0")}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.mockData.trrs.push(newTRR);
        return this.createResponse(newTRR);
      }
      // Scenario API Methods
      async getScenarios(options) {
        await this.delay();
        let filtered = [...this.mockData.scenarios];
        if (options?.type) {
          filtered = filtered.filter((sc) => sc.type === options.type);
        }
        if (options?.status) {
          filtered = filtered.filter((sc) => sc.status === options.status);
        }
        if (options?.cloud_provider) {
          filtered = filtered.filter(
            (sc) => sc.cloud_providers.includes(options.cloud_provider)
          );
        }
        return this.createPaginatedResponse(filtered, options?.page, options?.limit);
      }
      async deployScenario(id, config) {
        await this.delay(800);
        const scenario = this.mockData.scenarios.find((s) => s.id === id);
        if (!scenario) {
          return this.createResponse(null, false, `Scenario ${id} not found`);
        }
        scenario.status = "deployed";
        scenario.metadata.last_deployed = (/* @__PURE__ */ new Date()).toISOString();
        return this.createResponse({
          deployment_id: `DEP-${Date.now()}`,
          status: "deployed",
          config
        });
      }
      // Analytics API Methods (placeholder - will integrate with real analytics)
      async getAnalytics(options) {
        await this.delay(400);
        const mockAnalytics = [
          {
            region: options?.region || "GLOBAL",
            theatre: options?.theatre || "COMMERCIAL",
            user: options?.user || "current-user",
            engagements: 42,
            povs_completed: 35,
            trr_win_rate: 0.83,
            avg_cycle_days: 45,
            kpis: {
              customer_satisfaction: 0.89,
              time_to_value: 32,
              technical_depth: 0.92
            },
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        ];
        return this.createResponse(mockAnalytics);
      }
      // Command execution for GUI-to-Terminal bridge
      async executeCommand(command, context) {
        await this.delay(Math.random() * 1e3 + 500);
        const result = {
          command,
          output: `Command "${command}" executed successfully.
Context: ${JSON.stringify(context || {}, null, 2)}`,
          exit_code: 0,
          execution_time: Math.floor(Math.random() * 1e3 + 100)
        };
        return this.createResponse(result);
      }
      // Health check endpoint
      async healthCheck() {
        return this.createResponse({
          status: "healthy",
          services: {
            database: true,
            external_apis: true,
            command_processor: true,
            analytics_engine: true
          },
          uptime: Date.now() - 123456789e4,
          version: this.baseVersion
        });
      }
    };
    apiService = new ApiService();
    api = {
      povs: {
        list: (options) => apiService.getPOVs(options),
        get: (id) => apiService.getPOV(id),
        create: (data) => apiService.createPOV(data),
        update: (id, updates) => apiService.updatePOV(id, updates)
      },
      trrs: {
        list: (options) => apiService.getTRRs(options),
        get: (id) => apiService.getTRR(id),
        create: (data) => apiService.createTRR(data)
      },
      scenarios: {
        list: (options) => apiService.getScenarios(options),
        deploy: (id, config) => apiService.deployScenario(id, config)
      },
      analytics: {
        get: (options) => apiService.getAnalytics(options)
      },
      commands: {
        execute: (command, context) => apiService.executeCommand(command, context)
      },
      health: () => apiService.healthCheck()
    };
  }
});

// ../utils/src/api/index.ts
var init_api = __esm({
  "../utils/src/api/index.ts"() {
    "use strict";
    init_api_service();
    init_api_service();
  }
});

// ../utils/src/api/user-api-client.ts
var UserApiClient, userApiClient;
var init_user_api_client = __esm({
  "../utils/src/api/user-api-client.ts"() {
    "use strict";
    UserApiClient = class {
      constructor(baseUrl) {
        this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      }
      /**
       * Get authorization header
       */
      async getAuthHeader() {
        try {
          const { getAuth: getAuth3 } = await Promise.resolve().then(() => (init_index(), index_exports));
          const auth2 = getAuth3();
          const token = await auth2.getIdToken();
          if (token) {
            return { Authorization: `Bearer ${token}` };
          }
        } catch (error) {
          console.warn("Failed to get auth token:", error);
        }
        return {};
      }
      /**
       * Make API request with authentication
       */
      async request(endpoint, options = {}) {
        const headers = await this.getAuthHeader();
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...headers,
            ...options.headers
          }
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        if (response.status === 204) {
          return {};
        }
        return response.json();
      }
      /**
       * Create a new user profile
       */
      async createUser(userData) {
        try {
          const result = await this.request("/api/users", {
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
          const result = await this.request(`/api/users/${userId}`, {
            method: "PUT",
            body: JSON.stringify(updates)
          });
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
      async getUserProfile(uid) {
        try {
          const result = await this.request(`/api/users/${uid}`);
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
          const result = await this.request("/api/users/me");
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
          const queryParams = new URLSearchParams();
          if (filters?.role) queryParams.append("role", filters.role);
          if (filters?.status) queryParams.append("status", filters.status);
          if (filters?.organizationId) queryParams.append("organizationId", filters.organizationId);
          if (filters?.limit) queryParams.append("limit", filters.limit.toString());
          const endpoint = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
          const result = await this.request(endpoint);
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
          await this.request(`/api/users/${userId}`, {
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
          const result = await this.request("/api/users/bulk/update", {
            method: "PUT",
            body: JSON.stringify({ userIds, updates })
          });
          return {
            success: result.updated,
            failed: userIds.length - result.updated
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
    userApiClient = new UserApiClient();
  }
});

// ../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
var init_clsx = __esm({
  "../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs"() {
    "use strict";
  }
});

// ../utils/src/cn.ts
function cn(...inputs) {
  return clsx(inputs);
}
var init_cn = __esm({
  "../utils/src/cn.ts"() {
    "use strict";
    init_clsx();
  }
});

// ../utils/src/date.ts
function formatDate(date) {
  return date.toISOString().split("T")[0];
}
function formatRelativeTime(date) {
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1e3);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}
var init_date = __esm({
  "../utils/src/date.ts"() {
    "use strict";
  }
});

// ../utils/src/string.ts
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}
var init_string = __esm({
  "../utils/src/string.ts"() {
    "use strict";
  }
});

// ../utils/src/async.ts
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
function throttle(func, limit2) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit2);
    }
  };
}
var init_async = __esm({
  "../utils/src/async.ts"() {
    "use strict";
  }
});

// ../utils/src/validation.ts
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validatePassword(password) {
  return password.length >= 8;
}
var init_validation = __esm({
  "../utils/src/validation.ts"() {
    "use strict";
  }
});

// ../utils/src/parsers/arg-parser.ts
function parseArgs(spec, argv) {
  const out = { _: [] };
  const indexByFlag = new Map(spec.map((s) => [s.flag, s]));
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    const item = indexByFlag.get(token);
    if (!item) {
      out._.push(token);
      continue;
    }
    if (item.type === "boolean") {
      out[item.flag] = true;
    } else {
      const val = argv[i + 1];
      if (val === void 0 || val.startsWith("--")) {
        out[item.flag] = item.default;
      } else {
        if (item.type === "enum" && item.enumValues && !item.enumValues.includes(val)) {
          out[item.flag] = item.default ?? item.enumValues[0];
        } else {
          out[item.flag] = val;
        }
        i++;
      }
    }
  }
  for (const s of spec) {
    const k = s.flag;
    if (!(k in out) && s.default !== void 0) out[k] = s.default;
  }
  return out;
}
function argsToString(args) {
  const parts = [];
  if (args._.length > 0) {
    parts.push(...args._);
  }
  for (const [key, value] of Object.entries(args)) {
    if (key === "_") continue;
    if (typeof value === "boolean" && value) {
      parts.push(key);
    } else if (value !== void 0 && value !== null) {
      parts.push(key, String(value));
    }
  }
  return parts.join(" ");
}
function validateArgs(args, spec) {
  const errors = [];
  for (const item of spec) {
    const value = args[item.flag];
    if (item.type === "enum" && value !== void 0 && item.enumValues) {
      if (!item.enumValues.includes(value)) {
        errors.push(`Invalid value for ${item.flag}: ${value}. Expected one of: ${item.enumValues.join(", ")}`);
      }
    }
    if (item.type === "boolean" && value !== void 0 && typeof value !== "boolean") {
      errors.push(`Invalid type for ${item.flag}: expected boolean, got ${typeof value}`);
    }
    if (item.type === "string" && value !== void 0 && typeof value !== "string") {
      errors.push(`Invalid type for ${item.flag}: expected string, got ${typeof value}`);
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
var init_arg_parser = __esm({
  "../utils/src/parsers/arg-parser.ts"() {
    "use strict";
  }
});

// ../utils/src/storage/cloud-store-service.ts
var CloudStoreService, cloudStoreService, cloud_store_service_default;
var init_cloud_store_service = __esm({
  "../utils/src/storage/cloud-store-service.ts"() {
    "use strict";
    "use client";
    init_index();
    CloudStoreService = class {
      constructor() {
        this.STORAGE_KEY = "contentHub_markdownNotes";
        this.storage = null;
      }
      get hasWindow() {
        return typeof window !== "undefined";
      }
      /**
       * Initialize storage instance
       */
      async initializeStorage() {
        if (this.storage) return;
        try {
          this.storage = getStorage2();
          await this.storage.initialize();
        } catch (error) {
          console.warn("Storage not available:", error);
        }
      }
      readLocalRecords() {
        if (!this.hasWindow) {
          return {};
        }
        try {
          const stored = window.localStorage.getItem(this.STORAGE_KEY);
          if (!stored) {
            return {};
          }
          return JSON.parse(stored);
        } catch (error) {
          console.warn("Failed to read markdown records from local storage:", error);
          return {};
        }
      }
      writeLocalRecords(records) {
        if (!this.hasWindow) {
          return;
        }
        try {
          window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
        } catch (error) {
          console.warn("Failed to persist markdown records to local storage:", error);
        }
      }
      async saveMarkdownNote(file, options = {}) {
        if (!this.hasWindow) {
          throw new Error("Cloud store is only available in the browser runtime.");
        }
        await this.initializeStorage();
        const id = options.metadata?.id || `md-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const uploadedAt = (/* @__PURE__ */ new Date()).toISOString();
        const name = options.metadata?.name || file.name || `${id}.md`;
        let path = `content-hub/notes/${id}.md`;
        let downloadUrl;
        try {
          if (!this.storage) {
            throw new Error("Storage service is unavailable");
          }
          const uploadResult = await this.storage.upload(path, file, {
            contentType: "text/markdown",
            customMetadata: {
              ...options.metadata,
              originalName: file.name,
              importedAt: uploadedAt
            }
          });
          path = uploadResult.fullPath;
          downloadUrl = await this.storage.getDownloadURL(uploadResult.fullPath);
        } catch (error) {
          console.warn("Markdown upload to cloud storage failed; using local fallback.", error);
          path = `local://${id}`;
        }
        const record = {
          id,
          name,
          path,
          size: file.size,
          uploadedAt,
          downloadUrl,
          content: options.contentText,
          metadata: options.metadata
        };
        const records = this.readLocalRecords();
        records[id] = record;
        this.writeLocalRecords(records);
        return record;
      }
      getMarkdownRecord(id) {
        const records = this.readLocalRecords();
        return records[id] || null;
      }
      listMarkdownRecords() {
        const records = this.readLocalRecords();
        return Object.values(records).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      }
      getCallableMarkdown(id) {
        const record = this.getMarkdownRecord(id);
        if (!record) {
          return null;
        }
        return async () => {
          if (record.downloadUrl) {
            const response = await fetch(record.downloadUrl);
            return await response.text();
          }
          if (record.content) {
            return record.content;
          }
          return "";
        };
      }
      /**
       * Delete markdown record
       */
      deleteMarkdownRecord(id) {
        const records = this.readLocalRecords();
        if (!records[id]) {
          return false;
        }
        delete records[id];
        this.writeLocalRecords(records);
        return true;
      }
      /**
       * Clear all records
       */
      clearAllRecords() {
        if (this.hasWindow) {
          window.localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    };
    cloudStoreService = new CloudStoreService();
    cloud_store_service_default = cloudStoreService;
  }
});

// ../utils/src/context/context-storage.ts
var ContextStorage, contextStorage;
var init_context_storage = __esm({
  "../utils/src/context/context-storage.ts"() {
    "use strict";
    "use client";
    ContextStorage = class {
      constructor() {
        this.context = {};
        this.storageKey = "pov-cli-context";
        this.loadFromStorage();
      }
      /**
       * Store a key-value pair
       */
      set(key, value) {
        this.context[key] = value;
        this.saveToStorage();
      }
      /**
       * Retrieve a value by key
       */
      get(key) {
        return this.context[key];
      }
      /**
       * Get all context data
       */
      getAll() {
        return { ...this.context };
      }
      /**
       * Update multiple values at once
       */
      update(updates) {
        this.context = { ...this.context, ...updates };
        this.saveToStorage();
      }
      /**
       * Clear specific key
       */
      remove(key) {
        delete this.context[key];
        this.saveToStorage();
      }
      /**
       * Clear all context data
       */
      clear() {
        this.context = {};
        this.saveToStorage();
      }
      /**
       * Check if a key exists
       */
      has(key) {
        return key in this.context && this.context[key] !== void 0;
      }
      /**
       * Get user profile summary
       */
      getProfile() {
        return {
          name: this.context.name,
          company: this.context.company,
          role: this.context.role,
          email: this.context.email
        };
      }
      /**
       * Get project context summary
       */
      getProjectContext() {
        return {
          industry: this.context.industry,
          projectType: this.context.projectType,
          budget: this.context.budget,
          timeline: this.context.timeline,
          useCase: this.context.useCase
        };
      }
      /**
       * Add to array fields
       */
      addToArray(key, value) {
        const currentArray = this.context[key] || [];
        if (!currentArray.includes(value)) {
          currentArray.push(value);
          this.set(key, currentArray);
        }
      }
      /**
       * Remove from array fields
       */
      removeFromArray(key, value) {
        const currentArray = this.context[key] || [];
        const filtered = currentArray.filter((item) => item !== value);
        this.set(key, filtered);
      }
      /**
       * Session management
       */
      startSession() {
        this.set("sessionStartTime", /* @__PURE__ */ new Date());
        this.updateActivity();
      }
      updateActivity() {
        this.set("lastActivity", /* @__PURE__ */ new Date());
      }
      getSessionDuration() {
        const start = this.context.sessionStartTime;
        if (!start) return "Unknown";
        const duration = Date.now() - new Date(start).getTime();
        const minutes = Math.floor(duration / 6e4);
        const seconds = Math.floor(duration % 6e4 / 1e3);
        return `${minutes}m ${seconds}s`;
      }
      /**
       * Persistence - localStorage with SSR guard
       */
      saveToStorage() {
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.context));
          } catch (error) {
            console.warn("Failed to save context to localStorage:", error);
          }
        }
      }
      loadFromStorage() {
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
              this.context = JSON.parse(stored);
            }
          } catch (error) {
            console.warn("Failed to load context from localStorage:", error);
          }
        }
      }
      /**
       * Export context for sharing/debugging
       */
      exportContext() {
        return JSON.stringify(this.context, null, 2);
      }
      /**
       * Import context from JSON string
       */
      importContext(jsonString) {
        try {
          const imported = JSON.parse(jsonString);
          this.context = { ...imported };
          this.saveToStorage();
          return true;
        } catch (error) {
          console.error("Failed to import context:", error);
          return false;
        }
      }
    };
    contextStorage = new ContextStorage();
  }
});

// ../utils/src/platform/platform-settings-service.ts
var MAX_AUDIT_ENTRIES, generateId2, PlatformSettingsService, platformSettingsService;
var init_platform_settings_service = __esm({
  "../utils/src/platform/platform-settings-service.ts"() {
    "use strict";
    "use client";
    MAX_AUDIT_ENTRIES = 50;
    generateId2 = () => {
      try {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
          return crypto.randomUUID();
        }
      } catch (error) {
        console.warn("crypto.randomUUID unavailable, falling back to pseudo-random id generation", error);
      }
      return `ps_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
    };
    PlatformSettingsService = class {
      constructor() {
        this.storageKey = "platform_settings_document_v1";
        this.defaultFlags = [
          {
            key: "beta_features",
            name: "Beta Features",
            description: "Enable beta features for early adopters",
            category: "experience",
            defaultEnabled: false
          },
          {
            key: "advanced_analytics",
            name: "Advanced Analytics",
            description: "Unlock predictive and cohort analytics dashboards",
            category: "analytics",
            defaultEnabled: false
          },
          {
            key: "ai_recommendations",
            name: "AI Recommendations",
            description: "Enable AI-driven recommendations inside workflows",
            category: "productivity",
            defaultEnabled: true
          },
          {
            key: "export_to_pdf",
            name: "PDF Export",
            description: "Allow exporting reports and dashboards to PDF",
            category: "productivity",
            defaultEnabled: true
          },
          {
            key: "team_collaboration",
            name: "Team Collaboration",
            description: "Enable live collaboration and shared annotations",
            category: "experience",
            defaultEnabled: true
          },
          {
            key: "mobile_app",
            name: "Mobile App Access",
            description: "Allow users to sign in using the mobile companion app",
            category: "mobile",
            defaultEnabled: false
          }
        ];
        this.cachedSettings = this.loadFromStorage() ?? this.createDefaultSettings();
        this.persist(this.cachedSettings);
      }
      async getSettings() {
        const stored = this.loadFromStorage();
        if (stored) {
          this.cachedSettings = stored;
        }
        return this.clone(this.cachedSettings);
      }
      getSnapshot() {
        return this.clone(this.cachedSettings);
      }
      getDefaultEnvironment() {
        return this.clone(this.createDefaultEnvironment());
      }
      getFeatureFlagDefinitions() {
        return this.defaultFlags.map((flag) => ({ ...flag }));
      }
      async updateFeatureFlag(key, enabled, actor) {
        const settings = await this.getSettings();
        const flagIndex = settings.featureFlags.findIndex((flag) => flag.key === key);
        if (flagIndex === -1) {
          throw new Error(`Feature flag "${key}" not found`);
        }
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        const updatedFlag = {
          ...settings.featureFlags[flagIndex],
          enabled,
          lastModified: timestamp,
          modifiedBy: actor.name
        };
        const updatedSettings = {
          ...settings,
          featureFlags: settings.featureFlags.map(
            (flag) => flag.key === key ? updatedFlag : flag
          ),
          updatedAt: timestamp,
          updatedBy: actor.name,
          auditLog: this.addAuditEntry(settings.auditLog, {
            id: generateId2(),
            timestamp,
            actor: actor.name,
            action: "feature_flag:update",
            message: `${actor.name} ${enabled ? "enabled" : "disabled"} ${updatedFlag.name}`,
            metadata: {
              flagKey: key,
              enabled: String(enabled),
              actorId: actor.id
            }
          })
        };
        this.persist(updatedSettings);
        return {
          flag: this.clone(updatedFlag),
          settings: this.clone(updatedSettings)
        };
      }
      async updateEnvironmentConfig(config, actor) {
        const validationErrors = this.validateEnvironmentConfig(config);
        if (Object.keys(validationErrors).length > 0) {
          const error = new Error("Environment configuration validation failed");
          error.validationErrors = validationErrors;
          throw error;
        }
        const settings = await this.getSettings();
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        const updatedSettings = {
          ...settings,
          environment: { ...config },
          updatedAt: timestamp,
          updatedBy: actor.name,
          auditLog: this.addAuditEntry(settings.auditLog, {
            id: generateId2(),
            timestamp,
            actor: actor.name,
            action: "environment:update",
            message: `${actor.name} updated environment configuration (${config.environment.toUpperCase()})`,
            metadata: {
              actorId: actor.id,
              releaseChannel: config.releaseChannel,
              maintenanceMode: String(config.maintenanceMode)
            }
          })
        };
        this.persist(updatedSettings);
        return {
          settings: this.clone(updatedSettings)
        };
      }
      validateEnvironmentConfig(config) {
        const errors = {};
        if (!config.environment) {
          errors.environment = "Environment selection is required.";
        }
        if (!config.apiBaseUrl) {
          errors.apiBaseUrl = "API base URL is required.";
        } else if (!/^https?:\/\//.test(config.apiBaseUrl)) {
          errors.apiBaseUrl = "API base URL must start with http:// or https://";
        }
        if (!config.analyticsDataset) {
          errors.analyticsDataset = "Analytics dataset is required.";
        }
        if (!config.releaseChannel) {
          errors.releaseChannel = "Release channel must be selected.";
        }
        if (!config.region) {
          errors.region = "Primary deployment region is required.";
        }
        return errors;
      }
      addAuditEntry(log, entry) {
        const updated = [entry, ...log];
        return updated.slice(0, MAX_AUDIT_ENTRIES);
      }
      loadFromStorage() {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            const stored = window.localStorage.getItem(this.storageKey);
            if (stored) {
              return JSON.parse(stored);
            }
            return null;
          }
          const globalStore = globalThis;
          return globalStore.__PLATFORM_SETTINGS__ ?? null;
        } catch (error) {
          console.warn("Failed to load platform settings from storage:", error);
          return null;
        }
      }
      persist(settings) {
        this.cachedSettings = settings;
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(this.storageKey, JSON.stringify(settings));
          } else {
            const globalStore = globalThis;
            globalStore.__PLATFORM_SETTINGS__ = settings;
          }
        } catch (error) {
          console.warn("Failed to persist platform settings to storage:", error);
        }
      }
      createDefaultSettings() {
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        const environment = this.createDefaultEnvironment();
        const featureFlags = this.defaultFlags.map((flag) => ({
          ...flag,
          enabled: flag.defaultEnabled,
          lastModified: timestamp,
          modifiedBy: "system"
        }));
        return {
          featureFlags,
          environment,
          updatedAt: timestamp,
          updatedBy: "system",
          auditLog: [
            {
              id: generateId2(),
              timestamp,
              actor: "system",
              action: "bootstrap",
              message: "Platform settings initialized with default configuration"
            }
          ]
        };
      }
      createDefaultEnvironment() {
        return {
          environment: "production",
          apiBaseUrl: "https://api.henryreed.ai",
          analyticsDataset: "prod_cortex_events",
          releaseChannel: "stable",
          maintenanceMode: false,
          region: "us-central1"
        };
      }
      clone(value) {
        return JSON.parse(JSON.stringify(value));
      }
    };
    platformSettingsService = new PlatformSettingsService();
  }
});

// ../utils/src/constants/app.ts
var APP_CONFIG;
var init_app = __esm({
  "../utils/src/constants/app.ts"() {
    "use strict";
    APP_CONFIG = {
      name: "Cortex DC Web",
      version: "0.1.0",
      description: "Domain Consultant Platform"
    };
  }
});

// ../utils/src/constants/validation.ts
var VALIDATION_RULES;
var init_validation2 = __esm({
  "../utils/src/constants/validation.ts"() {
    "use strict";
    VALIDATION_RULES = {
      EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      PASSWORD_MIN_LENGTH: 8,
      USERNAME_MIN_LENGTH: 3
    };
  }
});

// ../utils/src/index.ts
var src_exports = {};
__export(src_exports, {
  APP_CONFIG: () => APP_CONFIG,
  CloudStoreService: () => cloudStoreService,
  VALIDATION_RULES: () => VALIDATION_RULES,
  api: () => api,
  apiService: () => apiService,
  argsToString: () => argsToString,
  cloudStoreService: () => cloud_store_service_default,
  cn: () => cn,
  contextStorage: () => contextStorage,
  debounce: () => debounce,
  formatDate: () => formatDate,
  formatRelativeTime: () => formatRelativeTime,
  generateId: () => generateId,
  parseArgs: () => parseArgs,
  platformSettingsService: () => platformSettingsService,
  slugify: () => slugify,
  throttle: () => throttle,
  userApiClient: () => userApiClient,
  validateArgs: () => validateArgs,
  validateEmail: () => validateEmail,
  validatePassword: () => validatePassword
});
var init_src = __esm({
  "../utils/src/index.ts"() {
    "use strict";
    init_api();
    init_user_api_client();
    init_cn();
    init_date();
    init_string();
    init_async();
    init_validation();
    init_arg_parser();
    init_cloud_store_service();
    init_context_storage();
    init_platform_settings_service();
    init_app();
    init_validation2();
  }
});

// src/services/user-management-service.ts
var import_functions2, import_firestore3, UserManagementService, userManagementService;
var init_user_management_service = __esm({
  "src/services/user-management-service.ts"() {
    "use strict";
    import_functions2 = require("firebase/functions");
    import_firestore3 = require("firebase/firestore");
    init_firebase_config();
    UserManagementService = class {
      constructor() {
        // Firebase Functions (used in Firebase mode)
        this.createUserProfileFn = (0, import_functions2.httpsCallable)(functions, "createUserProfile");
        this.updateUserProfileFn = (0, import_functions2.httpsCallable)(functions, "updateUserProfile");
        // API client (lazy loaded for self-hosted mode)
        this.apiClient = null;
      }
      /**
       * Get deployment mode
       */
      getDeploymentMode() {
        const mode = process.env.DEPLOYMENT_MODE || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;
        return mode === "self-hosted" ? "self-hosted" : "firebase";
      }
      /**
       * Get API client (lazy load)
       */
      async getApiClient() {
        if (!this.apiClient && this.getDeploymentMode() === "self-hosted") {
          try {
            const { userApiClient: userApiClient2 } = await Promise.resolve().then(() => (init_src(), src_exports));
            this.apiClient = userApiClient2;
          } catch (error) {
            console.error("Failed to load API client:", error);
          }
        }
        return this.apiClient;
      }
      // ============================================================================
      // USER PROFILE OPERATIONS
      // ============================================================================
      /**
       * Create a new user profile
       * Uses Firebase Functions in Firebase mode, REST API in self-hosted mode
       */
      async createUser(userData) {
        try {
          const mode = this.getDeploymentMode();
          if (mode === "self-hosted") {
            const apiClient = await this.getApiClient();
            if (!apiClient) {
              throw new Error("API client not available");
            }
            return await apiClient.createUser(userData);
          } else {
            const result = await this.createUserProfileFn(userData);
            return result.data;
          }
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
       * Uses Firebase Functions in Firebase mode, REST API in self-hosted mode
       */
      async updateUser(updates) {
        try {
          const mode = this.getDeploymentMode();
          if (mode === "self-hosted") {
            const apiClient = await this.getApiClient();
            if (!apiClient) {
              throw new Error("API client not available");
            }
            const userId = updates.uid;
            if (!userId) {
              throw new Error("User ID is required for update");
            }
            return await apiClient.updateUser(userId, updates);
          } else {
            const result = await this.updateUserProfileFn(updates);
            return result.data;
          }
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
          const userDoc = await (0, import_firestore3.getDoc)((0, import_firestore3.doc)(db, "users", uid));
          if (userDoc.exists()) {
            return { uid, ...userDoc.data() };
          }
          return null;
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
          let q = (0, import_firestore3.query)((0, import_firestore3.collection)(db, "users"));
          if (filters?.role) {
            q = (0, import_firestore3.query)(q, (0, import_firestore3.where)("role", "==", filters.role));
          }
          if (filters?.status) {
            q = (0, import_firestore3.query)(q, (0, import_firestore3.where)("status", "==", filters.status));
          }
          if (filters?.organizationId) {
            q = (0, import_firestore3.query)(q, (0, import_firestore3.where)("organizationId", "==", filters.organizationId));
          }
          q = (0, import_firestore3.query)(q, (0, import_firestore3.orderBy)("metadata.createdAt", "desc"));
          if (filters?.limit) {
            q = (0, import_firestore3.query)(q, (0, import_firestore3.limit)(filters.limit));
          }
          const querySnapshot = await (0, import_firestore3.getDocs)(q);
          return querySnapshot.docs.map((doc3) => ({
            uid: doc3.id,
            ...doc3.data()
          }));
        } catch (error) {
          console.error("Error fetching users:", error);
          return [];
        }
      }
      /**
       * Subscribe to users collection changes
       */
      subscribeToUsers(callback, filters) {
        let q = (0, import_firestore3.query)((0, import_firestore3.collection)(db, "users"));
        if (filters?.role) {
          q = (0, import_firestore3.query)(q, (0, import_firestore3.where)("role", "==", filters.role));
        }
        if (filters?.status) {
          q = (0, import_firestore3.query)(q, (0, import_firestore3.where)("status", "==", filters.status));
        }
        if (filters?.organizationId) {
          q = (0, import_firestore3.query)(q, (0, import_firestore3.where)("organizationId", "==", filters.organizationId));
        }
        q = (0, import_firestore3.query)(q, (0, import_firestore3.orderBy)("metadata.createdAt", "desc"));
        if (filters?.limit) {
          q = (0, import_firestore3.query)(q, (0, import_firestore3.limit)(filters.limit));
        }
        return (0, import_firestore3.onSnapshot)(q, (querySnapshot) => {
          const users = querySnapshot.docs.map((doc3) => ({
            uid: doc3.id,
            ...doc3.data()
          }));
          callback(users);
        });
      }
      // ============================================================================
      // ACTIVITY TRACKING
      // ============================================================================
      /**
       * Get user activity logs
       */
      async getUserActivity(userId, limitCount = 50) {
        try {
          let q = (0, import_firestore3.query)((0, import_firestore3.collection)(db, "activityLogs"));
          if (userId) {
            q = (0, import_firestore3.query)(q, (0, import_firestore3.where)("userId", "==", userId));
          }
          q = (0, import_firestore3.query)(q, (0, import_firestore3.orderBy)("timestamp", "desc"), (0, import_firestore3.limit)(limitCount));
          const querySnapshot = await (0, import_firestore3.getDocs)(q);
          return querySnapshot.docs.map((doc3) => ({
            id: doc3.id,
            ...doc3.data()
          }));
        } catch (error) {
          console.error("Error fetching activity:", error);
          return [];
        }
      }
      /**
       * Subscribe to activity logs
       */
      subscribeToActivity(callback, userId, limitCount = 50) {
        let q = (0, import_firestore3.query)((0, import_firestore3.collection)(db, "activityLogs"));
        if (userId) {
          q = (0, import_firestore3.query)(q, (0, import_firestore3.where)("userId", "==", userId));
        }
        q = (0, import_firestore3.query)(q, (0, import_firestore3.orderBy)("timestamp", "desc"), (0, import_firestore3.limit)(limitCount));
        return (0, import_firestore3.onSnapshot)(q, (querySnapshot) => {
          const activities = querySnapshot.docs.map((doc3) => ({
            id: doc3.id,
            ...doc3.data()
          }));
          callback(activities);
        });
      }
      /**
       * Log user activity
       */
      async logActivity(activity) {
        try {
          await (0, import_firestore3.addDoc)((0, import_firestore3.collection)(db, "activityLogs"), {
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
          const settingsDoc = await (0, import_firestore3.getDoc)((0, import_firestore3.doc)(db, "userSettings", userId));
          if (settingsDoc.exists()) {
            return settingsDoc.data();
          }
          return null;
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
          await (0, import_firestore3.updateDoc)((0, import_firestore3.doc)(db, "userSettings", userId), settings);
          return true;
        } catch (error) {
          console.error("Error updating user settings:", error);
          return false;
        }
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
          await (0, import_firestore3.updateDoc)((0, import_firestore3.doc)(db, "users", userId), {
            organizationId,
            "metadata.lastModified": /* @__PURE__ */ new Date()
          });
          const orgRef = (0, import_firestore3.doc)(db, "organizations", organizationId);
          const orgDoc = await (0, import_firestore3.getDoc)(orgRef);
          if (orgDoc.exists()) {
            const currentMembers = orgDoc.data().members || [];
            if (!currentMembers.includes(userId)) {
              await (0, import_firestore3.updateDoc)(orgRef, {
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
          await (0, import_firestore3.updateDoc)((0, import_firestore3.doc)(db, "users", userId), {
            organizationId: null,
            "metadata.lastModified": /* @__PURE__ */ new Date()
          });
          const orgRef = (0, import_firestore3.doc)(db, "organizations", organizationId);
          const orgDoc = await (0, import_firestore3.getDoc)(orgRef);
          if (orgDoc.exists()) {
            const currentMembers = orgDoc.data().members || [];
            const updatedMembers = currentMembers.filter((id) => id !== userId);
            await (0, import_firestore3.updateDoc)(orgRef, {
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
          const q = (0, import_firestore3.query)(
            (0, import_firestore3.collection)(db, "notifications"),
            (0, import_firestore3.where)("userId", "==", userId),
            (0, import_firestore3.orderBy)("createdAt", "desc"),
            (0, import_firestore3.limit)(limitCount)
          );
          const querySnapshot = await (0, import_firestore3.getDocs)(q);
          return querySnapshot.docs.map((doc3) => ({
            id: doc3.id,
            ...doc3.data()
          }));
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
          await (0, import_firestore3.updateDoc)((0, import_firestore3.doc)(db, "notifications", notificationId), {
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
          await (0, import_firestore3.addDoc)((0, import_firestore3.collection)(db, "notifications"), {
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
              (u) => u.metadata.createdAt && new Date(u.metadata.createdAt.seconds * 1e3) > weekAgo
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
            await (0, import_firestore3.updateDoc)((0, import_firestore3.doc)(db, "users", userId), {
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
    };
    userManagementService = new UserManagementService();
  }
});

// src/adapters/firebase-auth.adapter.ts
function getFirebaseAuthAdapter() {
  if (!firebaseAuthInstance) {
    firebaseAuthInstance = new FirebaseAuthAdapter();
  }
  return firebaseAuthInstance;
}
var import_auth2, FirebaseAuthAdapter, firebaseAuthInstance;
var init_firebase_auth_adapter = __esm({
  "src/adapters/firebase-auth.adapter.ts"() {
    "use strict";
    import_auth2 = require("firebase/auth");
    init_firebase_config();
    FirebaseAuthAdapter = class {
      constructor() {
        this.initialized = false;
        this.googleProvider = new import_auth2.GoogleAuthProvider();
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
        const userCredential = await (0, import_auth2.signInWithEmailAndPassword)(
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
        const userCredential = await (0, import_auth2.createUserWithEmailAndPassword)(
          auth,
          credentials.email,
          credentials.password
        );
        if (credentials.displayName) {
          await (0, import_auth2.updateProfile)(userCredential.user, {
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
        await (0, import_auth2.signOut)(auth);
      }
      async signInWithGoogle() {
        const userCredential = await (0, import_auth2.signInWithPopup)(auth, this.googleProvider);
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
        await (0, import_auth2.updateProfile)(currentUser, {
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
        await (0, import_auth2.sendPasswordResetEmail)(auth, email);
      }
      async confirmPasswordReset(code, newPassword) {
        await (0, import_auth2.confirmPasswordReset)(auth, code, newPassword);
      }
      async updatePassword(newPassword) {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("No user is currently signed in");
        }
        await (0, import_auth2.updatePassword)(currentUser, newPassword);
      }
      async sendEmailVerification() {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("No user is currently signed in");
        }
        await (0, import_auth2.sendEmailVerification)(currentUser);
      }
      onAuthStateChanged(callback) {
        return (0, import_auth2.onAuthStateChanged)(auth, async (firebaseUser) => {
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
var UserManagementApiClient, userManagementApiClient;
var init_user_management_api_client = __esm({
  "src/services/user-management-api-client.ts"() {
    "use strict";
    UserManagementApiClient = class {
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
    userManagementApiClient = new UserManagementApiClient();
  }
});

// src/services/user-activity-service.ts
var STORAGE_KEYS, UserActivityService, userActivityService;
var init_user_activity_service = __esm({
  "src/services/user-activity-service.ts"() {
    "use strict";
    STORAGE_KEYS = {
      NOTES: "user_notes",
      MEETINGS: "user_meetings",
      TIMELINE: "user_timeline",
      PREFERENCES: "user_preferences",
      ACTIVITY: "user_activity",
      ACTION_ITEMS: "action_items"
    };
    UserActivityService = class {
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
      getActivities(limit2 = 100) {
        if (typeof window === "undefined") return [];
        const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
        const activities = stored ? JSON.parse(stored) : [];
        return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit2);
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
    userActivityService = new UserActivityService();
  }
});

// src/services/rbac-middleware.ts
var ROLE_PERMISSIONS, RBACMiddleware;
var init_rbac_middleware = __esm({
  "src/services/rbac-middleware.ts"() {
    "use strict";
    ROLE_PERMISSIONS = {
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
    RBACMiddleware = class {
      /**
       * Apply role-based filtering to database queries
       */
      static filterQuery(context, baseQuery = {}) {
        const permissions = ROLE_PERMISSIONS[context.userRole];
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
        const permissions = ROLE_PERMISSIONS[userRole];
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
        const permissions = ROLE_PERMISSIONS[context.userRole];
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
        const permissions = ROLE_PERMISSIONS[userRole];
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
        const permissions = ROLE_PERMISSIONS[userRole];
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
  }
});

// src/services/dc-context-store.ts
var DCContextStore, dcContextStore;
var init_dc_context_store = __esm({
  "src/services/dc-context-store.ts"() {
    "use strict";
    "use client";
    DCContextStore = class _DCContextStore {
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
    dcContextStore = DCContextStore.getInstance();
  }
});

// src/adapters/firestore.adapter.ts
function getFirestoreAdapter() {
  if (!firestoreInstance) {
    firestoreInstance = new FirestoreAdapter();
  }
  return firestoreInstance;
}
var import_firestore4, FirestoreAdapter, firestoreInstance;
var init_firestore_adapter = __esm({
  "src/adapters/firestore.adapter.ts"() {
    "use strict";
    import_firestore4 = require("firebase/firestore");
    init_firebase_config();
    FirestoreAdapter = class {
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
        const collectionRef = (0, import_firestore4.collection)(db, collectionName);
        const constraints = [];
        if (options?.filters) {
          options.filters.forEach((filter) => {
            constraints.push((0, import_firestore4.where)(filter.field, filter.operator, filter.value));
          });
        }
        if (options?.orderBy) {
          constraints.push((0, import_firestore4.orderBy)(options.orderBy, options.orderDirection || "asc"));
        }
        if (options?.limit) {
          constraints.push((0, import_firestore4.limit)(options.limit));
        }
        return (0, import_firestore4.query)(collectionRef, ...constraints);
      }
      async findMany(collection3, options) {
        const q = this.buildQuery(collection3, options);
        const querySnapshot = await (0, import_firestore4.getDocs)(q);
        return querySnapshot.docs.map((doc3) => ({
          id: doc3.id,
          ...doc3.data()
        }));
      }
      async findOne(collection3, id) {
        const docRef = (0, import_firestore4.doc)(db, collection3, id);
        const docSnap = await (0, import_firestore4.getDoc)(docRef);
        if (!docSnap.exists()) {
          return null;
        }
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      async findByField(collection3, field, value) {
        const results = await this.findMany(collection3, {
          filters: [{ field, operator: "==", value }],
          limit: 1
        });
        return results.length > 0 ? results[0] : null;
      }
      async create(collection3, data) {
        const collectionRef = (0, import_firestore4.collection)(db, collection3);
        const docRef = (0, import_firestore4.doc)(collectionRef);
        const fullData = {
          ...data,
          id: docRef.id,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await (0, import_firestore4.setDoc)(docRef, fullData);
        return fullData;
      }
      async update(collection3, id, data) {
        const docRef = (0, import_firestore4.doc)(db, collection3, id);
        const updateData = {
          ...data,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await (0, import_firestore4.updateDoc)(docRef, updateData);
        return await this.findOne(collection3, id);
      }
      async delete(collection3, id) {
        const docRef = (0, import_firestore4.doc)(db, collection3, id);
        await (0, import_firestore4.deleteDoc)(docRef);
      }
      async createMany(collection3, data) {
        const batch = (0, import_firestore4.writeBatch)(db);
        const created = [];
        data.forEach((item) => {
          const collectionRef = (0, import_firestore4.collection)(db, collection3);
          const docRef = (0, import_firestore4.doc)(collectionRef);
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
      async updateMany(collection3, ids, data) {
        const batch = (0, import_firestore4.writeBatch)(db);
        const updateData = {
          ...data,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        ids.forEach((id) => {
          const docRef = (0, import_firestore4.doc)(db, collection3, id);
          batch.update(docRef, updateData);
        });
        await batch.commit();
      }
      async deleteMany(collection3, ids) {
        const batch = (0, import_firestore4.writeBatch)(db);
        ids.forEach((id) => {
          const docRef = (0, import_firestore4.doc)(db, collection3, id);
          batch.delete(docRef);
        });
        await batch.commit();
      }
      async transaction(callback) {
        return await (0, import_firestore4.runTransaction)(db, async (transaction) => {
          const tx = {
            findOne: async (collection3, id) => {
              const docRef = (0, import_firestore4.doc)(db, collection3, id);
              const docSnap = await transaction.get(docRef);
              if (!docSnap.exists()) {
                return null;
              }
              return {
                id: docSnap.id,
                ...docSnap.data()
              };
            },
            create: async (collection3, data) => {
              const collectionRef = (0, import_firestore4.collection)(db, collection3);
              const docRef = (0, import_firestore4.doc)(collectionRef);
              const fullData = {
                ...data,
                id: docRef.id,
                createdAt: (/* @__PURE__ */ new Date()).toISOString(),
                updatedAt: (/* @__PURE__ */ new Date()).toISOString()
              };
              transaction.set(docRef, fullData);
              return fullData;
            },
            update: async (collection3, id, data) => {
              const docRef = (0, import_firestore4.doc)(db, collection3, id);
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
            delete: async (collection3, id) => {
              const docRef = (0, import_firestore4.doc)(db, collection3, id);
              transaction.delete(docRef);
            }
          };
          return await callback(tx);
        });
      }
      async exists(collection3, id) {
        const docRef = (0, import_firestore4.doc)(db, collection3, id);
        const docSnap = await (0, import_firestore4.getDoc)(docRef);
        return docSnap.exists();
      }
      async count(collection3, options) {
        const q = this.buildQuery(collection3, options);
        const snapshot = await (0, import_firestore4.getCountFromServer)(q);
        return snapshot.data().count;
      }
    };
    firestoreInstance = null;
  }
});

// src/adapters/postgres.adapter.ts
function getPostgresAdapter() {
  if (!postgresInstance) {
    postgresInstance = new PostgresAdapter();
  }
  return postgresInstance;
}
var import_client, PostgresAdapter, postgresInstance;
var init_postgres_adapter = __esm({
  "src/adapters/postgres.adapter.ts"() {
    "use strict";
    import_client = require("@prisma/client");
    PostgresAdapter = class {
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
      getModel(collection3) {
        const modelName = this.collectionToModelName(collection3);
        return this.prisma[modelName];
      }
      collectionToModelName(collection3) {
        const mapping = {
          users: "user",
          povs: "pOV",
          trrs: "tRR"
        };
        return mapping[collection3] || collection3;
      }
      buildWhereClause(options) {
        if (!options?.filters || options.filters.length === 0) {
          return {};
        }
        const where4 = {};
        options.filters.forEach((filter) => {
          switch (filter.operator) {
            case "==":
              where4[filter.field] = filter.value;
              break;
            case "!=":
              where4[filter.field] = { not: filter.value };
              break;
            case ">":
              where4[filter.field] = { gt: filter.value };
              break;
            case "<":
              where4[filter.field] = { lt: filter.value };
              break;
            case ">=":
              where4[filter.field] = { gte: filter.value };
              break;
            case "<=":
              where4[filter.field] = { lte: filter.value };
              break;
            case "in":
              where4[filter.field] = { in: filter.value };
              break;
            case "array-contains":
              where4[filter.field] = { has: filter.value };
              break;
          }
        });
        return where4;
      }
      async findMany(collection3, options) {
        const model = this.getModel(collection3);
        const where4 = this.buildWhereClause(options);
        const query4 = { where: where4 };
        if (options?.limit) {
          query4.take = options.limit;
        }
        if (options?.offset) {
          query4.skip = options.offset;
        }
        if (options?.orderBy) {
          query4.orderBy = {
            [options.orderBy]: options.orderDirection || "asc"
          };
        }
        return await model.findMany(query4);
      }
      async findOne(collection3, id) {
        const model = this.getModel(collection3);
        return await model.findUnique({
          where: { id }
        });
      }
      async findByField(collection3, field, value) {
        const model = this.getModel(collection3);
        return await model.findFirst({
          where: { [field]: value }
        });
      }
      async create(collection3, data) {
        const model = this.getModel(collection3);
        return await model.create({
          data
        });
      }
      async update(collection3, id, data) {
        const model = this.getModel(collection3);
        return await model.update({
          where: { id },
          data
        });
      }
      async delete(collection3, id) {
        const model = this.getModel(collection3);
        await model.delete({
          where: { id }
        });
      }
      async createMany(collection3, data) {
        const model = this.getModel(collection3);
        const created = [];
        for (const item of data) {
          const result = await model.create({ data: item });
          created.push(result);
        }
        return created;
      }
      async updateMany(collection3, ids, data) {
        const model = this.getModel(collection3);
        await model.updateMany({
          where: { id: { in: ids } },
          data
        });
      }
      async deleteMany(collection3, ids) {
        const model = this.getModel(collection3);
        await model.deleteMany({
          where: { id: { in: ids } }
        });
      }
      async transaction(callback) {
        return await this.prisma.$transaction(async (prisma) => {
          const tx = {
            findOne: async (collection3, id) => {
              const modelName = this.collectionToModelName(collection3);
              return await prisma[modelName].findUnique({
                where: { id }
              });
            },
            create: async (collection3, data) => {
              const modelName = this.collectionToModelName(collection3);
              return await prisma[modelName].create({
                data
              });
            },
            update: async (collection3, id, data) => {
              const modelName = this.collectionToModelName(collection3);
              return await prisma[modelName].update({
                where: { id },
                data
              });
            },
            delete: async (collection3, id) => {
              const modelName = this.collectionToModelName(collection3);
              await prisma[modelName].delete({
                where: { id }
              });
            }
          };
          return await callback(tx);
        });
      }
      async exists(collection3, id) {
        const model = this.getModel(collection3);
        const count = await model.count({
          where: { id }
        });
        return count > 0;
      }
      async count(collection3, options) {
        const model = this.getModel(collection3);
        const where4 = this.buildWhereClause(options);
        return await model.count({ where: where4 });
      }
    };
    postgresInstance = null;
  }
});

// src/adapters/database.factory.ts
function getDatabase() {
  return DatabaseFactory.getAdapter();
}
var DatabaseFactory;
var init_database_factory = __esm({
  "src/adapters/database.factory.ts"() {
    "use strict";
    init_firestore_adapter();
    init_postgres_adapter();
    DatabaseFactory = class {
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
  }
});

// src/adapters/firebase-storage.adapter.ts
function getFirebaseStorageAdapter() {
  if (!firebaseStorageAdapter) {
    firebaseStorageAdapter = new FirebaseStorageAdapter();
  }
  return firebaseStorageAdapter;
}
var import_storage2, FirebaseStorageAdapter, firebaseStorageAdapter;
var init_firebase_storage_adapter = __esm({
  "src/adapters/firebase-storage.adapter.ts"() {
    "use strict";
    import_storage2 = require("firebase/storage");
    FirebaseStorageAdapter = class {
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
    firebaseStorageAdapter = null;
  }
});

// src/adapters/minio-storage.adapter.ts
function getMinIOStorageAdapter() {
  if (!minioStorageAdapter) {
    minioStorageAdapter = new MinIOStorageAdapter();
  }
  return minioStorageAdapter;
}
var MinIOStorageAdapter, minioStorageAdapter;
var init_minio_storage_adapter = __esm({
  "src/adapters/minio-storage.adapter.ts"() {
    "use strict";
    MinIOStorageAdapter = class {
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
    minioStorageAdapter = null;
  }
});

// src/adapters/storage.factory.ts
function getStorage2() {
  return StorageFactory.getAdapter();
}
async function initializeStorage(config) {
  const adapter = config?.mode ? config.mode === "firebase" ? getFirebaseStorageAdapter() : getMinIOStorageAdapter() : StorageFactory.getAdapter();
  await adapter.initialize();
  return adapter;
}
var StorageFactory;
var init_storage_factory = __esm({
  "src/adapters/storage.factory.ts"() {
    "use strict";
    init_firebase_storage_adapter();
    init_minio_storage_adapter();
    StorageFactory = class {
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
  }
});

// src/services/database-validation-service.ts
var DatabaseValidationService, databaseValidationService;
var init_database_validation_service = __esm({
  "src/services/database-validation-service.ts"() {
    "use strict";
    init_database_factory();
    init_storage_factory();
    DatabaseValidationService = class {
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
        const passed = results.filter((r2) => r2.passed).length;
        const failed = results.filter((r2) => !r2.passed).length;
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
    databaseValidationService = new DatabaseValidationService();
  }
});

// src/services/analytics-service.ts
var AnalyticsService, analyticsService;
var init_analytics_service = __esm({
  "src/services/analytics-service.ts"() {
    "use strict";
    init_database_factory();
    AnalyticsService = class {
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
      async getUserRecentActivity(userId, limit2 = 10) {
        const db2 = getDatabase();
        try {
          const activities = await db2.findMany("activityLogs", {
            filters: [{ field: "userId", operator: "==", value: userId }],
            orderBy: "timestamp",
            orderDirection: "desc",
            limit: limit2
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
      async getTopUsers(limit2 = 5) {
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
          return userStats.sort((a, b) => b.activityScore - a.activityScore).slice(0, limit2);
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
    analyticsService = new AnalyticsService();
  }
});

// src/services/relationship-management-service.ts
var RelationshipManagementService, relationshipManagementService;
var init_relationship_management_service = __esm({
  "src/services/relationship-management-service.ts"() {
    "use strict";
    init_database_factory();
    RelationshipManagementService = class {
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
    relationshipManagementService = new RelationshipManagementService();
  }
});

// src/services/dynamic-record-service.ts
var DynamicRecordService, dynamicRecordService;
var init_dynamic_record_service = __esm({
  "src/services/dynamic-record-service.ts"() {
    "use strict";
    init_database_factory();
    init_relationship_management_service();
    DynamicRecordService = class {
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
    dynamicRecordService = new DynamicRecordService();
  }
});

// src/services/terraform-generation-service.ts
var TerraformGenerationService, terraformGenerationService;
var init_terraform_generation_service = __esm({
  "src/services/terraform-generation-service.ts"() {
    "use strict";
    init_database_factory();
    TerraformGenerationService = class {
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
        const hasGKE = config.resources.some((r2) => r2.type === "google_container_cluster");
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
        const hasFirestore = config.resources.some((r2) => r2.type === "google_firestore_database");
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
    terraformGenerationService = new TerraformGenerationService();
  }
});

// src/services/index.ts
var init_services = __esm({
  "src/services/index.ts"() {
    "use strict";
    init_data_service();
    init_user_management_service();
    init_user_management_api_client();
    init_user_activity_service();
    init_rbac_middleware();
    init_dc_context_store();
    init_database_validation_service();
    init_analytics_service();
    init_relationship_management_service();
    init_dynamic_record_service();
    init_terraform_generation_service();
  }
});

// src/firestore/client.ts
var import_firestore6, FirestoreClient;
var init_client = __esm({
  "src/firestore/client.ts"() {
    "use strict";
    import_firestore6 = require("firebase/firestore");
    FirestoreClient = class {
      constructor(config) {
        this.config = config;
        this.db = (0, import_firestore6.getFirestore)(config.app);
        if (config.useEmulator && config.emulatorHost && config.emulatorPort) {
          (0, import_firestore6.connectFirestoreEmulator)(this.db, config.emulatorHost, config.emulatorPort);
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
  }
});

// src/firestore/queries.ts
var FirestoreQueries;
var init_queries = __esm({
  "src/firestore/queries.ts"() {
    "use strict";
    FirestoreQueries = class {
      // Placeholder implementation
    };
  }
});

// src/schemas/user.ts
var import_zod, USER_COLLECTION, UserValidationRules, UserSchema;
var init_user = __esm({
  "src/schemas/user.ts"() {
    "use strict";
    import_zod = require("zod");
    USER_COLLECTION = "users";
    UserValidationRules = {
      required: ["email", "role"],
      maxNameLength: 100,
      maxBioLength: 500,
      validRoles: ["admin", "user", "viewer"]
    };
    UserSchema = import_zod.z.object({
      id: import_zod.z.string(),
      email: import_zod.z.string().email(),
      name: import_zod.z.string(),
      role: import_zod.z.enum(["admin", "user"]),
      createdAt: import_zod.z.date(),
      updatedAt: import_zod.z.date()
    });
  }
});

// src/schemas/chat.ts
var CHAT_COLLECTION, ChatValidationRules;
var init_chat = __esm({
  "src/schemas/chat.ts"() {
    "use strict";
    CHAT_COLLECTION = "chats";
    ChatValidationRules = {
      required: ["userId", "sessionId", "messages"],
      maxMessages: 1e3,
      maxTitleLength: 100
    };
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AnalyticsService: () => AnalyticsService,
  CHAT_COLLECTION: () => CHAT_COLLECTION,
  ChatValidationRules: () => ChatValidationRules,
  DatabaseValidationService: () => DatabaseValidationService,
  DynamicRecordService: () => DynamicRecordService,
  FirestoreClient: () => FirestoreClient,
  FirestoreQueries: () => FirestoreQueries,
  RBACMiddleware: () => RBACMiddleware,
  ROLE_PERMISSIONS: () => ROLE_PERMISSIONS,
  RelationshipManagementService: () => RelationshipManagementService,
  TerraformGenerationService: () => TerraformGenerationService,
  USER_COLLECTION: () => USER_COLLECTION,
  UserManagementService: () => UserManagementService,
  UserSchema: () => UserSchema,
  UserValidationRules: () => UserValidationRules,
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
  fetchAnalytics: () => fetchAnalytics,
  fetchBlueprintSummary: () => fetchBlueprintSummary,
  fetchRegionEngagements: () => fetchRegionEngagements,
  fetchUserEngagements: () => fetchUserEngagements,
  firebaseApp: () => firebaseApp,
  forceReconnectEmulators: () => forceReconnectEmulators,
  functions: () => functions,
  getAuth: () => getAuth2,
  getDatabase: () => getDatabase,
  getFirebaseConfig: () => getFirebaseConfig,
  getStorage: () => getStorage2,
  initializeStorage: () => initializeStorage,
  isMockAuthMode: () => isMockAuthMode,
  relationshipManagementService: () => relationshipManagementService,
  storage: () => storage,
  terraformGenerationService: () => terraformGenerationService,
  useEmulator: () => useEmulator,
  userActivityService: () => userActivityService,
  userManagementApiClient: () => userManagementApiClient,
  userManagementService: () => userManagementService
});
module.exports = __toCommonJS(index_exports);
var init_index = __esm({
  "src/index.ts"() {
    init_firebase_config();
    init_firebase_config();
    init_auth();
    init_services();
    init_client();
    init_queries();
    init_user();
    init_chat();
    init_storage_factory();
    init_database_factory();
    init_auth_factory();
  }
});
init_index();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnalyticsService,
  CHAT_COLLECTION,
  ChatValidationRules,
  DatabaseValidationService,
  DynamicRecordService,
  FirestoreClient,
  FirestoreQueries,
  RBACMiddleware,
  ROLE_PERMISSIONS,
  RelationshipManagementService,
  TerraformGenerationService,
  USER_COLLECTION,
  UserManagementService,
  UserSchema,
  UserValidationRules,
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
  fetchAnalytics,
  fetchBlueprintSummary,
  fetchRegionEngagements,
  fetchUserEngagements,
  firebaseApp,
  forceReconnectEmulators,
  functions,
  getAuth,
  getDatabase,
  getFirebaseConfig,
  getStorage,
  initializeStorage,
  isMockAuthMode,
  relationshipManagementService,
  storage,
  terraformGenerationService,
  useEmulator,
  userActivityService,
  userManagementApiClient,
  userManagementService
});
