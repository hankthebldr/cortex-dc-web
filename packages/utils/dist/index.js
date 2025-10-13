"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  APP_CONFIG: () => APP_CONFIG,
  VALIDATION_RULES: () => VALIDATION_RULES,
  api: () => api,
  apiService: () => apiService,
  cn: () => cn,
  debounce: () => debounce,
  formatDate: () => formatDate,
  formatRelativeTime: () => formatRelativeTime,
  generateId: () => generateId,
  slugify: () => slugify,
  throttle: () => throttle,
  validateEmail: () => validateEmail,
  validatePassword: () => validatePassword
});
module.exports = __toCommonJS(index_exports);

// src/api/api-service.ts
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

// src/cn.ts
var import_clsx = require("clsx");
function cn(...inputs) {
  return (0, import_clsx.clsx)(inputs);
}

// src/date.ts
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

// src/string.ts
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

// src/async.ts
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

// src/validation.ts
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validatePassword(password) {
  return password.length >= 8;
}

// src/constants/app.ts
var APP_CONFIG = {
  name: "Cortex DC Web",
  version: "0.1.0",
  description: "Domain Consultant Platform"
};

// src/constants/validation.ts
var VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  APP_CONFIG,
  VALIDATION_RULES,
  api,
  apiService,
  cn,
  debounce,
  formatDate,
  formatRelativeTime,
  generateId,
  slugify,
  throttle,
  validateEmail,
  validatePassword
});
