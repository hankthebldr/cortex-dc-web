import {
  openDB
} from "./chunk-TGBCE53Q.mjs";

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
    const start2 = (page - 1) * limit;
    const end = start2 + limit;
    const paginatedData = data.slice(start2, end);
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
import { clsx } from "clsx";
function cn(...inputs) {
  return clsx(inputs);
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

// src/parsers/arg-parser.ts
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

// ../../node_modules/.pnpm/@firebase+util@1.13.0/node_modules/@firebase/util/dist/node-esm/index.node.esm.js
var CONSTANTS = {
  /**
   * @define {boolean} Whether this is the client Node.js SDK.
   */
  NODE_CLIENT: false,
  /**
   * @define {boolean} Whether this is the Admin Node.js SDK.
   */
  NODE_ADMIN: false,
  /**
   * Firebase SDK Version
   */
  SDK_VERSION: "${JSCORE_VERSION}"
};
var stringToByteArray$1 = function(str) {
  const out = [];
  let p = 0;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 128) {
      out[p++] = c;
    } else if (c < 2048) {
      out[p++] = c >> 6 | 192;
      out[p++] = c & 63 | 128;
    } else if ((c & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
      c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
      out[p++] = c >> 18 | 240;
      out[p++] = c >> 12 & 63 | 128;
      out[p++] = c >> 6 & 63 | 128;
      out[p++] = c & 63 | 128;
    } else {
      out[p++] = c >> 12 | 224;
      out[p++] = c >> 6 & 63 | 128;
      out[p++] = c & 63 | 128;
    }
  }
  return out;
};
var byteArrayToString = function(bytes) {
  const out = [];
  let pos = 0, c = 0;
  while (pos < bytes.length) {
    const c1 = bytes[pos++];
    if (c1 < 128) {
      out[c++] = String.fromCharCode(c1);
    } else if (c1 > 191 && c1 < 224) {
      const c2 = bytes[pos++];
      out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
    } else if (c1 > 239 && c1 < 365) {
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];
      const c4 = bytes[pos++];
      const u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 65536;
      out[c++] = String.fromCharCode(55296 + (u >> 10));
      out[c++] = String.fromCharCode(56320 + (u & 1023));
    } else {
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];
      out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
    }
  }
  return out.join("");
};
var base64 = {
  /**
   * Maps bytes to characters.
   */
  byteToCharMap_: null,
  /**
   * Maps characters to bytes.
   */
  charToByteMap_: null,
  /**
   * Maps bytes to websafe characters.
   * @private
   */
  byteToCharMapWebSafe_: null,
  /**
   * Maps websafe characters to bytes.
   * @private
   */
  charToByteMapWebSafe_: null,
  /**
   * Our default alphabet, shared between
   * ENCODED_VALS and ENCODED_VALS_WEBSAFE
   */
  ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /**
   * Our default alphabet. Value 64 (=) is special; it means "nothing."
   */
  get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  },
  /**
   * Our websafe alphabet.
   */
  get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  },
  /**
   * Whether this browser supports the atob and btoa functions. This extension
   * started at Mozilla but is now implemented by many browsers. We use the
   * ASSUME_* variables to avoid pulling in the full useragent detection library
   * but still allowing the standard per-browser compilations.
   *
   */
  HAS_NATIVE_SUPPORT: typeof atob === "function",
  /**
   * Base64-encode an array of bytes.
   *
   * @param input An array of bytes (numbers with
   *     value in [0, 255]) to encode.
   * @param webSafe Boolean indicating we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeByteArray(input, webSafe) {
    if (!Array.isArray(input)) {
      throw Error("encodeByteArray takes an array as a parameter");
    }
    this.init_();
    const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
    const output = [];
    for (let i = 0; i < input.length; i += 3) {
      const byte1 = input[i];
      const haveByte2 = i + 1 < input.length;
      const byte2 = haveByte2 ? input[i + 1] : 0;
      const haveByte3 = i + 2 < input.length;
      const byte3 = haveByte3 ? input[i + 2] : 0;
      const outByte1 = byte1 >> 2;
      const outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
      let outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
      let outByte4 = byte3 & 63;
      if (!haveByte3) {
        outByte4 = 64;
        if (!haveByte2) {
          outByte3 = 64;
        }
      }
      output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
    }
    return output.join("");
  },
  /**
   * Base64-encode a string.
   *
   * @param input A string to encode.
   * @param webSafe If true, we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeString(input, webSafe) {
    if (this.HAS_NATIVE_SUPPORT && !webSafe) {
      return btoa(input);
    }
    return this.encodeByteArray(stringToByteArray$1(input), webSafe);
  },
  /**
   * Base64-decode a string.
   *
   * @param input to decode.
   * @param webSafe True if we should use the
   *     alternative alphabet.
   * @return string representing the decoded value.
   */
  decodeString(input, webSafe) {
    if (this.HAS_NATIVE_SUPPORT && !webSafe) {
      return atob(input);
    }
    return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
  },
  /**
   * Base64-decode a string.
   *
   * In base-64 decoding, groups of four characters are converted into three
   * bytes.  If the encoder did not apply padding, the input length may not
   * be a multiple of 4.
   *
   * In this case, the last group will have fewer than 4 characters, and
   * padding will be inferred.  If the group has one or two characters, it decodes
   * to one byte.  If the group has three characters, it decodes to two bytes.
   *
   * @param input Input to decode.
   * @param webSafe True if we should use the web-safe alphabet.
   * @return bytes representing the decoded value.
   */
  decodeStringToByteArray(input, webSafe) {
    this.init_();
    const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
    const output = [];
    for (let i = 0; i < input.length; ) {
      const byte1 = charToByteMap[input.charAt(i++)];
      const haveByte2 = i < input.length;
      const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
      ++i;
      const haveByte3 = i < input.length;
      const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
      ++i;
      const haveByte4 = i < input.length;
      const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
      ++i;
      if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
        throw new DecodeBase64StringError();
      }
      const outByte1 = byte1 << 2 | byte2 >> 4;
      output.push(outByte1);
      if (byte3 !== 64) {
        const outByte2 = byte2 << 4 & 240 | byte3 >> 2;
        output.push(outByte2);
        if (byte4 !== 64) {
          const outByte3 = byte3 << 6 & 192 | byte4;
          output.push(outByte3);
        }
      }
    }
    return output;
  },
  /**
   * Lazy static initialization function. Called before
   * accessing any of the static map variables.
   * @private
   */
  init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {};
      this.charToByteMap_ = {};
      this.byteToCharMapWebSafe_ = {};
      this.charToByteMapWebSafe_ = {};
      for (let i = 0; i < this.ENCODED_VALS.length; i++) {
        this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
        this.charToByteMap_[this.byteToCharMap_[i]] = i;
        this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
        this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
        if (i >= this.ENCODED_VALS_BASE.length) {
          this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
          this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
        }
      }
    }
  }
};
var DecodeBase64StringError = class extends Error {
  constructor() {
    super(...arguments);
    this.name = "DecodeBase64StringError";
  }
};
var base64Encode = function(str) {
  const utf8Bytes = stringToByteArray$1(str);
  return base64.encodeByteArray(utf8Bytes, true);
};
var base64urlEncodeWithoutPadding = function(str) {
  return base64Encode(str).replace(/\./g, "");
};
function isCloudWorkstation(url) {
  try {
    const host = url.startsWith("http://") || url.startsWith("https://") ? new URL(url).hostname : url;
    return host.endsWith(".cloudworkstations.dev");
  } catch {
    return false;
  }
}
function isIndexedDBAvailable() {
  try {
    return typeof indexedDB === "object";
  } catch (e) {
    return false;
  }
}
function validateIndexedDBOpenable() {
  return new Promise((resolve, reject) => {
    try {
      let preExist = true;
      const DB_CHECK_NAME = "validate-browser-context-for-indexeddb-analytics-module";
      const request = self.indexedDB.open(DB_CHECK_NAME);
      request.onsuccess = () => {
        request.result.close();
        if (!preExist) {
          self.indexedDB.deleteDatabase(DB_CHECK_NAME);
        }
        resolve(true);
      };
      request.onupgradeneeded = () => {
        preExist = false;
      };
      request.onerror = () => {
        reject(request.error?.message || "");
      };
    } catch (error) {
      reject(error);
    }
  });
}
var ERROR_NAME = "FirebaseError";
var FirebaseError = class _FirebaseError extends Error {
  constructor(code, message, customData) {
    super(message);
    this.code = code;
    this.customData = customData;
    this.name = ERROR_NAME;
    Object.setPrototypeOf(this, _FirebaseError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorFactory.prototype.create);
    }
  }
};
var ErrorFactory = class {
  constructor(service, serviceName, errors) {
    this.service = service;
    this.serviceName = serviceName;
    this.errors = errors;
  }
  create(code, ...data) {
    const customData = data[0] || {};
    const fullCode = `${this.service}/${code}`;
    const template = this.errors[code];
    const message = template ? replaceTemplate(template, customData) : "Error";
    const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
    const error = new FirebaseError(fullCode, fullMessage, customData);
    return error;
  }
};
function replaceTemplate(template, data) {
  return template.replace(PATTERN, (_, key) => {
    const value = data[key];
    return value != null ? String(value) : `<${key}?>`;
  });
}
var PATTERN = /\{\$([^}]+)}/g;
var MAX_VALUE_MILLIS = 4 * 60 * 60 * 1e3;
function getModularInstance(service) {
  if (service && service._delegate) {
    return service._delegate;
  } else {
    return service;
  }
}
CONSTANTS.NODE_CLIENT = true;

