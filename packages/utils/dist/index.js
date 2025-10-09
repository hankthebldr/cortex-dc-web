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
