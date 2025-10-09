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
  CHAT_COLLECTION: () => CHAT_COLLECTION,
  ChatValidationRules: () => ChatValidationRules,
  FirestoreClient: () => FirestoreClient,
  FirestoreQueries: () => FirestoreQueries,
  NoteSchema: () => NoteSchema,
  POVSchema: () => POVSchema,
  POVStatus: () => POVStatus,
  Priority: () => Priority,
  ProjectSchema: () => ProjectSchema,
  ProjectStatus: () => ProjectStatus,
  ROLE_NAVIGATION: () => ROLE_NAVIGATION,
  ROLE_PERMISSIONS: () => ROLE_PERMISSIONS,
  TRRSchema: () => TRRSchema,
  TRRStatus: () => TRRStatus,
  TaskSchema: () => TaskSchema,
  TaskStatus: () => TaskStatus,
  TeamSchema: () => TeamSchema,
  TimelineEventSchema: () => TimelineEventSchema,
  USER_COLLECTION: () => USER_COLLECTION,
  UserProfileSchema: () => UserProfileSchema,
  UserRole: () => UserRole,
  UserSchema: () => UserSchema,
  UserStatus: () => UserStatus,
  UserValidationRules: () => UserValidationRules,
  calculatePOVProgress: () => calculatePOVProgress,
  calculateProjectHealth: () => calculateProjectHealth,
  canAccessRoute: () => canAccessRoute,
  getDefaultPermissions: () => getDefaultPermissions,
  getProjectTimeline: () => getProjectTimeline,
  hasPermission: () => hasPermission
});
module.exports = __toCommonJS(index_exports);

