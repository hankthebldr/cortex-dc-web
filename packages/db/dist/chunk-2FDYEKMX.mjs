import {
  db,
  functions
} from "./chunk-EBK3PWYE.mjs";

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
    // Firebase Functions (used in Firebase mode)
    this.createUserProfileFn = httpsCallable(functions, "createUserProfile");
    this.updateUserProfileFn = httpsCallable(functions, "updateUserProfile");
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
        const { userApiClient } = await import("./src-7LP67GZM.mjs");
        this.apiClient = userApiClient;
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
      let q = query2(collection2(db, "activityLogs"));
      if (userId) {
        q = query2(q, where2("userId", "==", userId));
      }
      q = query2(q, orderBy("timestamp", "desc"), limit(limitCount));
      const querySnapshot = await getDocs2(q);
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
    let q = query2(collection2(db, "activityLogs"));
    if (userId) {
      q = query2(q, where2("userId", "==", userId));
    }
    q = query2(q, orderBy("timestamp", "desc"), limit(limitCount));
    return onSnapshot(q, (querySnapshot) => {
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
    const { getAuth: getAuth2 } = await import("./auth.factory-7ST26LRB.mjs");
    const auth = getAuth2();
    const token = await auth.getIdToken();
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

// src/adapters/firestore.adapter.ts
import {
  collection as firestoreCollection,
  doc as doc2,
  getDoc as getDoc2,
  getDocs as getDocs3,
  setDoc,
  updateDoc as updateDoc2,
  deleteDoc as deleteDoc2,
  query as query3,
  where as where3,
  orderBy as orderBy2,
  limit as firestoreLimit,
  writeBatch,
  runTransaction,
  getCountFromServer
} from "firebase/firestore";
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
    const collectionRef = firestoreCollection(db, collectionName);
    const constraints = [];
    if (options?.filters) {
      options.filters.forEach((filter) => {
        constraints.push(where3(filter.field, filter.operator, filter.value));
      });
    }
    if (options?.orderBy) {
      constraints.push(orderBy2(options.orderBy, options.orderDirection || "asc"));
    }
    if (options?.limit) {
      constraints.push(firestoreLimit(options.limit));
    }
    return query3(collectionRef, ...constraints);
  }
  async findMany(collection3, options) {
    const q = this.buildQuery(collection3, options);
    const querySnapshot = await getDocs3(q);
    return querySnapshot.docs.map((doc3) => ({
      id: doc3.id,
      ...doc3.data()
    }));
  }
  async findOne(collection3, id) {
    const docRef = doc2(db, collection3, id);
    const docSnap = await getDoc2(docRef);
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
    const collectionRef = firestoreCollection(db, collection3);
    const docRef = doc2(collectionRef);
    const fullData = {
      ...data,
      id: docRef.id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await setDoc(docRef, fullData);
    return fullData;
  }
  async update(collection3, id, data) {
    const docRef = doc2(db, collection3, id);
    const updateData = {
      ...data,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await updateDoc2(docRef, updateData);
    return await this.findOne(collection3, id);
  }
  async delete(collection3, id) {
    const docRef = doc2(db, collection3, id);
    await deleteDoc2(docRef);
  }
  async createMany(collection3, data) {
    const batch = writeBatch(db);
    const created = [];
    data.forEach((item) => {
      const collectionRef = firestoreCollection(db, collection3);
      const docRef = doc2(collectionRef);
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
    const batch = writeBatch(db);
    const updateData = {
      ...data,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    ids.forEach((id) => {
      const docRef = doc2(db, collection3, id);
      batch.update(docRef, updateData);
    });
    await batch.commit();
  }
  async deleteMany(collection3, ids) {
    const batch = writeBatch(db);
    ids.forEach((id) => {
      const docRef = doc2(db, collection3, id);
      batch.delete(docRef);
    });
    await batch.commit();
  }
  async transaction(callback) {
    return await runTransaction(db, async (transaction) => {
      const tx = {
        findOne: async (collection3, id) => {
          const docRef = doc2(db, collection3, id);
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
          const collectionRef = firestoreCollection(db, collection3);
          const docRef = doc2(collectionRef);
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
          const docRef = doc2(db, collection3, id);
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
          const docRef = doc2(db, collection3, id);
          transaction.delete(docRef);
        }
      };
      return await callback(tx);
    });
  }
  async exists(collection3, id) {
    const docRef = doc2(db, collection3, id);
    const docSnap = await getDoc2(docRef);
    return docSnap.exists();
  }
  async count(collection3, options) {
    const q = this.buildQuery(collection3, options);
    const snapshot = await getCountFromServer(q);
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
import { PrismaClient } from "@prisma/client";
var PostgresAdapter = class {
  constructor(databaseUrl) {
    this.connected = false;
    this.prisma = new PrismaClient({
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

// src/adapters/firebase-storage.adapter.ts
import {
  ref,
  uploadBytes,
  getDownloadURL,
  getBytes,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata
} from "firebase/storage";
var FirebaseStorageAdapter = class {
  constructor(storage) {
    this.storage = null;
    this.initialized = false;
    if (storage) {
      this.storage = storage;
      this.initialized = true;
    }
  }
  async initialize() {
    if (this.initialized) return;
    try {
      const { storage } = await import("./firebase-config-LZCTKU7M.mjs");
      if (storage) {
        this.storage = storage;
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
    const storageRef = ref(this.storage, path);
    const metadata = {
      contentType: options?.contentType,
      customMetadata: options?.customMetadata,
      cacheControl: options?.cacheControl
    };
    const uploadResult = await uploadBytes(storageRef, data, metadata);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return this.mapToStorageFile(uploadResult.metadata, downloadURL);
  }
  async getDownloadURL(path) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = ref(this.storage, path);
    return await getDownloadURL(storageRef);
  }
  async download(path) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = ref(this.storage, path);
    const arrayBuffer = await getBytes(storageRef);
    return new Uint8Array(arrayBuffer);
  }
  async delete(path) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = ref(this.storage, path);
    await deleteObject(storageRef);
  }
  async list(path, options) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = ref(this.storage, path);
    const listResult = await listAll(storageRef);
    const items = await Promise.all(
      listResult.items.map(async (item) => {
        const metadata = await getMetadata(item);
        const downloadURL = await getDownloadURL(item);
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
    const storageRef = ref(this.storage, path);
    const metadata = await getMetadata(storageRef);
    const downloadURL = await getDownloadURL(storageRef);
    return this.mapToStorageFile(metadata, downloadURL);
  }
  async updateMetadata(path, metadata) {
    await this.initialize();
    this.ensureInitialized();
    const storageRef = ref(this.storage, path);
    const newMetadata = {
      contentType: metadata.contentType,
      customMetadata: metadata.metadata,
      cacheControl: metadata.metadata?.cacheControl
    };
    const updatedMetadata = await updateMetadata(storageRef, newMetadata);
    const downloadURL = await getDownloadURL(storageRef);
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
function getStorage() {
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
      const storage = getStorage();
      await storage.initialize();
      const testPath = `test/${Date.now()}.txt`;
      const testData = new TextEncoder().encode("Test storage data");
      const uploaded = await storage.upload(testPath, testData, {
        contentType: "text/plain",
        customMetadata: { test: "true" }
      });
      if (!uploaded) {
        throw new Error("Upload failed");
      }
      const url = await storage.getDownloadURL(testPath);
      if (!url) {
        throw new Error("Failed to get download URL");
      }
      const exists = await storage.exists(testPath);
      if (!exists) {
        throw new Error("File existence check failed");
      }
      await storage.delete(testPath);
      const deletedExists = await storage.exists(testPath);
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
      const currentPhaseIndex = pov.phases.findIndex((p) => p.status === "in_progress");
      if (currentPhaseIndex === -1) {
        return { success: false, error: "No active phase found" };
      }
      const currentPhase = pov.phases[currentPhaseIndex];
      pov.phases[currentPhaseIndex].status = "done";
      pov.phases[currentPhaseIndex].endDate = /* @__PURE__ */ new Date();
      if (currentPhaseIndex < pov.phases.length - 1) {
        pov.phases[currentPhaseIndex + 1].status = "in_progress";
        pov.phases[currentPhaseIndex + 1].startDate = /* @__PURE__ */ new Date();
      } else {
        pov.status = "completed";
      }
      await db2.update("povs", povId, {
        phases: pov.phases,
        status: pov.status,
        updatedAt: /* @__PURE__ */ new Date(),
        lastModifiedBy: userId
      });
      await this.logLifecycleEvent({
        recordId: povId,
        recordType: "pov",
        from: currentPhase.name,
        to: pov.phases[currentPhaseIndex + 1]?.name || "completed",
        triggeredBy: userId,
        timestamp: /* @__PURE__ */ new Date(),
        metadata: { phaseIndex: currentPhaseIndex + 1 }
      });
      await this.logActivity({
        userId,
        action: "phase_transition",
        entityType: "pov",
        entityId: povId,
        entityTitle: pov.title,
        details: {
          from: currentPhase.name,
          to: pov.phases[currentPhaseIndex + 1]?.name || "completed"
        }
      });
      return {
        success: true,
        nextPhase: pov.phases[currentPhaseIndex + 1]?.name || "completed"
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
      const oldStatus = trr.status;
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
        entityTitle: trr.title,
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
      const trrResult = await this.createTRR(
        {
          title: `TRR for ${pov.title}`,
          description: `Technical Risk Review for POV: ${pov.title}`
        },
        pov.projectId,
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
          title: `Demo Scenario for ${pov.title}`,
          description: `Demo scenario for POV: ${pov.title}`,
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
    const config = {
      version: "1.5",
      provider,
      region: scenario.environment === "production" ? "us-central1" : "us-east1",
      projectId: scenario.projectId,
      resources: []
    };
    config.resources = await this.generateResourcesFromScenario(scenario);
    if (format === "hcl") {
      const hcl = this.generateHCL(config, options);
      return {
        filename: `${scenario.id}-deployment.tf`,
        content: hcl,
        format: "hcl",
        variables: this.extractVariables(config),
        outputs: this.generateOutputs(config)
      };
    } else {
      const json = this.generateJSON(config, options);
      return {
        filename: `${scenario.id}-deployment.tf.json`,
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

// src/firestore/client.ts
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
var FirestoreClient = class {
  constructor(config) {
    this.config = config;
    this.db = getFirestore(config.app);
    if (config.useEmulator && config.emulatorHost && config.emulatorPort) {
      connectFirestoreEmulator(this.db, config.emulatorHost, config.emulatorPort);
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
  authService,
  fetchAnalytics,
  fetchBlueprintSummary,
  fetchUserEngagements,
  fetchRegionEngagements,
  calculateWinRate,
  calculateAvgCycleDays,
  UserManagementService,
  userManagementService,
  userManagementApiClient,
  userActivityService,
  ROLE_PERMISSIONS,
  RBACMiddleware,
  dcContextStore,
  getDatabase,
  getStorage,
  initializeStorage,
  DatabaseValidationService,
  databaseValidationService,
  AnalyticsService,
  analyticsService,
  RelationshipManagementService,
  relationshipManagementService,
  DynamicRecordService,
  dynamicRecordService,
  TerraformGenerationService,
  terraformGenerationService,
  FirestoreClient,
  FirestoreQueries,
  USER_COLLECTION,
  UserValidationRules,
  UserSchema,
  CHAT_COLLECTION,
  ChatValidationRules
};
