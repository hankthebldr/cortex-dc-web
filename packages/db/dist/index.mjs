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

// src/services/data-service.ts
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
async function fetchAnalytics(filters) {
  const sinceDays = filters.sinceDays ?? 90;
  const since = new Date(Date.now() - sinceDays * 864e5);
  try {
    const col = collection(db, "dc_engagements");
    const constraints = [];
    constraints.push(where("createdAt", ">=", Timestamp.fromDate(since)));
    if (filters.region && filters.region !== "GLOBAL") {
      constraints.push(where("region", "==", filters.region));
    }
    if (filters.theatre && filters.theatre !== "all") {
      constraints.push(where("theatre", "==", filters.theatre));
    }
    if (filters.user && filters.user !== "all") {
      constraints.push(where("user", "==", filters.user));
    }
    let q = query(col, ...constraints);
    let snap = await getDocs(q);
    if (snap.empty && constraints.length > 1) {
      console.warn("Query with filters returned empty, falling back to date-only filter");
      q = query(col, where("createdAt", ">=", Timestamp.fromDate(since)));
      snap = await getDocs(q);
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
    const okrSnap = await getDocs(collection(db, "dc_okrs"));
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
    const col = collection(db, "dc_engagements");
    const q = query(
      col,
      where("customer", "==", customer),
      where("createdAt", ">=", Timestamp.fromDate(since))
    );
    const snap = await getDocs(q);
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
    const scenariosExecuted = records.map((r) => r.scenariosExecuted ?? 0).reduce(sum, 0);
    const detectionsValidated = records.map((r) => r.detectionsValidated ?? 0).reduce(sum, 0);
    const trrWins = records.filter((r) => r.trrOutcome === "win").length;
    const trrLosses = records.filter((r) => r.trrOutcome === "loss").length;
    const avgCycleDays = records.length ? Math.round(records.map((r) => r.cycleDays ?? 0).reduce(sum, 0) / records.length) : 0;
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

// src/services/user-management-service.ts
import { httpsCallable } from "firebase/functions";
import {
  collection as collection2,
  doc,
  getDoc,
  getDocs as getDocs2,
  query as query2,
  where as where2,
  orderBy,
  limit,
  updateDoc,
  addDoc,
  onSnapshot
} from "firebase/firestore";
var UserManagementService = class {
  constructor() {
    // Firebase Functions
    this.createUserProfileFn = httpsCallable(functions, "createUserProfile");
    this.updateUserProfileFn = httpsCallable(functions, "updateUserProfile");
  }
  // ============================================================================
  // USER PROFILE OPERATIONS
  // ============================================================================
  /**
   * Create a new user profile
   */
  async createUser(userData) {
    try {
      const result = await this.createUserProfileFn(userData);
      return result.data;
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
      const result = await this.updateUserProfileFn(updates);
      return result.data;
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
      const userDoc = await getDoc(doc(db, "users", uid));
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
      let q = query2(collection2(db, "users"));
      if (filters?.role) {
        q = query2(q, where2("role", "==", filters.role));
      }
      if (filters?.status) {
        q = query2(q, where2("status", "==", filters.status));
      }
      if (filters?.organizationId) {
        q = query2(q, where2("organizationId", "==", filters.organizationId));
      }
      q = query2(q, orderBy("metadata.createdAt", "desc"));
      if (filters?.limit) {
        q = query2(q, limit(filters.limit));
      }
      const querySnapshot = await getDocs2(q);
      return querySnapshot.docs.map((doc2) => ({
        uid: doc2.id,
        ...doc2.data()
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
    let q = query2(collection2(db, "users"));
    if (filters?.role) {
      q = query2(q, where2("role", "==", filters.role));
    }
    if (filters?.status) {
      q = query2(q, where2("status", "==", filters.status));
    }
    if (filters?.organizationId) {
      q = query2(q, where2("organizationId", "==", filters.organizationId));
    }
    q = query2(q, orderBy("metadata.createdAt", "desc"));
    if (filters?.limit) {
      q = query2(q, limit(filters.limit));
    }
    return onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map((doc2) => ({
        uid: doc2.id,
        ...doc2.data()
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
      let q = query2(collection2(db, "activityLogs"));
      if (userId) {
        q = query2(q, where2("userId", "==", userId));
      }
      q = query2(q, orderBy("timestamp", "desc"), limit(limitCount));
      const querySnapshot = await getDocs2(q);
      return querySnapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data()
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
    let q = query2(collection2(db, "activityLogs"));
    if (userId) {
      q = query2(q, where2("userId", "==", userId));
    }
    q = query2(q, orderBy("timestamp", "desc"), limit(limitCount));
    return onSnapshot(q, (querySnapshot) => {
      const activities = querySnapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data()
      }));
      callback(activities);
    });
  }
  /**
   * Log user activity
   */
  async logActivity(activity) {
    try {
      await addDoc(collection2(db, "activityLogs"), {
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
      const settingsDoc = await getDoc(doc(db, "userSettings", userId));
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
      await updateDoc(doc(db, "userSettings", userId), settings);
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
      await updateDoc(doc(db, "users", userId), {
        organizationId,
        "metadata.lastModified": /* @__PURE__ */ new Date()
      });
      const orgRef = doc(db, "organizations", organizationId);
      const orgDoc = await getDoc(orgRef);
      if (orgDoc.exists()) {
        const currentMembers = orgDoc.data().members || [];
        if (!currentMembers.includes(userId)) {
          await updateDoc(orgRef, {
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
      await updateDoc(doc(db, "users", userId), {
        organizationId: null,
        "metadata.lastModified": /* @__PURE__ */ new Date()
      });
      const orgRef = doc(db, "organizations", organizationId);
      const orgDoc = await getDoc(orgRef);
      if (orgDoc.exists()) {
        const currentMembers = orgDoc.data().members || [];
        const updatedMembers = currentMembers.filter((id) => id !== userId);
        await updateDoc(orgRef, {
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
      const q = query2(
        collection2(db, "notifications"),
        where2("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs2(q);
      return querySnapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data()
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
      await updateDoc(doc(db, "notifications", notificationId), {
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
      await addDoc(collection2(db, "notifications"), {
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
        await updateDoc(doc(db, "users", userId), {
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
var userManagementService = new UserManagementService();

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
var userActivityService = new UserActivityService();

// src/services/rbac-middleware.ts
var ROLE_PERMISSIONS = {
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

// src/firestore/client.ts
import { getFirestore as getFirestore2, connectFirestoreEmulator as connectFirestoreEmulator2 } from "firebase/firestore";
var FirestoreClient = class {
  constructor(config) {
    this.config = config;
    this.db = getFirestore2(config.app);
    if (config.useEmulator && config.emulatorHost && config.emulatorPort) {
      connectFirestoreEmulator2(this.db, config.emulatorHost, config.emulatorPort);
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

// src/firestore/queries.ts
var FirestoreQueries = class {
  // Placeholder implementation
};

// src/schemas/user.ts
import { z } from "zod";
var USER_COLLECTION = "users";
var UserValidationRules = {
  required: ["email", "role"],
  maxNameLength: 100,
  maxBioLength: 500,
  validRoles: ["admin", "user", "viewer"]
};
var UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["admin", "user"]),
  createdAt: z.date(),
  updatedAt: z.date()
});

// src/schemas/chat.ts
var CHAT_COLLECTION = "chats";
var ChatValidationRules = {
  required: ["userId", "sessionId", "messages"],
  maxMessages: 1e3,
  maxTitleLength: 100
};
export {
  CHAT_COLLECTION,
  ChatValidationRules,
  FirestoreClient,
  FirestoreQueries,
  RBACMiddleware,
  ROLE_PERMISSIONS,
  USER_COLLECTION,
  UserManagementService,
  UserSchema,
  UserValidationRules,
  firebaseApp as app,
  auth,
  authService,
  calculateAvgCycleDays,
  calculateWinRate,
  db,
  dcContextStore,
  fetchAnalytics,
  fetchBlueprintSummary,
  fetchRegionEngagements,
  fetchUserEngagements,
  firebaseApp,
  forceReconnectEmulators,
  functions,
  getFirebaseConfig,
  isMockAuthMode,
  storage,
  useEmulator,
  userActivityService,
  userManagementService
};
