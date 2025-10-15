import {
  getStorage
} from "./chunk-IKMOBQEU.mjs";
import "./chunk-CHTYB55U.mjs";
import "./chunk-EBK3PWYE.mjs";

// ../utils/src/api/api-service.ts
var ApiService = class {
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
  createPaginatedResponse(data, page = 1, limit = 20, total) {
    const actualTotal = total || data.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = data.slice(start, end);
    return {
      success: true,
      data: paginatedData,
      timestamp: Date.now(),
      version: this.baseVersion,
      pagination: {
        page,
        limit,
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
var apiService = new ApiService();
var api = {
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

// ../utils/src/api/user-api-client.ts
var UserApiClient = class {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  }
  /**
   * Get authorization header
   */
  async getAuthHeader() {
    try {
      const { getAuth } = await import("./index.mjs");
      const auth = getAuth();
      const token = await auth.getIdToken();
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
var userApiClient = new UserApiClient();

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

// ../utils/src/cn.ts
function cn(...inputs) {
  return clsx(inputs);
}

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

// ../utils/src/string.ts
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

// ../utils/src/async.ts
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ../utils/src/validation.ts
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validatePassword(password) {
  return password.length >= 8;
}

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

// ../utils/src/storage/cloud-store-service.ts
var CloudStoreService = class {
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
      this.storage = getStorage();
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
var cloudStoreService = new CloudStoreService();
var cloud_store_service_default = cloudStoreService;

// ../utils/src/context/context-storage.ts
var ContextStorage = class {
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
var contextStorage = new ContextStorage();

// ../utils/src/platform/platform-settings-service.ts
var MAX_AUDIT_ENTRIES = 50;
var generateId2 = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch (error) {
    console.warn("crypto.randomUUID unavailable, falling back to pseudo-random id generation", error);
  }
  return `ps_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
};
var PlatformSettingsService = class {
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
var platformSettingsService = new PlatformSettingsService();

// ../utils/src/constants/app.ts
var APP_CONFIG = {
  name: "Cortex DC Web",
  version: "0.1.0",
  description: "Domain Consultant Platform"
};

// ../utils/src/constants/validation.ts
var VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3
};
export {
  APP_CONFIG,
  cloudStoreService as CloudStoreService,
  VALIDATION_RULES,
  api,
  apiService,
  argsToString,
  cloud_store_service_default as cloudStoreService,
  cn,
  contextStorage,
  debounce,
  formatDate,
  formatRelativeTime,
  generateId,
  parseArgs,
  platformSettingsService,
  slugify,
  throttle,
  userApiClient,
  validateArgs,
  validateEmail,
  validatePassword
};