// ../../node_modules/.pnpm/@firebase+component@0.7.0/node_modules/@firebase/component/dist/esm/index.esm.js
var Component = class {
  /**
   *
   * @param name The public service name, e.g. app, auth, firestore, database
   * @param instanceFactory Service factory responsible for creating the public interface
   * @param type whether the service provided by the component is public or private
   */
  constructor(name3, instanceFactory, type) {
    this.name = name3;
    this.instanceFactory = instanceFactory;
    this.type = type;
    this.multipleInstances = false;
    this.serviceProps = {};
    this.instantiationMode = "LAZY";
    this.onInstanceCreated = null;
  }
  setInstantiationMode(mode) {
    this.instantiationMode = mode;
    return this;
  }
  setMultipleInstances(multipleInstances) {
    this.multipleInstances = multipleInstances;
    return this;
  }
  setServiceProps(props) {
    this.serviceProps = props;
    return this;
  }
  setInstanceCreatedCallback(callback) {
    this.onInstanceCreated = callback;
    return this;
  }
};

// ../../node_modules/.pnpm/@firebase+logger@0.5.0/node_modules/@firebase/logger/dist/esm/index.esm.js
var instances = [];
var LogLevel;
(function(LogLevel2) {
  LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
  LogLevel2[LogLevel2["VERBOSE"] = 1] = "VERBOSE";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
  LogLevel2[LogLevel2["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
var levelStringToEnum = {
  "debug": LogLevel.DEBUG,
  "verbose": LogLevel.VERBOSE,
  "info": LogLevel.INFO,
  "warn": LogLevel.WARN,
  "error": LogLevel.ERROR,
  "silent": LogLevel.SILENT
};
var defaultLogLevel = LogLevel.INFO;
var ConsoleMethod = {
  [LogLevel.DEBUG]: "log",
  [LogLevel.VERBOSE]: "log",
  [LogLevel.INFO]: "info",
  [LogLevel.WARN]: "warn",
  [LogLevel.ERROR]: "error"
};
var defaultLogHandler = (instance, logType, ...args) => {
  if (logType < instance.logLevel) {
    return;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const method = ConsoleMethod[logType];
  if (method) {
    console[method](`[${now}]  ${instance.name}:`, ...args);
  } else {
    throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
  }
};
var Logger = class {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(name3) {
    this.name = name3;
    this._logLevel = defaultLogLevel;
    this._logHandler = defaultLogHandler;
    this._userLogHandler = null;
    instances.push(this);
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(val) {
    if (!(val in LogLevel)) {
      throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
    }
    this._logLevel = val;
  }
  // Workaround for setter/getter having to be the same type.
  setLogLevel(val) {
    this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(val) {
    if (typeof val !== "function") {
      throw new TypeError("Value assigned to `logHandler` must be a function");
    }
    this._logHandler = val;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(val) {
    this._userLogHandler = val;
  }
  /**
   * The functions below are all based on the `console` interface
   */
  debug(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
    this._logHandler(this, LogLevel.DEBUG, ...args);
  }
  log(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
    this._logHandler(this, LogLevel.VERBOSE, ...args);
  }
  info(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
    this._logHandler(this, LogLevel.INFO, ...args);
  }
  warn(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
    this._logHandler(this, LogLevel.WARN, ...args);
  }
  error(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
    this._logHandler(this, LogLevel.ERROR, ...args);
  }
};

// ../../node_modules/.pnpm/@firebase+app@0.14.4/node_modules/@firebase/app/dist/esm/index.esm.js
var PlatformLoggerServiceImpl = class {
  constructor(container) {
    this.container = container;
  }
  // In initial implementation, this will be called by installations on
  // auth token refresh, and installations will send this string.
  getPlatformInfoString() {
    const providers = this.container.getProviders();
    return providers.map((provider) => {
      if (isVersionServiceProvider(provider)) {
        const service = provider.getImmediate();
        return `${service.library}/${service.version}`;
      } else {
        return null;
      }
    }).filter((logString) => logString).join(" ");
  }
};
function isVersionServiceProvider(provider) {
  const component = provider.getComponent();
  return component?.type === "VERSION";
}
var name$q = "@firebase/app";
var version$1 = "0.14.4";
var logger = new Logger("@firebase/app");
var name$p = "@firebase/app-compat";
var name$o = "@firebase/analytics-compat";
var name$n = "@firebase/analytics";
var name$m = "@firebase/app-check-compat";
var name$l = "@firebase/app-check";
var name$k = "@firebase/auth";
var name$j = "@firebase/auth-compat";
var name$i = "@firebase/database";
var name$h = "@firebase/data-connect";
var name$g = "@firebase/database-compat";
var name$f = "@firebase/functions";
var name$e = "@firebase/functions-compat";
var name$d = "@firebase/installations";
var name$c = "@firebase/installations-compat";
var name$b = "@firebase/messaging";
var name$a = "@firebase/messaging-compat";
var name$9 = "@firebase/performance";
var name$8 = "@firebase/performance-compat";
var name$7 = "@firebase/remote-config";
var name$6 = "@firebase/remote-config-compat";
var name$5 = "@firebase/storage";
var name$4 = "@firebase/storage-compat";
var name$3 = "@firebase/firestore";
var name$2 = "@firebase/ai";
var name$1 = "@firebase/firestore-compat";
var name = "firebase";
var version = "12.4.0";
var PLATFORM_LOG_STRING = {
  [name$q]: "fire-core",
  [name$p]: "fire-core-compat",
  [name$n]: "fire-analytics",
  [name$o]: "fire-analytics-compat",
  [name$l]: "fire-app-check",
  [name$m]: "fire-app-check-compat",
  [name$k]: "fire-auth",
  [name$j]: "fire-auth-compat",
  [name$i]: "fire-rtdb",
  [name$h]: "fire-data-connect",
  [name$g]: "fire-rtdb-compat",
  [name$f]: "fire-fn",
  [name$e]: "fire-fn-compat",
  [name$d]: "fire-iid",
  [name$c]: "fire-iid-compat",
  [name$b]: "fire-fcm",
  [name$a]: "fire-fcm-compat",
  [name$9]: "fire-perf",
  [name$8]: "fire-perf-compat",
  [name$7]: "fire-rc",
  [name$6]: "fire-rc-compat",
  [name$5]: "fire-gcs",
  [name$4]: "fire-gcs-compat",
  [name$3]: "fire-fst",
  [name$1]: "fire-fst-compat",
  [name$2]: "fire-vertex",
  "fire-js": "fire-js",
  // Platform identifier for JS SDK.
  [name]: "fire-js-all"
};
var _apps = /* @__PURE__ */ new Map();
var _serverApps = /* @__PURE__ */ new Map();
var _components = /* @__PURE__ */ new Map();
function _addComponent(app, component) {
  try {
    app.container.addComponent(component);
  } catch (e) {
    logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
  }
}
function _registerComponent(component) {
  const componentName = component.name;
  if (_components.has(componentName)) {
    logger.debug(`There were multiple attempts to register component ${componentName}.`);
    return false;
  }
  _components.set(componentName, component);
  for (const app of _apps.values()) {
    _addComponent(app, component);
  }
  for (const serverApp of _serverApps.values()) {
    _addComponent(serverApp, component);
  }
  return true;
}
function _isFirebaseServerApp(obj) {
  if (obj === null || obj === void 0) {
    return false;
  }
  return obj.settings !== void 0;
}
var ERRORS = {
  [
    "no-app"
    /* AppError.NO_APP */
  ]: "No Firebase App '{$appName}' has been created - call initializeApp() first",
  [
    "bad-app-name"
    /* AppError.BAD_APP_NAME */
  ]: "Illegal App name: '{$appName}'",
  [
    "duplicate-app"
    /* AppError.DUPLICATE_APP */
  ]: "Firebase App named '{$appName}' already exists with different options or config",
  [
    "app-deleted"
    /* AppError.APP_DELETED */
  ]: "Firebase App named '{$appName}' already deleted",
  [
    "server-app-deleted"
    /* AppError.SERVER_APP_DELETED */
  ]: "Firebase Server App has been deleted",
  [
    "no-options"
    /* AppError.NO_OPTIONS */
  ]: "Need to provide options, when not being deployed to hosting via source.",
  [
    "invalid-app-argument"
    /* AppError.INVALID_APP_ARGUMENT */
  ]: "firebase.{$appName}() takes either no argument or a Firebase App instance.",
  [
    "invalid-log-argument"
    /* AppError.INVALID_LOG_ARGUMENT */
  ]: "First argument to `onLog` must be null or a function.",
  [
    "idb-open"
    /* AppError.IDB_OPEN */
  ]: "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-get"
    /* AppError.IDB_GET */
  ]: "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-set"
    /* AppError.IDB_WRITE */
  ]: "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-delete"
    /* AppError.IDB_DELETE */
  ]: "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "finalization-registry-not-supported"
    /* AppError.FINALIZATION_REGISTRY_NOT_SUPPORTED */
  ]: "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
  [
    "invalid-server-app-environment"
    /* AppError.INVALID_SERVER_APP_ENVIRONMENT */
  ]: "FirebaseServerApp is not for use in browser environments."
};
var ERROR_FACTORY = new ErrorFactory("app", "Firebase", ERRORS);
var SDK_VERSION = version;
function registerVersion(libraryKeyOrName, version3, variant) {
  let library = PLATFORM_LOG_STRING[libraryKeyOrName] ?? libraryKeyOrName;
  if (variant) {
    library += `-${variant}`;
  }
  const libraryMismatch = library.match(/\s|\//);
  const versionMismatch = version3.match(/\s|\//);
  if (libraryMismatch || versionMismatch) {
    const warning = [
      `Unable to register library "${library}" with version "${version3}":`
    ];
    if (libraryMismatch) {
      warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
    }
    if (libraryMismatch && versionMismatch) {
      warning.push("and");
    }
    if (versionMismatch) {
      warning.push(`version name "${version3}" contains illegal characters (whitespace or "/")`);
    }
    logger.warn(warning.join(" "));
    return;
  }
  _registerComponent(new Component(
    `${library}-version`,
    () => ({ library, version: version3 }),
    "VERSION"
    /* ComponentType.VERSION */
  ));
}
var DB_NAME = "firebase-heartbeat-database";
var DB_VERSION = 1;
var STORE_NAME = "firebase-heartbeat-store";
var dbPromise = null;
function getDbPromise() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade: (db, oldVersion) => {
        switch (oldVersion) {
          case 0:
            try {
              db.createObjectStore(STORE_NAME);
            } catch (e) {
              console.warn(e);
            }
        }
      }
    }).catch((e) => {
      throw ERROR_FACTORY.create("idb-open", {
        originalErrorMessage: e.message
      });
    });
  }
  return dbPromise;
}
async function readHeartbeatsFromIndexedDB(app) {
  try {
    const db = await getDbPromise();
    const tx = db.transaction(STORE_NAME);
    const result = await tx.objectStore(STORE_NAME).get(computeKey(app));
    await tx.done;
    return result;
  } catch (e) {
    if (e instanceof FirebaseError) {
      logger.warn(e.message);
    } else {
      const idbGetError = ERROR_FACTORY.create("idb-get", {
        originalErrorMessage: e?.message
      });
      logger.warn(idbGetError.message);
    }
  }
}
async function writeHeartbeatsToIndexedDB(app, heartbeatObject) {
  try {
    const db = await getDbPromise();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const objectStore = tx.objectStore(STORE_NAME);
    await objectStore.put(heartbeatObject, computeKey(app));
    await tx.done;
  } catch (e) {
    if (e instanceof FirebaseError) {
      logger.warn(e.message);
    } else {
      const idbGetError = ERROR_FACTORY.create("idb-set", {
        originalErrorMessage: e?.message
      });
      logger.warn(idbGetError.message);
    }
  }
}
function computeKey(app) {
  return `${app.name}!${app.options.appId}`;
}
var MAX_HEADER_BYTES = 1024;
var MAX_NUM_STORED_HEARTBEATS = 30;
var HeartbeatServiceImpl = class {
  constructor(container) {
    this.container = container;
    this._heartbeatsCache = null;
    const app = this.container.getProvider("app").getImmediate();
    this._storage = new HeartbeatStorageImpl(app);
    this._heartbeatsCachePromise = this._storage.read().then((result) => {
      this._heartbeatsCache = result;
      return result;
    });
  }
  /**
   * Called to report a heartbeat. The function will generate
   * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
   * to IndexedDB.
   * Note that we only store one heartbeat per day. So if a heartbeat for today is
   * already logged, subsequent calls to this function in the same day will be ignored.
   */
  async triggerHeartbeat() {
    try {
      const platformLogger = this.container.getProvider("platform-logger").getImmediate();
      const agent = platformLogger.getPlatformInfoString();
      const date = getUTCDateString();
      if (this._heartbeatsCache?.heartbeats == null) {
        this._heartbeatsCache = await this._heartbeatsCachePromise;
        if (this._heartbeatsCache?.heartbeats == null) {
          return;
        }
      }
      if (this._heartbeatsCache.lastSentHeartbeatDate === date || this._heartbeatsCache.heartbeats.some((singleDateHeartbeat) => singleDateHeartbeat.date === date)) {
        return;
      } else {
        this._heartbeatsCache.heartbeats.push({ date, agent });
        if (this._heartbeatsCache.heartbeats.length > MAX_NUM_STORED_HEARTBEATS) {
          const earliestHeartbeatIdx = getEarliestHeartbeatIdx(this._heartbeatsCache.heartbeats);
          this._heartbeatsCache.heartbeats.splice(earliestHeartbeatIdx, 1);
        }
      }
      return this._storage.overwrite(this._heartbeatsCache);
    } catch (e) {
      logger.warn(e);
    }
  }
  /**
   * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
   * It also clears all heartbeats from memory as well as in IndexedDB.
   *
   * NOTE: Consuming product SDKs should not send the header if this method
   * returns an empty string.
   */
  async getHeartbeatsHeader() {
    try {
      if (this._heartbeatsCache === null) {
        await this._heartbeatsCachePromise;
      }
      if (this._heartbeatsCache?.heartbeats == null || this._heartbeatsCache.heartbeats.length === 0) {
        return "";
      }
      const date = getUTCDateString();
      const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
      const headerString = base64urlEncodeWithoutPadding(JSON.stringify({ version: 2, heartbeats: heartbeatsToSend }));
      this._heartbeatsCache.lastSentHeartbeatDate = date;
      if (unsentEntries.length > 0) {
        this._heartbeatsCache.heartbeats = unsentEntries;
        await this._storage.overwrite(this._heartbeatsCache);
      } else {
        this._heartbeatsCache.heartbeats = [];
        void this._storage.overwrite(this._heartbeatsCache);
      }
      return headerString;
    } catch (e) {
      logger.warn(e);
      return "";
    }
  }
};
function getUTCDateString() {
  const today = /* @__PURE__ */ new Date();
  return today.toISOString().substring(0, 10);
}
function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
  const heartbeatsToSend = [];
  let unsentEntries = heartbeatsCache.slice();
  for (const singleDateHeartbeat of heartbeatsCache) {
    const heartbeatEntry = heartbeatsToSend.find((hb) => hb.agent === singleDateHeartbeat.agent);
    if (!heartbeatEntry) {
      heartbeatsToSend.push({
        agent: singleDateHeartbeat.agent,
        dates: [singleDateHeartbeat.date]
      });
      if (countBytes(heartbeatsToSend) > maxSize) {
        heartbeatsToSend.pop();
        break;
      }
    } else {
      heartbeatEntry.dates.push(singleDateHeartbeat.date);
      if (countBytes(heartbeatsToSend) > maxSize) {
        heartbeatEntry.dates.pop();
        break;
      }
    }
    unsentEntries = unsentEntries.slice(1);
  }
  return {
    heartbeatsToSend,
    unsentEntries
  };
}
var HeartbeatStorageImpl = class {
  constructor(app) {
    this.app = app;
    this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
  }
  async runIndexedDBEnvironmentCheck() {
    if (!isIndexedDBAvailable()) {
      return false;
    } else {
      return validateIndexedDBOpenable().then(() => true).catch(() => false);
    }
  }
  /**
   * Read all heartbeats.
   */
  async read() {
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return { heartbeats: [] };
    } else {
      const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
      if (idbHeartbeatObject?.heartbeats) {
        return idbHeartbeatObject;
      } else {
        return { heartbeats: [] };
      }
    }
  }
  // overwrite the storage with the provided heartbeats
  async overwrite(heartbeatsObject) {
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return;
    } else {
      const existingHeartbeatsObject = await this.read();
      return writeHeartbeatsToIndexedDB(this.app, {
        lastSentHeartbeatDate: heartbeatsObject.lastSentHeartbeatDate ?? existingHeartbeatsObject.lastSentHeartbeatDate,
        heartbeats: heartbeatsObject.heartbeats
      });
    }
  }
  // add heartbeats
  async add(heartbeatsObject) {
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return;
    } else {
      const existingHeartbeatsObject = await this.read();
      return writeHeartbeatsToIndexedDB(this.app, {
        lastSentHeartbeatDate: heartbeatsObject.lastSentHeartbeatDate ?? existingHeartbeatsObject.lastSentHeartbeatDate,
        heartbeats: [
          ...existingHeartbeatsObject.heartbeats,
          ...heartbeatsObject.heartbeats
        ]
      });
    }
  }
};
function countBytes(heartbeatsCache) {
  return base64urlEncodeWithoutPadding(
    // heartbeatsCache wrapper properties
    JSON.stringify({ version: 2, heartbeats: heartbeatsCache })
  ).length;
}
function getEarliestHeartbeatIdx(heartbeats) {
  if (heartbeats.length === 0) {
    return -1;
  }
  let earliestHeartbeatIdx = 0;
  let earliestHeartbeatDate = heartbeats[0].date;
  for (let i = 1; i < heartbeats.length; i++) {
    if (heartbeats[i].date < earliestHeartbeatDate) {
      earliestHeartbeatDate = heartbeats[i].date;
      earliestHeartbeatIdx = i;
    }
  }
  return earliestHeartbeatIdx;
}
function registerCoreComponents(variant) {
  _registerComponent(new Component(
    "platform-logger",
    (container) => new PlatformLoggerServiceImpl(container),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  _registerComponent(new Component(
    "heartbeat",
    (container) => new HeartbeatServiceImpl(container),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  registerVersion(name$q, version$1, variant);
  registerVersion(name$q, version$1, "esm2020");
  registerVersion("fire-js", "");
}
registerCoreComponents("");

// ../../node_modules/.pnpm/@firebase+storage@0.14.0_@firebase+app@0.14.4/node_modules/@firebase/storage/dist/node-esm/index.node.esm.js
var DEFAULT_HOST = "firebasestorage.googleapis.com";
var CONFIG_STORAGE_BUCKET_KEY = "storageBucket";
var DEFAULT_MAX_OPERATION_RETRY_TIME = 2 * 60 * 1e3;
var DEFAULT_MAX_UPLOAD_RETRY_TIME = 10 * 60 * 1e3;
var StorageError = class _StorageError extends FirebaseError {
  /**
   * @param code - A `StorageErrorCode` string to be prefixed with 'storage/' and
   *  added to the end of the message.
   * @param message  - Error message.
   * @param status_ - Corresponding HTTP Status Code
   */
  constructor(code, message, status_ = 0) {
    super(prependCode(code), `Firebase Storage: ${message} (${prependCode(code)})`);
    this.status_ = status_;
    this.customData = { serverResponse: null };
    this._baseMessage = this.message;
    Object.setPrototypeOf(this, _StorageError.prototype);
  }
  get status() {
    return this.status_;
  }
  set status(status) {
    this.status_ = status;
  }
  /**
   * Compares a `StorageErrorCode` against this error's code, filtering out the prefix.
   */
  _codeEquals(code) {
    return prependCode(code) === this.code;
  }
  /**
   * Optional response message that was added by the server.
   */
  get serverResponse() {
    return this.customData.serverResponse;
  }
  set serverResponse(serverResponse) {
    this.customData.serverResponse = serverResponse;
    if (this.customData.serverResponse) {
      this.message = `${this._baseMessage}
${this.customData.serverResponse}`;
    } else {
      this.message = this._baseMessage;
    }
  }
};
var StorageErrorCode;
(function(StorageErrorCode2) {
  StorageErrorCode2["UNKNOWN"] = "unknown";
  StorageErrorCode2["OBJECT_NOT_FOUND"] = "object-not-found";
  StorageErrorCode2["BUCKET_NOT_FOUND"] = "bucket-not-found";
  StorageErrorCode2["PROJECT_NOT_FOUND"] = "project-not-found";
  StorageErrorCode2["QUOTA_EXCEEDED"] = "quota-exceeded";
  StorageErrorCode2["UNAUTHENTICATED"] = "unauthenticated";
  StorageErrorCode2["UNAUTHORIZED"] = "unauthorized";
  StorageErrorCode2["UNAUTHORIZED_APP"] = "unauthorized-app";
  StorageErrorCode2["RETRY_LIMIT_EXCEEDED"] = "retry-limit-exceeded";
  StorageErrorCode2["INVALID_CHECKSUM"] = "invalid-checksum";
  StorageErrorCode2["CANCELED"] = "canceled";
  StorageErrorCode2["INVALID_EVENT_NAME"] = "invalid-event-name";
  StorageErrorCode2["INVALID_URL"] = "invalid-url";
  StorageErrorCode2["INVALID_DEFAULT_BUCKET"] = "invalid-default-bucket";
  StorageErrorCode2["NO_DEFAULT_BUCKET"] = "no-default-bucket";
  StorageErrorCode2["CANNOT_SLICE_BLOB"] = "cannot-slice-blob";
  StorageErrorCode2["SERVER_FILE_WRONG_SIZE"] = "server-file-wrong-size";
  StorageErrorCode2["NO_DOWNLOAD_URL"] = "no-download-url";
  StorageErrorCode2["INVALID_ARGUMENT"] = "invalid-argument";
  StorageErrorCode2["INVALID_ARGUMENT_COUNT"] = "invalid-argument-count";
  StorageErrorCode2["APP_DELETED"] = "app-deleted";
  StorageErrorCode2["INVALID_ROOT_OPERATION"] = "invalid-root-operation";
  StorageErrorCode2["INVALID_FORMAT"] = "invalid-format";
  StorageErrorCode2["INTERNAL_ERROR"] = "internal-error";
  StorageErrorCode2["UNSUPPORTED_ENVIRONMENT"] = "unsupported-environment";
})(StorageErrorCode || (StorageErrorCode = {}));
function prependCode(code) {
  return "storage/" + code;
}
function unknown() {
  const message = "An unknown error occurred, please check the error payload for server response.";
  return new StorageError(StorageErrorCode.UNKNOWN, message);
}
function objectNotFound(path) {
  return new StorageError(StorageErrorCode.OBJECT_NOT_FOUND, "Object '" + path + "' does not exist.");
}
function quotaExceeded(bucket) {
  return new StorageError(StorageErrorCode.QUOTA_EXCEEDED, "Quota for bucket '" + bucket + "' exceeded, please view quota on https://firebase.google.com/pricing/.");
}
function unauthenticated() {
  const message = "User is not authenticated, please authenticate using Firebase Authentication and try again.";
  return new StorageError(StorageErrorCode.UNAUTHENTICATED, message);
}
function unauthorizedApp() {
  return new StorageError(StorageErrorCode.UNAUTHORIZED_APP, "This app does not have permission to access Firebase Storage on this project.");
}
function unauthorized(path) {
  return new StorageError(StorageErrorCode.UNAUTHORIZED, "User does not have permission to access '" + path + "'.");
}
function retryLimitExceeded() {
  return new StorageError(StorageErrorCode.RETRY_LIMIT_EXCEEDED, "Max retry time for operation exceeded, please try again.");
}
function canceled() {
  return new StorageError(StorageErrorCode.CANCELED, "User canceled the upload/download.");
}
function invalidUrl(url) {
  return new StorageError(StorageErrorCode.INVALID_URL, "Invalid URL '" + url + "'.");
}
function invalidDefaultBucket(bucket) {
  return new StorageError(StorageErrorCode.INVALID_DEFAULT_BUCKET, "Invalid default bucket '" + bucket + "'.");
}
function noDefaultBucket() {
  return new StorageError(StorageErrorCode.NO_DEFAULT_BUCKET, "No default bucket found. Did you set the '" + CONFIG_STORAGE_BUCKET_KEY + "' property when initializing the app?");
}
function cannotSliceBlob() {
  return new StorageError(StorageErrorCode.CANNOT_SLICE_BLOB, "Cannot slice blob for upload. Please retry the upload.");
}
function noDownloadURL() {
  return new StorageError(StorageErrorCode.NO_DOWNLOAD_URL, "The given file does not have any download URLs.");
}
function invalidArgument(message) {
  return new StorageError(StorageErrorCode.INVALID_ARGUMENT, message);
}
function appDeleted() {
  return new StorageError(StorageErrorCode.APP_DELETED, "The Firebase app was deleted.");
}
function invalidRootOperation(name3) {
  return new StorageError(StorageErrorCode.INVALID_ROOT_OPERATION, "The operation '" + name3 + "' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').");
}
function invalidFormat(format, message) {
  return new StorageError(StorageErrorCode.INVALID_FORMAT, "String does not match format '" + format + "': " + message);
}
function internalError(message) {
  throw new StorageError(StorageErrorCode.INTERNAL_ERROR, "Internal error: " + message);
}
var Location = class _Location {
  constructor(bucket, path) {
    this.bucket = bucket;
    this.path_ = path;
  }
  get path() {
    return this.path_;
  }
  get isRoot() {
    return this.path.length === 0;
  }
  fullServerUrl() {
    const encode = encodeURIComponent;
    return "/b/" + encode(this.bucket) + "/o/" + encode(this.path);
  }
  bucketOnlyServerUrl() {
    const encode = encodeURIComponent;
    return "/b/" + encode(this.bucket) + "/o";
  }
  static makeFromBucketSpec(bucketString, host) {
    let bucketLocation;
    try {
      bucketLocation = _Location.makeFromUrl(bucketString, host);
    } catch (e) {
      return new _Location(bucketString, "");
    }
    if (bucketLocation.path === "") {
      return bucketLocation;
    } else {
      throw invalidDefaultBucket(bucketString);
    }
  }
  static makeFromUrl(url, host) {
    let location = null;
    const bucketDomain = "([A-Za-z0-9.\\-_]+)";
    function gsModify(loc) {
      if (loc.path.charAt(loc.path.length - 1) === "/") {
        loc.path_ = loc.path_.slice(0, -1);
      }
    }
    const gsPath = "(/(.*))?$";
    const gsRegex = new RegExp("^gs://" + bucketDomain + gsPath, "i");
    const gsIndices = { bucket: 1, path: 3 };
    function httpModify(loc) {
      loc.path_ = decodeURIComponent(loc.path);
    }
    const version3 = "v[A-Za-z0-9_]+";
    const firebaseStorageHost = host.replace(/[.]/g, "\\.");
    const firebaseStoragePath = "(/([^?#]*).*)?$";
    const firebaseStorageRegExp = new RegExp(`^https?://${firebaseStorageHost}/${version3}/b/${bucketDomain}/o${firebaseStoragePath}`, "i");
    const firebaseStorageIndices = { bucket: 1, path: 3 };
    const cloudStorageHost = host === DEFAULT_HOST ? "(?:storage.googleapis.com|storage.cloud.google.com)" : host;
    const cloudStoragePath = "([^?#]*)";
    const cloudStorageRegExp = new RegExp(`^https?://${cloudStorageHost}/${bucketDomain}/${cloudStoragePath}`, "i");
    const cloudStorageIndices = { bucket: 1, path: 2 };
    const groups = [
      { regex: gsRegex, indices: gsIndices, postModify: gsModify },
      {
        regex: firebaseStorageRegExp,
        indices: firebaseStorageIndices,
        postModify: httpModify
      },
      {
        regex: cloudStorageRegExp,
        indices: cloudStorageIndices,
        postModify: httpModify
      }
    ];
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const captures = group.regex.exec(url);
      if (captures) {
        const bucketValue = captures[group.indices.bucket];
        let pathValue = captures[group.indices.path];
        if (!pathValue) {
          pathValue = "";
        }
        location = new _Location(bucketValue, pathValue);
        group.postModify(location);
        break;
      }
    }
    if (location == null) {
      throw invalidUrl(url);
    }
    return location;
  }
};
var FailRequest = class {
  constructor(error) {
    this.promise_ = Promise.reject(error);
  }
  /** @inheritDoc */
  getPromise() {
    return this.promise_;
  }
  /** @inheritDoc */
  cancel(_appDelete = false) {
  }
};
function start(doRequest, backoffCompleteCb, timeout) {
  let waitSeconds = 1;
  let retryTimeoutId = null;
  let globalTimeoutId = null;
  let hitTimeout = false;
  let cancelState = 0;
  function canceled2() {
    return cancelState === 2;
  }
  let triggeredCallback = false;
  function triggerCallback(...args) {
    if (!triggeredCallback) {
      triggeredCallback = true;
      backoffCompleteCb.apply(null, args);
    }
  }
  function callWithDelay(millis) {
    retryTimeoutId = setTimeout(() => {
      retryTimeoutId = null;
      doRequest(responseHandler, canceled2());
    }, millis);
  }
  function clearGlobalTimeout() {
    if (globalTimeoutId) {
      clearTimeout(globalTimeoutId);
    }
  }
  function responseHandler(success, ...args) {
    if (triggeredCallback) {
      clearGlobalTimeout();
      return;
    }
    if (success) {
      clearGlobalTimeout();
      triggerCallback.call(null, success, ...args);
      return;
    }
    const mustStop = canceled2() || hitTimeout;
    if (mustStop) {
      clearGlobalTimeout();
      triggerCallback.call(null, success, ...args);
      return;
    }
    if (waitSeconds < 64) {
      waitSeconds *= 2;
    }
    let waitMillis;
    if (cancelState === 1) {
      cancelState = 2;
      waitMillis = 0;
    } else {
      waitMillis = (waitSeconds + Math.random()) * 1e3;
    }
    callWithDelay(waitMillis);
  }
  let stopped = false;
  function stop2(wasTimeout) {
    if (stopped) {
      return;
    }
    stopped = true;
    clearGlobalTimeout();
    if (triggeredCallback) {
      return;
    }
    if (retryTimeoutId !== null) {
      if (!wasTimeout) {
        cancelState = 2;
      }
      clearTimeout(retryTimeoutId);
      callWithDelay(0);
    } else {
      if (!wasTimeout) {
        cancelState = 1;
      }
    }
  }
  callWithDelay(0);
  globalTimeoutId = setTimeout(() => {
    hitTimeout = true;
    stop2(true);
  }, timeout);
  return stop2;
}
function stop(id) {
  id(false);
}
function isJustDef(p) {
  return p !== void 0;
}
function isNonArrayObject(p) {
  return typeof p === "object" && !Array.isArray(p);
}
function isString(p) {
  return typeof p === "string" || p instanceof String;
}
function isNativeBlob(p) {
  return isNativeBlobDefined() && p instanceof Blob;
}
function isNativeBlobDefined() {
  return typeof Blob !== "undefined";
}
function validateNumber(argument, minValue, maxValue, value) {
  if (value < minValue) {
    throw invalidArgument(`Invalid value for '${argument}'. Expected ${minValue} or greater.`);
  }
  if (value > maxValue) {
    throw invalidArgument(`Invalid value for '${argument}'. Expected ${maxValue} or less.`);
  }
}
function makeUrl(urlPart, host, protocol) {
  let origin = host;
  if (protocol == null) {
    origin = `https://${host}`;
  }
  return `${protocol}://${origin}/v0${urlPart}`;
}
function makeQueryString(params) {
  const encode = encodeURIComponent;
  let queryPart = "?";
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const nextPart = encode(key) + "=" + encode(params[key]);
      queryPart = queryPart + nextPart + "&";
    }
  }
  queryPart = queryPart.slice(0, -1);
  return queryPart;
}
var ErrorCode;
(function(ErrorCode2) {
  ErrorCode2[ErrorCode2["NO_ERROR"] = 0] = "NO_ERROR";
  ErrorCode2[ErrorCode2["NETWORK_ERROR"] = 1] = "NETWORK_ERROR";
  ErrorCode2[ErrorCode2["ABORT"] = 2] = "ABORT";
})(ErrorCode || (ErrorCode = {}));
function isRetryStatusCode(status, additionalRetryCodes) {
  const isFiveHundredCode = status >= 500 && status < 600;
  const extraRetryCodes = [
    // Request Timeout: web server didn't receive full request in time.
    408,
    // Too Many Requests: you're getting rate-limited, basically.
    429
  ];
  const isExtraRetryCode = extraRetryCodes.indexOf(status) !== -1;
  const isAdditionalRetryCode = additionalRetryCodes.indexOf(status) !== -1;
  return isFiveHundredCode || isExtraRetryCode || isAdditionalRetryCode;
}
var NetworkRequest = class {
  constructor(url_, method_, headers_, body_, successCodes_, additionalRetryCodes_, callback_, errorCallback_, timeout_, progressCallback_, connectionFactory_, retry = true, isUsingEmulator = false) {
    this.url_ = url_;
    this.method_ = method_;
    this.headers_ = headers_;
    this.body_ = body_;
    this.successCodes_ = successCodes_;
    this.additionalRetryCodes_ = additionalRetryCodes_;
    this.callback_ = callback_;
    this.errorCallback_ = errorCallback_;
    this.timeout_ = timeout_;
    this.progressCallback_ = progressCallback_;
    this.connectionFactory_ = connectionFactory_;
    this.retry = retry;
    this.isUsingEmulator = isUsingEmulator;
    this.pendingConnection_ = null;
    this.backoffId_ = null;
    this.canceled_ = false;
    this.appDelete_ = false;
    this.promise_ = new Promise((resolve, reject) => {
      this.resolve_ = resolve;
      this.reject_ = reject;
      this.start_();
    });
  }
  /**
   * Actually starts the retry loop.
   */
  start_() {
    const doTheRequest = (backoffCallback, canceled2) => {
      if (canceled2) {
        backoffCallback(false, new RequestEndStatus(false, null, true));
        return;
      }
      const connection = this.connectionFactory_();
      this.pendingConnection_ = connection;
      const progressListener = (progressEvent) => {
        const loaded = progressEvent.loaded;
        const total = progressEvent.lengthComputable ? progressEvent.total : -1;
        if (this.progressCallback_ !== null) {
          this.progressCallback_(loaded, total);
        }
      };
      if (this.progressCallback_ !== null) {
        connection.addUploadProgressListener(progressListener);
      }
      connection.send(this.url_, this.method_, this.isUsingEmulator, this.body_, this.headers_).then(() => {
        if (this.progressCallback_ !== null) {
          connection.removeUploadProgressListener(progressListener);
        }
        this.pendingConnection_ = null;
        const hitServer = connection.getErrorCode() === ErrorCode.NO_ERROR;
        const status = connection.getStatus();
        if (!hitServer || isRetryStatusCode(status, this.additionalRetryCodes_) && this.retry) {
          const wasCanceled = connection.getErrorCode() === ErrorCode.ABORT;
          backoffCallback(false, new RequestEndStatus(false, null, wasCanceled));
          return;
        }
        const successCode = this.successCodes_.indexOf(status) !== -1;
        backoffCallback(true, new RequestEndStatus(successCode, connection));
      });
    };
    const backoffDone = (requestWentThrough, status) => {
      const resolve = this.resolve_;
      const reject = this.reject_;
      const connection = status.connection;
      if (status.wasSuccessCode) {
        try {
          const result = this.callback_(connection, connection.getResponse());
          if (isJustDef(result)) {
            resolve(result);
          } else {
            resolve();
          }
        } catch (e) {
          reject(e);
        }
      } else {
        if (connection !== null) {
          const err = unknown();
          err.serverResponse = connection.getErrorText();
          if (this.errorCallback_) {
            reject(this.errorCallback_(connection, err));
          } else {
            reject(err);
          }
        } else {
          if (status.canceled) {
            const err = this.appDelete_ ? appDeleted() : canceled();
            reject(err);
          } else {
            const err = retryLimitExceeded();
            reject(err);
          }
        }
      }
    };
    if (this.canceled_) {
      backoffDone(false, new RequestEndStatus(false, null, true));
    } else {
      this.backoffId_ = start(doTheRequest, backoffDone, this.timeout_);
    }
  }
  /** @inheritDoc */
  getPromise() {
    return this.promise_;
  }
  /** @inheritDoc */
  cancel(appDelete) {
    this.canceled_ = true;
    this.appDelete_ = appDelete || false;
    if (this.backoffId_ !== null) {
      stop(this.backoffId_);
    }
    if (this.pendingConnection_ !== null) {
      this.pendingConnection_.abort();
    }
  }
};
var RequestEndStatus = class {
  constructor(wasSuccessCode, connection, canceled2) {
    this.wasSuccessCode = wasSuccessCode;
    this.connection = connection;
    this.canceled = !!canceled2;
  }
};
function addAuthHeader_(headers, authToken) {
  if (authToken !== null && authToken.length > 0) {
    headers["Authorization"] = "Firebase " + authToken;
  }
}
function addVersionHeader_(headers, firebaseVersion) {
  headers["X-Firebase-Storage-Version"] = "webjs/" + (firebaseVersion ?? "AppManager");
}
function addGmpidHeader_(headers, appId) {
  if (appId) {
    headers["X-Firebase-GMPID"] = appId;
  }
}
function addAppCheckHeader_(headers, appCheckToken) {
  if (appCheckToken !== null) {
    headers["X-Firebase-AppCheck"] = appCheckToken;
  }
}
function makeRequest(requestInfo, appId, authToken, appCheckToken, requestFactory, firebaseVersion, retry = true, isUsingEmulator = false) {
  const queryPart = makeQueryString(requestInfo.urlParams);
  const url = requestInfo.url + queryPart;
  const headers = Object.assign({}, requestInfo.headers);
  addGmpidHeader_(headers, appId);
  addAuthHeader_(headers, authToken);
  addVersionHeader_(headers, firebaseVersion);
  addAppCheckHeader_(headers, appCheckToken);
  return new NetworkRequest(url, requestInfo.method, headers, requestInfo.body, requestInfo.successCodes, requestInfo.additionalRetryCodes, requestInfo.handler, requestInfo.errorHandler, requestInfo.timeout, requestInfo.progressCallback, requestFactory, retry, isUsingEmulator);
}
function getBlobBuilder() {
  if (typeof BlobBuilder !== "undefined") {
    return BlobBuilder;
  } else if (typeof WebKitBlobBuilder !== "undefined") {
    return WebKitBlobBuilder;
  } else {
    return void 0;
  }
}
function getBlob$1(...args) {
  const BlobBuilder2 = getBlobBuilder();
  if (BlobBuilder2 !== void 0) {
    const bb = new BlobBuilder2();
    for (let i = 0; i < args.length; i++) {
      bb.append(args[i]);
    }
    return bb.getBlob();
  } else {
    if (isNativeBlobDefined()) {
      return new Blob(args);
    } else {
      throw new StorageError(StorageErrorCode.UNSUPPORTED_ENVIRONMENT, "This browser doesn't seem to support creating Blobs");
    }
  }
}
function sliceBlob(blob, start2, end) {
  if (blob.webkitSlice) {
    return blob.webkitSlice(start2, end);
  } else if (blob.mozSlice) {
    return blob.mozSlice(start2, end);
  } else if (blob.slice) {
    return blob.slice(start2, end);
  }
  return null;
}
function decodeBase64(encoded) {
  if (/[^-A-Za-z0-9+/=]/.test(encoded)) {
    throw invalidFormat("base64", "Invalid character found");
  }
  return Buffer.from(encoded, "base64").toString("binary");
}
var StringFormat = {
  /**
   * Indicates the string should be interpreted "raw", that is, as normal text.
   * The string will be interpreted as UTF-16, then uploaded as a UTF-8 byte
   * sequence.
   * Example: The string 'Hello! \\ud83d\\ude0a' becomes the byte sequence
   * 48 65 6c 6c 6f 21 20 f0 9f 98 8a
   */
  RAW: "raw",
  /**
   * Indicates the string should be interpreted as base64-encoded data.
   * Padding characters (trailing '='s) are optional.
   * Example: The string 'rWmO++E6t7/rlw==' becomes the byte sequence
   * ad 69 8e fb e1 3a b7 bf eb 97
   */
  BASE64: "base64",
  /**
   * Indicates the string should be interpreted as base64url-encoded data.
   * Padding characters (trailing '='s) are optional.
   * Example: The string 'rWmO--E6t7_rlw==' becomes the byte sequence
   * ad 69 8e fb e1 3a b7 bf eb 97
   */
  BASE64URL: "base64url",
  /**
   * Indicates the string is a data URL, such as one obtained from
   * canvas.toDataURL().
   * Example: the string 'data:application/octet-stream;base64,aaaa'
   * becomes the byte sequence
   * 69 a6 9a
   * (the content-type "application/octet-stream" is also applied, but can
   * be overridden in the metadata object).
   */
  DATA_URL: "data_url"
};
var StringData = class {
  constructor(data, contentType) {
    this.data = data;
    this.contentType = contentType || null;
  }
};
function dataFromString(format, stringData) {
  switch (format) {
    case StringFormat.RAW:
      return new StringData(utf8Bytes_(stringData));
    case StringFormat.BASE64:
    case StringFormat.BASE64URL:
      return new StringData(base64Bytes_(format, stringData));
    case StringFormat.DATA_URL:
      return new StringData(dataURLBytes_(stringData), dataURLContentType_(stringData));
  }
  throw unknown();
}
function utf8Bytes_(value) {
  const b = [];
  for (let i = 0; i < value.length; i++) {
    let c = value.charCodeAt(i);
    if (c <= 127) {
      b.push(c);
    } else {
      if (c <= 2047) {
        b.push(192 | c >> 6, 128 | c & 63);
      } else {
        if ((c & 64512) === 55296) {
          const valid = i < value.length - 1 && (value.charCodeAt(i + 1) & 64512) === 56320;
          if (!valid) {
            b.push(239, 191, 189);
          } else {
            const hi = c;
            const lo = value.charCodeAt(++i);
            c = 65536 | (hi & 1023) << 10 | lo & 1023;
            b.push(240 | c >> 18, 128 | c >> 12 & 63, 128 | c >> 6 & 63, 128 | c & 63);
          }
        } else {
          if ((c & 64512) === 56320) {
            b.push(239, 191, 189);
          } else {
            b.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
          }
        }
      }
    }
  }
  return new Uint8Array(b);
}
function percentEncodedBytes_(value) {
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch (e) {
    throw invalidFormat(StringFormat.DATA_URL, "Malformed data URL.");
  }
  return utf8Bytes_(decoded);
}
function base64Bytes_(format, value) {
  switch (format) {
    case StringFormat.BASE64: {
      const hasMinus = value.indexOf("-") !== -1;
      const hasUnder = value.indexOf("_") !== -1;
      if (hasMinus || hasUnder) {
        const invalidChar = hasMinus ? "-" : "_";
        throw invalidFormat(format, "Invalid character '" + invalidChar + "' found: is it base64url encoded?");
      }
      break;
    }
    case StringFormat.BASE64URL: {
      const hasPlus = value.indexOf("+") !== -1;
      const hasSlash = value.indexOf("/") !== -1;
      if (hasPlus || hasSlash) {
        const invalidChar = hasPlus ? "+" : "/";
        throw invalidFormat(format, "Invalid character '" + invalidChar + "' found: is it base64 encoded?");
      }
      value = value.replace(/-/g, "+").replace(/_/g, "/");
      break;
    }
  }
  let bytes;
  try {
    bytes = decodeBase64(value);
  } catch (e) {
    if (e.message.includes("polyfill")) {
      throw e;
    }
    throw invalidFormat(format, "Invalid character found");
  }
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }
  return array;
}
var DataURLParts = class {
  constructor(dataURL) {
    this.base64 = false;
    this.contentType = null;
    const matches = dataURL.match(/^data:([^,]+)?,/);
    if (matches === null) {
      throw invalidFormat(StringFormat.DATA_URL, "Must be formatted 'data:[<mediatype>][;base64],<data>");
    }
    const middle = matches[1] || null;
    if (middle != null) {
      this.base64 = endsWith(middle, ";base64");
      this.contentType = this.base64 ? middle.substring(0, middle.length - ";base64".length) : middle;
    }
    this.rest = dataURL.substring(dataURL.indexOf(",") + 1);
  }
};
function dataURLBytes_(dataUrl) {
  const parts = new DataURLParts(dataUrl);
  if (parts.base64) {
    return base64Bytes_(StringFormat.BASE64, parts.rest);
  } else {
    return percentEncodedBytes_(parts.rest);
  }
}
function dataURLContentType_(dataUrl) {
  const parts = new DataURLParts(dataUrl);
  return parts.contentType;
}
function endsWith(s, end) {
  const longEnough = s.length >= end.length;
  if (!longEnough) {
    return false;
  }
  return s.substring(s.length - end.length) === end;
}
var FbsBlob = class _FbsBlob {
  constructor(data, elideCopy) {
    let size = 0;
    let blobType = "";
    if (isNativeBlob(data)) {
      this.data_ = data;
      size = data.size;
      blobType = data.type;
    } else if (data instanceof ArrayBuffer) {
      if (elideCopy) {
        this.data_ = new Uint8Array(data);
      } else {
        this.data_ = new Uint8Array(data.byteLength);
        this.data_.set(new Uint8Array(data));
      }
      size = this.data_.length;
    } else if (data instanceof Uint8Array) {
      if (elideCopy) {
        this.data_ = data;
      } else {
        this.data_ = new Uint8Array(data.length);
        this.data_.set(data);
      }
      size = data.length;
    }
    this.size_ = size;
    this.type_ = blobType;
  }
  size() {
    return this.size_;
  }
  type() {
    return this.type_;
  }
  slice(startByte, endByte) {
    if (isNativeBlob(this.data_)) {
      const realBlob = this.data_;
      const sliced = sliceBlob(realBlob, startByte, endByte);
      if (sliced === null) {
        return null;
      }
      return new _FbsBlob(sliced);
    } else {
      const slice = new Uint8Array(this.data_.buffer, startByte, endByte - startByte);
      return new _FbsBlob(slice, true);
    }
  }
  static getBlob(...args) {
    if (isNativeBlobDefined()) {
      const blobby = args.map((val) => {
        if (val instanceof _FbsBlob) {
          return val.data_;
        } else {
          return val;
        }
      });
      return new _FbsBlob(getBlob$1.apply(null, blobby));
    } else {
      const uint8Arrays = args.map((val) => {
        if (isString(val)) {
          return dataFromString(StringFormat.RAW, val).data;
        } else {
          return val.data_;
        }
      });
      let finalLength = 0;
      uint8Arrays.forEach((array) => {
        finalLength += array.byteLength;
      });
      const merged = new Uint8Array(finalLength);
      let index = 0;
      uint8Arrays.forEach((array) => {
        for (let i = 0; i < array.length; i++) {
          merged[index++] = array[i];
        }
      });
      return new _FbsBlob(merged, true);
    }
  }
  uploadData() {
    return this.data_;
  }
};
function jsonObjectOrNull(s) {
  let obj;
  try {
    obj = JSON.parse(s);
  } catch (e) {
    return null;
  }
  if (isNonArrayObject(obj)) {
    return obj;
  } else {
    return null;
  }
}
function parent(path) {
  if (path.length === 0) {
    return null;
  }
  const index = path.lastIndexOf("/");
  if (index === -1) {
    return "";
  }
  const newPath = path.slice(0, index);
  return newPath;
}
function child(path, childPath) {
  const canonicalChildPath = childPath.split("/").filter((component) => component.length > 0).join("/");
  if (path.length === 0) {
    return canonicalChildPath;
  } else {
    return path + "/" + canonicalChildPath;
  }
}
function lastComponent(path) {
  const index = path.lastIndexOf("/", path.length - 2);
  if (index === -1) {
    return path;
  } else {
    return path.slice(index + 1);
  }
}
function noXform_(metadata, value) {
  return value;
}
var Mapping = class {
  constructor(server, local, writable, xform) {
    this.server = server;
    this.local = local || server;
    this.writable = !!writable;
    this.xform = xform || noXform_;
  }
};
var mappings_ = null;
function xformPath(fullPath) {
  if (!isString(fullPath) || fullPath.length < 2) {
    return fullPath;
  } else {
    return lastComponent(fullPath);
  }
}
function getMappings() {
  if (mappings_) {
    return mappings_;
  }
  const mappings = [];
  mappings.push(new Mapping("bucket"));
  mappings.push(new Mapping("generation"));
  mappings.push(new Mapping("metageneration"));
  mappings.push(new Mapping("name", "fullPath", true));
  function mappingsXformPath(_metadata, fullPath) {
    return xformPath(fullPath);
  }
  const nameMapping = new Mapping("name");
  nameMapping.xform = mappingsXformPath;
  mappings.push(nameMapping);
  function xformSize(_metadata, size) {
    if (size !== void 0) {
      return Number(size);
    } else {
      return size;
    }
  }
  const sizeMapping = new Mapping("size");
  sizeMapping.xform = xformSize;
  mappings.push(sizeMapping);
  mappings.push(new Mapping("timeCreated"));
  mappings.push(new Mapping("updated"));
  mappings.push(new Mapping("md5Hash", null, true));
  mappings.push(new Mapping("cacheControl", null, true));
  mappings.push(new Mapping("contentDisposition", null, true));
  mappings.push(new Mapping("contentEncoding", null, true));
  mappings.push(new Mapping("contentLanguage", null, true));
  mappings.push(new Mapping("contentType", null, true));
  mappings.push(new Mapping("metadata", "customMetadata", true));
  mappings_ = mappings;
  return mappings_;
}
function addRef(metadata, service) {
  function generateRef() {
    const bucket = metadata["bucket"];
    const path = metadata["fullPath"];
    const loc = new Location(bucket, path);
    return service._makeStorageReference(loc);
  }
  Object.defineProperty(metadata, "ref", { get: generateRef });
}
function fromResource(service, resource, mappings) {
  const metadata = {};
  metadata["type"] = "file";
  const len = mappings.length;
  for (let i = 0; i < len; i++) {
    const mapping = mappings[i];
    metadata[mapping.local] = mapping.xform(metadata, resource[mapping.server]);
  }
  addRef(metadata, service);
  return metadata;
}
function fromResourceString(service, resourceString, mappings) {
  const obj = jsonObjectOrNull(resourceString);
  if (obj === null) {
    return null;
  }
  const resource = obj;
  return fromResource(service, resource, mappings);
}
function downloadUrlFromResourceString(metadata, resourceString, host, protocol) {
  const obj = jsonObjectOrNull(resourceString);
  if (obj === null) {
    return null;
  }
  if (!isString(obj["downloadTokens"])) {
    return null;
  }
  const tokens = obj["downloadTokens"];
  if (tokens.length === 0) {
    return null;
  }
  const encode = encodeURIComponent;
  const tokensList = tokens.split(",");
  const urls = tokensList.map((token) => {
    const bucket = metadata["bucket"];
    const path = metadata["fullPath"];
    const urlPart = "/b/" + encode(bucket) + "/o/" + encode(path);
    const base = makeUrl(urlPart, host, protocol);
    const queryString = makeQueryString({
      alt: "media",
      token
    });
    return base + queryString;
  });
  return urls[0];
}
function toResourceString(metadata, mappings) {
  const resource = {};
  const len = mappings.length;
  for (let i = 0; i < len; i++) {
    const mapping = mappings[i];
    if (mapping.writable) {
      resource[mapping.server] = metadata[mapping.local];
    }
  }
  return JSON.stringify(resource);
}
var RequestInfo = class {
  constructor(url, method, handler, timeout) {
    this.url = url;
    this.method = method;
    this.handler = handler;
    this.timeout = timeout;
    this.urlParams = {};
    this.headers = {};
    this.body = null;
    this.errorHandler = null;
    this.progressCallback = null;
    this.successCodes = [200];
    this.additionalRetryCodes = [];
  }
};
function handlerCheck(cndn) {
  if (!cndn) {
    throw unknown();
  }
}
function metadataHandler(service, mappings) {
  function handler(xhr, text) {
    const metadata = fromResourceString(service, text, mappings);
    handlerCheck(metadata !== null);
    return metadata;
  }
  return handler;
}
function downloadUrlHandler(service, mappings) {
  function handler(xhr, text) {
    const metadata = fromResourceString(service, text, mappings);
    handlerCheck(metadata !== null);
    return downloadUrlFromResourceString(metadata, text, service.host, service._protocol);
  }
  return handler;
}
function sharedErrorHandler(location) {
  function errorHandler(xhr, err) {
    let newErr;
    if (xhr.getStatus() === 401) {
      if (
        // This exact message string is the only consistent part of the
        // server's error response that identifies it as an App Check error.
        xhr.getErrorText().includes("Firebase App Check token is invalid")
      ) {
        newErr = unauthorizedApp();
      } else {
        newErr = unauthenticated();
      }
    } else {
      if (xhr.getStatus() === 402) {
        newErr = quotaExceeded(location.bucket);
      } else {
        if (xhr.getStatus() === 403) {
          newErr = unauthorized(location.path);
        } else {
          newErr = err;
        }
      }
    }
    newErr.status = xhr.getStatus();
    newErr.serverResponse = err.serverResponse;
    return newErr;
  }
  return errorHandler;
}
function objectErrorHandler(location) {
  const shared = sharedErrorHandler(location);
  function errorHandler(xhr, err) {
    let newErr = shared(xhr, err);
    if (xhr.getStatus() === 404) {
      newErr = objectNotFound(location.path);
    }
    newErr.serverResponse = err.serverResponse;
    return newErr;
  }
  return errorHandler;
}
function getDownloadUrl(service, location, mappings) {
  const urlPart = location.fullServerUrl();
  const url = makeUrl(urlPart, service.host, service._protocol);
  const method = "GET";
  const timeout = service.maxOperationRetryTime;
  const requestInfo = new RequestInfo(url, method, downloadUrlHandler(service, mappings), timeout);
  requestInfo.errorHandler = objectErrorHandler(location);
  return requestInfo;
}
function determineContentType_(metadata, blob) {
  return metadata && metadata["contentType"] || blob && blob.type() || "application/octet-stream";
}
function metadataForUpload_(location, blob, metadata) {
  const metadataClone = Object.assign({}, metadata);
  metadataClone["fullPath"] = location.path;
  metadataClone["size"] = blob.size();
  if (!metadataClone["contentType"]) {
    metadataClone["contentType"] = determineContentType_(null, blob);
  }
  return metadataClone;
}
function multipartUpload(service, location, mappings, blob, metadata) {
  const urlPart = location.bucketOnlyServerUrl();
  const headers = {
    "X-Goog-Upload-Protocol": "multipart"
  };
  function genBoundary() {
    let str = "";
    for (let i = 0; i < 2; i++) {
      str = str + Math.random().toString().slice(2);
    }
    return str;
  }
  const boundary = genBoundary();
  headers["Content-Type"] = "multipart/related; boundary=" + boundary;
  const metadata_ = metadataForUpload_(location, blob, metadata);
  const metadataString = toResourceString(metadata_, mappings);
  const preBlobPart = "--" + boundary + "\r\nContent-Type: application/json; charset=utf-8\r\n\r\n" + metadataString + "\r\n--" + boundary + "\r\nContent-Type: " + metadata_["contentType"] + "\r\n\r\n";
  const postBlobPart = "\r\n--" + boundary + "--";
  const body = FbsBlob.getBlob(preBlobPart, blob, postBlobPart);
  if (body === null) {
    throw cannotSliceBlob();
  }
  const urlParams = { name: metadata_["fullPath"] };
  const url = makeUrl(urlPart, service.host, service._protocol);
  const method = "POST";
  const timeout = service.maxUploadRetryTime;
  const requestInfo = new RequestInfo(url, method, metadataHandler(service, mappings), timeout);
  requestInfo.urlParams = urlParams;
  requestInfo.headers = headers;
  requestInfo.body = body.uploadData();
  requestInfo.errorHandler = sharedErrorHandler(location);
  return requestInfo;
}
var RESUMABLE_UPLOAD_CHUNK_SIZE = 256 * 1024;
var textFactoryOverride = null;
var FetchConnection = class {
  constructor() {
    this.errorText_ = "";
    this.sent_ = false;
    this.errorCode_ = ErrorCode.NO_ERROR;
  }
  async send(url, method, isUsingEmulator, body, headers) {
    if (this.sent_) {
      throw internalError("cannot .send() more than once");
    }
    this.sent_ = true;
    try {
      const response = await newFetch(url, method, isUsingEmulator, headers, body);
      this.headers_ = response.headers;
      this.statusCode_ = response.status;
      this.errorCode_ = ErrorCode.NO_ERROR;
      this.body_ = await response.arrayBuffer();
    } catch (e) {
      this.errorText_ = e?.message;
      this.statusCode_ = 0;
      this.errorCode_ = ErrorCode.NETWORK_ERROR;
    }
  }
  getErrorCode() {
    if (this.errorCode_ === void 0) {
      throw internalError("cannot .getErrorCode() before receiving response");
    }
    return this.errorCode_;
  }
  getStatus() {
    if (this.statusCode_ === void 0) {
      throw internalError("cannot .getStatus() before receiving response");
    }
    return this.statusCode_;
  }
  getErrorText() {
    return this.errorText_;
  }
  abort() {
  }
  getResponseHeader(header) {
    if (!this.headers_) {
      throw internalError("cannot .getResponseHeader() before receiving response");
    }
    return this.headers_.get(header);
  }
  addUploadProgressListener(listener) {
  }
  removeUploadProgressListener(listener) {
  }
};
var FetchTextConnection = class extends FetchConnection {
  getResponse() {
    if (!this.body_) {
      throw internalError("cannot .getResponse() before receiving response");
    }
    return Buffer.from(this.body_).toString("utf-8");
  }
};
function newTextConnection() {
  return textFactoryOverride ? textFactoryOverride() : new FetchTextConnection();
}
function newFetch(url, method, isUsingEmulator, headers, body) {
  const fetchArgs = {
    method,
    headers: headers || {},
    body
  };
  if (isCloudWorkstation(url) && isUsingEmulator) {
    fetchArgs.credentials = "include";
  }
  return fetch(url, fetchArgs);
}
var Reference = class _Reference {
  constructor(_service, location) {
    this._service = _service;
    if (location instanceof Location) {
      this._location = location;
    } else {
      this._location = Location.makeFromUrl(location, _service.host);
    }
  }
  /**
   * Returns the URL for the bucket and path this object references,
   *     in the form gs://<bucket>/<object-path>
   * @override
   */
  toString() {
    return "gs://" + this._location.bucket + "/" + this._location.path;
  }
  _newRef(service, location) {
    return new _Reference(service, location);
  }
  /**
   * A reference to the root of this object's bucket.
   */
  get root() {
    const location = new Location(this._location.bucket, "");
    return this._newRef(this._service, location);
  }
  /**
   * The name of the bucket containing this reference's object.
   */
  get bucket() {
    return this._location.bucket;
  }
  /**
   * The full path of this object.
   */
  get fullPath() {
    return this._location.path;
  }
  /**
   * The short name of this object, which is the last component of the full path.
   * For example, if fullPath is 'full/path/image.png', name is 'image.png'.
   */
  get name() {
    return lastComponent(this._location.path);
  }
  /**
   * The `StorageService` instance this `StorageReference` is associated with.
   */
  get storage() {
    return this._service;
  }
  /**
   * A `StorageReference` pointing to the parent location of this `StorageReference`, or null if
   * this reference is the root.
   */
  get parent() {
    const newPath = parent(this._location.path);
    if (newPath === null) {
      return null;
    }
    const location = new Location(this._location.bucket, newPath);
    return new _Reference(this._service, location);
  }
  /**
   * Utility function to throw an error in methods that do not accept a root reference.
   */
  _throwIfRoot(name3) {
    if (this._location.path === "") {
      throw invalidRootOperation(name3);
    }
  }
};
function uploadBytes$1(ref2, data, metadata) {
  ref2._throwIfRoot("uploadBytes");
  const requestInfo = multipartUpload(ref2.storage, ref2._location, getMappings(), new FbsBlob(data, true), metadata);
  return ref2.storage.makeRequestWithTokens(requestInfo, newTextConnection).then((finalMetadata) => {
    return {
      metadata: finalMetadata,
      ref: ref2
    };
  });
}
function getDownloadURL$1(ref2) {
  ref2._throwIfRoot("getDownloadURL");
  const requestInfo = getDownloadUrl(ref2.storage, ref2._location, getMappings());
  return ref2.storage.makeRequestWithTokens(requestInfo, newTextConnection).then((url) => {
    if (url === null) {
      throw noDownloadURL();
    }
    return url;
  });
}
function _getChild$1(ref2, childPath) {
  const newPath = child(ref2._location.path, childPath);
  const location = new Location(ref2._location.bucket, newPath);
  return new Reference(ref2.storage, location);
}
function isUrl(path) {
  return /^[A-Za-z]+:\/\//.test(path);
}
function refFromURL(service, url) {
  return new Reference(service, url);
}
function refFromPath(ref2, path) {
  if (ref2 instanceof FirebaseStorageImpl) {
    const service = ref2;
    if (service._bucket == null) {
      throw noDefaultBucket();
    }
    const reference = new Reference(service, service._bucket);
    if (path != null) {
      return refFromPath(reference, path);
    } else {
      return reference;
    }
  } else {
    if (path !== void 0) {
      return _getChild$1(ref2, path);
    } else {
      return ref2;
    }
  }
}
function ref$1(serviceOrRef, pathOrUrl) {
  if (pathOrUrl && isUrl(pathOrUrl)) {
    if (serviceOrRef instanceof FirebaseStorageImpl) {
      return refFromURL(serviceOrRef, pathOrUrl);
    } else {
      throw invalidArgument("To use ref(service, url), the first argument must be a Storage instance.");
    }
  } else {
    return refFromPath(serviceOrRef, pathOrUrl);
  }
}
function extractBucket(host, config) {
  const bucketString = config?.[CONFIG_STORAGE_BUCKET_KEY];
  if (bucketString == null) {
    return null;
  }
  return Location.makeFromBucketSpec(bucketString, host);
}
var FirebaseStorageImpl = class {
  constructor(app, _authProvider, _appCheckProvider, _url, _firebaseVersion, _isUsingEmulator = false) {
    this.app = app;
    this._authProvider = _authProvider;
    this._appCheckProvider = _appCheckProvider;
    this._url = _url;
    this._firebaseVersion = _firebaseVersion;
    this._isUsingEmulator = _isUsingEmulator;
    this._bucket = null;
    this._host = DEFAULT_HOST;
    this._protocol = "https";
    this._appId = null;
    this._deleted = false;
    this._maxOperationRetryTime = DEFAULT_MAX_OPERATION_RETRY_TIME;
    this._maxUploadRetryTime = DEFAULT_MAX_UPLOAD_RETRY_TIME;
    this._requests = /* @__PURE__ */ new Set();
    if (_url != null) {
      this._bucket = Location.makeFromBucketSpec(_url, this._host);
    } else {
      this._bucket = extractBucket(this._host, this.app.options);
    }
  }
  /**
   * The host string for this service, in the form of `host` or
   * `host:port`.
   */
  get host() {
    return this._host;
  }
  set host(host) {
    this._host = host;
    if (this._url != null) {
      this._bucket = Location.makeFromBucketSpec(this._url, host);
    } else {
      this._bucket = extractBucket(host, this.app.options);
    }
  }
  /**
   * The maximum time to retry uploads in milliseconds.
   */
  get maxUploadRetryTime() {
    return this._maxUploadRetryTime;
  }
  set maxUploadRetryTime(time) {
    validateNumber(
      "time",
      /* minValue=*/
      0,
      /* maxValue= */
      Number.POSITIVE_INFINITY,
      time
    );
    this._maxUploadRetryTime = time;
  }
  /**
   * The maximum time to retry operations other than uploads or downloads in
   * milliseconds.
   */
  get maxOperationRetryTime() {
    return this._maxOperationRetryTime;
  }
  set maxOperationRetryTime(time) {
    validateNumber(
      "time",
      /* minValue=*/
      0,
      /* maxValue= */
      Number.POSITIVE_INFINITY,
      time
    );
    this._maxOperationRetryTime = time;
  }
  async _getAuthToken() {
    if (this._overrideAuthToken) {
      return this._overrideAuthToken;
    }
    const auth = this._authProvider.getImmediate({ optional: true });
    if (auth) {
      const tokenData = await auth.getToken();
      if (tokenData !== null) {
        return tokenData.accessToken;
      }
    }
    return null;
  }
  async _getAppCheckToken() {
    if (_isFirebaseServerApp(this.app) && this.app.settings.appCheckToken) {
      return this.app.settings.appCheckToken;
    }
    const appCheck = this._appCheckProvider.getImmediate({ optional: true });
    if (appCheck) {
      const result = await appCheck.getToken();
      return result.token;
    }
    return null;
  }
  /**
   * Stop running requests and prevent more from being created.
   */
  _delete() {
    if (!this._deleted) {
      this._deleted = true;
      this._requests.forEach((request) => request.cancel());
      this._requests.clear();
    }
    return Promise.resolve();
  }
  /**
   * Returns a new firebaseStorage.Reference object referencing this StorageService
   * at the given Location.
   */
  _makeStorageReference(loc) {
    return new Reference(this, loc);
  }
  /**
   * @param requestInfo - HTTP RequestInfo object
   * @param authToken - Firebase auth token
   */
  _makeRequest(requestInfo, requestFactory, authToken, appCheckToken, retry = true) {
    if (!this._deleted) {
      const request = makeRequest(requestInfo, this._appId, authToken, appCheckToken, requestFactory, this._firebaseVersion, retry, this._isUsingEmulator);
      this._requests.add(request);
      request.getPromise().then(() => this._requests.delete(request), () => this._requests.delete(request));
      return request;
    } else {
      return new FailRequest(appDeleted());
    }
  }
  async makeRequestWithTokens(requestInfo, requestFactory) {
    const [authToken, appCheckToken] = await Promise.all([
      this._getAuthToken(),
      this._getAppCheckToken()
    ]);
    return this._makeRequest(requestInfo, requestFactory, authToken, appCheckToken).getPromise();
  }
};
var name2 = "@firebase/storage";
var version2 = "0.14.0";
var STORAGE_TYPE = "storage";
function uploadBytes(ref2, data, metadata) {
  ref2 = getModularInstance(ref2);
  return uploadBytes$1(ref2, data, metadata);
}
function getDownloadURL(ref2) {
  ref2 = getModularInstance(ref2);
  return getDownloadURL$1(ref2);
}
function ref(serviceOrRef, pathOrUrl) {
  serviceOrRef = getModularInstance(serviceOrRef);
  return ref$1(serviceOrRef, pathOrUrl);
}
function factory(container, { instanceIdentifier: url }) {
  const app = container.getProvider("app").getImmediate();
  const authProvider = container.getProvider("auth-internal");
  const appCheckProvider = container.getProvider("app-check-internal");
  return new FirebaseStorageImpl(app, authProvider, appCheckProvider, url, SDK_VERSION);
}
function registerStorage() {
  _registerComponent(new Component(
    STORAGE_TYPE,
    factory,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setMultipleInstances(true));
  registerVersion(name2, version2);
}
registerStorage();

// src/storage/cloud-store-service.ts
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
      const { db, storage } = await import("./src-HT6AQL3T.mjs");
      if (storage) {
        this.storage = storage;
      }
    } catch (error) {
      console.warn("Firebase storage not available:", error);
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
    const name3 = options.metadata?.name || file.name || `${id}.md`;
    let path = `content-hub/notes/${id}.md`;
    let downloadUrl;
    try {
      if (!this.storage) {
        throw new Error("Firebase storage service is unavailable");
      }
      const storageRef = ref(this.storage, path);
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: "text/markdown",
        customMetadata: {
          ...options.metadata,
          originalName: file.name,
          importedAt: uploadedAt
        }
      });
      path = uploadResult.ref.fullPath;
      downloadUrl = await getDownloadURL(uploadResult.ref);
    } catch (error) {
      console.warn("Markdown upload to cloud storage failed; using local fallback.", error);
      path = `local://${id}`;
    }
    const record = {
      id,
      name: name3,
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

// src/context/context-storage.ts
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
    const start2 = this.context.sessionStartTime;
    if (!start2) return "Unknown";
    const duration = Date.now() - new Date(start2).getTime();
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

// src/platform/platform-settings-service.ts
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
  validateArgs,
  validateEmail,
  validatePassword
};
/*! Bundled license information:

@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/logger/dist/esm/index.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/component/dist/esm/index.esm.js:
@firebase/component/dist/esm/index.esm.js:
@firebase/component/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/storage/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/storage/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