// src/firestore/client.ts
var import_firestore = require("firebase/firestore");
var FirestoreClient = class {
  constructor(config) {
    this.config = config;
    this.db = (0, import_firestore.getFirestore)(config.app);
    if (config.useEmulator && config.emulatorHost && config.emulatorPort) {
      (0, import_firestore.connectFirestoreEmulator)(this.db, config.emulatorHost, config.emulatorPort);
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
var import_zod = require("zod");
var USER_COLLECTION = "users";
var UserValidationRules = {
  required: ["email", "role"],
  maxNameLength: 100,
  maxBioLength: 500,
  validRoles: ["admin", "user", "viewer"]
};
var UserSchema = import_zod.z.object({
  id: import_zod.z.string(),
  email: import_zod.z.string().email(),
  name: import_zod.z.string(),
  role: import_zod.z.enum(["admin", "user"]),
  createdAt: import_zod.z.date(),
  updatedAt: import_zod.z.date()
});

// src/schemas/chat.ts
var CHAT_COLLECTION = "chats";
var ChatValidationRules = {
  required: ["userId", "sessionId", "messages"],
  maxMessages: 1e3,
  maxTitleLength: 100
};

// src/types/auth.ts
var import_zod2 = require("zod");
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
var UserProfileSchema = import_zod2.z.object({
  uid: import_zod2.z.string(),
  email: import_zod2.z.string().email(),
  displayName: import_zod2.z.string(),
  role: import_zod2.z.nativeEnum(UserRole),
  status: import_zod2.z.nativeEnum(UserStatus),
  department: import_zod2.z.string().optional(),
  title: import_zod2.z.string().optional(),
  manager: import_zod2.z.string().optional(),
  // uid of manager
  teams: import_zod2.z.array(import_zod2.z.string()).default([]),
  // team IDs
  preferences: import_zod2.z.object({
    theme: import_zod2.z.enum(["light", "dark", "system"]).default("system"),
    notifications: import_zod2.z.object({
      email: import_zod2.z.boolean().default(true),
      inApp: import_zod2.z.boolean().default(true),
      desktop: import_zod2.z.boolean().default(false)
    }).default({}),
    dashboard: import_zod2.z.object({
      layout: import_zod2.z.enum(["grid", "list"]).default("grid"),
      defaultView: import_zod2.z.string().optional()
    }).default({})
  }).default({}),
  permissions: import_zod2.z.object({
    povManagement: import_zod2.z.object({
      create: import_zod2.z.boolean().default(true),
      edit: import_zod2.z.boolean().default(true),
      delete: import_zod2.z.boolean().default(false),
      viewAll: import_zod2.z.boolean().default(false)
    }).default({}),
    trrManagement: import_zod2.z.object({
      create: import_zod2.z.boolean().default(true),
      edit: import_zod2.z.boolean().default(true),
      delete: import_zod2.z.boolean().default(false),
      approve: import_zod2.z.boolean().default(false),
      viewAll: import_zod2.z.boolean().default(false)
    }).default({}),
    contentHub: import_zod2.z.object({
      create: import_zod2.z.boolean().default(true),
      edit: import_zod2.z.boolean().default(true),
      publish: import_zod2.z.boolean().default(false),
      moderate: import_zod2.z.boolean().default(false)
    }).default({}),
    scenarioEngine: import_zod2.z.object({
      execute: import_zod2.z.boolean().default(true),
      create: import_zod2.z.boolean().default(false),
      modify: import_zod2.z.boolean().default(false)
    }).default({}),
    terminal: import_zod2.z.object({
      basic: import_zod2.z.boolean().default(true),
      advanced: import_zod2.z.boolean().default(false),
      admin: import_zod2.z.boolean().default(false)
    }).default({}),
    analytics: import_zod2.z.object({
      view: import_zod2.z.boolean().default(true),
      export: import_zod2.z.boolean().default(false),
      detailed: import_zod2.z.boolean().default(false)
    }).default({}),
    userManagement: import_zod2.z.object({
      view: import_zod2.z.boolean().default(false),
      edit: import_zod2.z.boolean().default(false),
      create: import_zod2.z.boolean().default(false),
      delete: import_zod2.z.boolean().default(false)
    }).default({})
  }),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date(),
  lastLoginAt: import_zod2.z.date().optional()
});
var TeamSchema = import_zod2.z.object({
  id: import_zod2.z.string(),
  name: import_zod2.z.string(),
  description: import_zod2.z.string().optional(),
  manager: import_zod2.z.string(),
  // uid of team manager
  members: import_zod2.z.array(import_zod2.z.string()),
  // array of user uids
  region: import_zod2.z.string().optional(),
  department: import_zod2.z.string().optional(),
  isActive: import_zod2.z.boolean().default(true),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date()
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
var ROLE_NAVIGATION = {
  ["user" /* USER */]: [
    "/dashboard",
    "/pov",
    "/trr",
    "/content",
    "/scenarios",
    "/docs",
    "/terminal",
    "/preferences",
    "/escalation"
  ],
  ["manager" /* MANAGER */]: [
    "/dashboard",
    "/team",
    "/pov",
    "/trr",
    "/activity",
    "/content",
    "/scenarios",
    "/docs",
    "/terminal",
    "/settings",
    "/preferences",
    "/escalation"
  ],
  ["admin" /* ADMIN */]: [
    "/dashboard",
    "/admin",
    "/users",
    "/teams",
    "/pov",
    "/trr",
    "/activity",
    "/content",
    "/scenarios",
    "/docs",
    "/terminal",
    "/analytics",
    "/settings",
    "/preferences",
    "/escalation"
  ]
};
var hasPermission = (userProfile, resource, action) => {
  const resourcePermissions = userProfile.permissions[resource];
  return resourcePermissions?.[action] ?? false;
};
var canAccessRoute = (userProfile, route) => {
  return ROLE_NAVIGATION[userProfile.role].includes(route);
};
var getDefaultPermissions = (role) => {
  return ROLE_PERMISSIONS[role];
};

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
var calculatePOVProgress = (pov) => {
  if (pov.phases.length === 0) return 0;
  const completedPhases = pov.phases.filter((phase) => phase.status === "done" /* DONE */).length;
  return Math.round(completedPhases / pov.phases.length * 100);
};
var calculateProjectHealth = (project, povs, trrs) => {
  let score = 100;
  const factors = [];
  if (project.endDate && project.endDate < /* @__PURE__ */ new Date() && project.status !== "completed" /* COMPLETED */) {
    score -= 30;
    factors.push("Project overdue");
  }
  const atRiskPOVs = povs.filter((pov) => pov.status === "at_risk" /* AT_RISK */);
  if (atRiskPOVs.length > 0) {
    score -= 20 * atRiskPOVs.length;
    factors.push(`${atRiskPOVs.length} POV(s) at risk`);
  }
  const highSeverityFindings = trrs.flatMap(
    (trr) => trr.findings.filter((finding) => finding.severity === "high" || finding.severity === "critical")
  );
  if (highSeverityFindings.length > 0) {
    score -= 15 * highSeverityFindings.length;
    factors.push(`${highSeverityFindings.length} high severity finding(s)`);
  }
  score = Math.max(0, Math.min(100, score));
  let health;
  if (score >= 80) health = "good";
  else if (score >= 60) health = "warning";
  else health = "at_risk";
  return { health, score, factors };
};
var getProjectTimeline = (project, povs, trrs, tasks) => {
  const events = [];
  events.push({
    id: `${project.id}-created`,
    type: "project_created",
    title: "Project Created",
    projectId: project.id,
    actor: project.createdBy,
    timestamp: project.createdAt,
    createdAt: project.createdAt
  });
  povs.forEach((pov) => {
    events.push({
      id: `${pov.id}-created`,
      type: "pov_created",
      title: `POV Created: ${pov.title}`,
      projectId: project.id,
      povId: pov.id,
      actor: pov.createdBy,
      timestamp: pov.createdAt,
      createdAt: pov.createdAt
    });
    pov.phases.filter((phase) => phase.status === "done" /* DONE */).forEach((phase) => {
      if (phase.endDate) {
        events.push({
          id: `${pov.id}-phase-${phase.id}`,
          type: "pov_phase_completed",
          title: `POV Phase Completed: ${phase.name}`,
          projectId: project.id,
          povId: pov.id,
          actor: pov.lastModifiedBy,
          timestamp: phase.endDate,
          createdAt: phase.endDate
        });
      }
    });
  });
  trrs.forEach((trr) => {
    events.push({
      id: `${trr.id}-created`,
      type: "trr_created",
      title: `TRR Created: ${trr.title}`,
      projectId: project.id,
      trrId: trr.id,
      actor: trr.createdBy,
      timestamp: trr.createdAt,
      createdAt: trr.createdAt
    });
    if (trr.signoff?.approvedAt) {
      events.push({
        id: `${trr.id}-approved`,
        type: "trr_approved",
        title: `TRR Approved: ${trr.title}`,
        projectId: project.id,
        trrId: trr.id,
        actor: trr.signoff.approver,
        timestamp: trr.signoff.approvedAt,
        createdAt: trr.signoff.approvedAt
      });
    }
  });
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CHAT_COLLECTION,
  ChatValidationRules,
  FirestoreClient,
  FirestoreQueries,
  NoteSchema,
  POVSchema,
  POVStatus,
  Priority,
  ProjectSchema,
  ProjectStatus,
  ROLE_NAVIGATION,
  ROLE_PERMISSIONS,
  TRRSchema,
  TRRStatus,
  TaskSchema,
  TaskStatus,
  TeamSchema,
  TimelineEventSchema,
  USER_COLLECTION,
  UserProfileSchema,
  UserRole,
  UserSchema,
  UserStatus,
  UserValidationRules,
  calculatePOVProgress,
  calculateProjectHealth,
  canAccessRoute,
  getDefaultPermissions,
  getProjectTimeline,
  hasPermission
});
