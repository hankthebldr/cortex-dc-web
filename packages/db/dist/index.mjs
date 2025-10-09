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

// src/types/auth.ts
import { z as z2 } from "zod";
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
var UserProfileSchema = z2.object({
  uid: z2.string(),
  email: z2.string().email(),
  displayName: z2.string(),
  role: z2.nativeEnum(UserRole),
  status: z2.nativeEnum(UserStatus),
  department: z2.string().optional(),
  title: z2.string().optional(),
  manager: z2.string().optional(),
  // uid of manager
  teams: z2.array(z2.string()).default([]),
  // team IDs
  preferences: z2.object({
    theme: z2.enum(["light", "dark", "system"]).default("system"),
    notifications: z2.object({
      email: z2.boolean().default(true),
      inApp: z2.boolean().default(true),
      desktop: z2.boolean().default(false)
    }).default({}),
    dashboard: z2.object({
      layout: z2.enum(["grid", "list"]).default("grid"),
      defaultView: z2.string().optional()
    }).default({})
  }).default({}),
  permissions: z2.object({
    povManagement: z2.object({
      create: z2.boolean().default(true),
      edit: z2.boolean().default(true),
      delete: z2.boolean().default(false),
      viewAll: z2.boolean().default(false)
    }).default({}),
    trrManagement: z2.object({
      create: z2.boolean().default(true),
      edit: z2.boolean().default(true),
      delete: z2.boolean().default(false),
      approve: z2.boolean().default(false),
      viewAll: z2.boolean().default(false)
    }).default({}),
    contentHub: z2.object({
      create: z2.boolean().default(true),
      edit: z2.boolean().default(true),
      publish: z2.boolean().default(false),
      moderate: z2.boolean().default(false)
    }).default({}),
    scenarioEngine: z2.object({
      execute: z2.boolean().default(true),
      create: z2.boolean().default(false),
      modify: z2.boolean().default(false)
    }).default({}),
    terminal: z2.object({
      basic: z2.boolean().default(true),
      advanced: z2.boolean().default(false),
      admin: z2.boolean().default(false)
    }).default({}),
    analytics: z2.object({
      view: z2.boolean().default(true),
      export: z2.boolean().default(false),
      detailed: z2.boolean().default(false)
    }).default({}),
    userManagement: z2.object({
      view: z2.boolean().default(false),
      edit: z2.boolean().default(false),
      create: z2.boolean().default(false),
      delete: z2.boolean().default(false)
    }).default({})
  }),
  createdAt: z2.date(),
  updatedAt: z2.date(),
  lastLoginAt: z2.date().optional()
});
var TeamSchema = z2.object({
  id: z2.string(),
  name: z2.string(),
  description: z2.string().optional(),
  manager: z2.string(),
  // uid of team manager
  members: z2.array(z2.string()),
  // array of user uids
  region: z2.string().optional(),
  department: z2.string().optional(),
  isActive: z2.boolean().default(true),
  createdAt: z2.date(),
  updatedAt: z2.date()
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
import { z as z3 } from "zod";
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
var ProjectSchema = z3.object({
  id: z3.string(),
  title: z3.string(),
  description: z3.string().optional(),
  customer: z3.object({
    name: z3.string(),
    industry: z3.string().optional(),
    size: z3.enum(["startup", "small", "medium", "enterprise"]).optional(),
    region: z3.string().optional(),
    contact: z3.object({
      name: z3.string(),
      email: z3.string().email(),
      role: z3.string().optional(),
      phone: z3.string().optional()
    }).optional()
  }),
  status: z3.nativeEnum(ProjectStatus),
  priority: z3.nativeEnum(Priority),
  owner: z3.string(),
  // uid of project owner
  team: z3.array(z3.string()),
  // array of user uids
  startDate: z3.date(),
  endDate: z3.date().optional(),
  estimatedValue: z3.number().optional(),
  actualValue: z3.number().optional(),
  tags: z3.array(z3.string()).default([]),
  // Relations to other entities
  povIds: z3.array(z3.string()).default([]),
  trrIds: z3.array(z3.string()).default([]),
  scenarioIds: z3.array(z3.string()).default([]),
  // Metadata
  createdAt: z3.date(),
  updatedAt: z3.date(),
  createdBy: z3.string(),
  lastModifiedBy: z3.string()
});
var POVSchema = z3.object({
  id: z3.string(),
  projectId: z3.string(),
  // reference to parent project
  title: z3.string(),
  description: z3.string(),
  status: z3.nativeEnum(POVStatus),
  priority: z3.nativeEnum(Priority),
  // POV Specific Fields
  objectives: z3.array(z3.object({
    id: z3.string(),
    description: z3.string(),
    success_criteria: z3.string(),
    status: z3.enum(["pending", "in_progress", "completed", "failed"]),
    weight: z3.number().min(0).max(100).default(100)
    // percentage weight
  })).default([]),
  testPlan: z3.object({
    scenarios: z3.array(z3.string()),
    // scenario IDs
    environment: z3.string().optional(),
    timeline: z3.object({
      start: z3.date(),
      end: z3.date(),
      milestones: z3.array(z3.object({
        id: z3.string(),
        title: z3.string(),
        date: z3.date(),
        status: z3.enum(["upcoming", "in_progress", "completed", "overdue"])
      }))
    }),
    resources: z3.array(z3.object({
      type: z3.enum(["personnel", "equipment", "software", "budget"]),
      description: z3.string(),
      quantity: z3.number().optional(),
      cost: z3.number().optional()
    })).default([])
  }).optional(),
  // Success Metrics
  successMetrics: z3.object({
    businessValue: z3.object({
      roi: z3.number().optional(),
      costSavings: z3.number().optional(),
      riskReduction: z3.string().optional(),
      efficiency_gains: z3.string().optional()
    }).optional(),
    technicalMetrics: z3.object({
      performance: z3.record(z3.number()).optional(),
      reliability: z3.number().optional(),
      // percentage
      security_score: z3.number().optional()
    }).optional()
  }).default({}),
  // Timeline tracking
  phases: z3.array(z3.object({
    id: z3.string(),
    name: z3.string(),
    description: z3.string().optional(),
    startDate: z3.date(),
    endDate: z3.date().optional(),
    status: z3.nativeEnum(TaskStatus),
    tasks: z3.array(z3.string()).default([])
    // task IDs
  })).default([]),
  // Assignment
  owner: z3.string(),
  // uid of POV owner
  team: z3.array(z3.string()).default([]),
  // Metadata
  createdAt: z3.date(),
  updatedAt: z3.date(),
  createdBy: z3.string(),
  lastModifiedBy: z3.string()
});
var TRRSchema = z3.object({
  id: z3.string(),
  projectId: z3.string(),
  // reference to parent project
  povId: z3.string().optional(),
  // optional reference to related POV
  title: z3.string(),
  description: z3.string(),
  status: z3.nativeEnum(TRRStatus),
  priority: z3.nativeEnum(Priority),
  // TRR Specific Fields
  riskAssessment: z3.object({
    overall_score: z3.number().min(0).max(10),
    categories: z3.array(z3.object({
      category: z3.string(),
      score: z3.number().min(0).max(10),
      description: z3.string(),
      mitigation: z3.string().optional(),
      evidence: z3.array(z3.string()).default([])
      // file URLs or references
    }))
  }),
  findings: z3.array(z3.object({
    id: z3.string(),
    title: z3.string(),
    description: z3.string(),
    severity: z3.enum(["low", "medium", "high", "critical"]),
    category: z3.string(),
    evidence: z3.array(z3.object({
      type: z3.enum(["screenshot", "log", "document", "test_result"]),
      url: z3.string(),
      description: z3.string().optional()
    })).default([]),
    recommendation: z3.string().optional(),
    status: z3.enum(["open", "addressed", "accepted_risk", "false_positive"])
  })).default([]),
  // Validation and Approval
  validation: z3.object({
    validator: z3.string().optional(),
    // uid of validator
    validatedAt: z3.date().optional(),
    validationNotes: z3.string().optional(),
    approved: z3.boolean().optional()
  }).optional(),
  signoff: z3.object({
    approver: z3.string().optional(),
    // uid of approver
    approvedAt: z3.date().optional(),
    signoffNotes: z3.string().optional(),
    digitalSignature: z3.string().optional()
  }).optional(),
  // Assignment
  owner: z3.string(),
  // uid of TRR owner
  reviewers: z3.array(z3.string()).default([]),
  // Metadata
  createdAt: z3.date(),
  updatedAt: z3.date(),
  createdBy: z3.string(),
  lastModifiedBy: z3.string()
});
var TaskSchema = z3.object({
  id: z3.string(),
  title: z3.string(),
  description: z3.string().optional(),
  status: z3.nativeEnum(TaskStatus),
  priority: z3.nativeEnum(Priority),
  // Relations
  projectId: z3.string().optional(),
  povId: z3.string().optional(),
  trrId: z3.string().optional(),
  parentTaskId: z3.string().optional(),
  dependencies: z3.array(z3.string()).default([]),
  // task IDs this task depends on
  // Assignment and timing
  assignee: z3.string().optional(),
  // uid of assignee
  estimatedHours: z3.number().optional(),
  actualHours: z3.number().optional(),
  startDate: z3.date().optional(),
  dueDate: z3.date().optional(),
  completedAt: z3.date().optional(),
  // Task details
  labels: z3.array(z3.string()).default([]),
  checklist: z3.array(z3.object({
    id: z3.string(),
    text: z3.string(),
    completed: z3.boolean().default(false)
  })).default([]),
  attachments: z3.array(z3.object({
    name: z3.string(),
    url: z3.string(),
    type: z3.string(),
    size: z3.number().optional()
  })).default([]),
  // Metadata
  createdAt: z3.date(),
  updatedAt: z3.date(),
  createdBy: z3.string(),
  lastModifiedBy: z3.string()
});
var NoteSchema = z3.object({
  id: z3.string(),
  title: z3.string().optional(),
  content: z3.string(),
  type: z3.enum(["note", "meeting", "decision", "action_item", "issue"]).default("note"),
  // Relations - at least one must be specified
  projectId: z3.string().optional(),
  povId: z3.string().optional(),
  trrId: z3.string().optional(),
  taskId: z3.string().optional(),
  // Classification
  tags: z3.array(z3.string()).default([]),
  isPrivate: z3.boolean().default(false),
  isPinned: z3.boolean().default(false),
  // Rich content
  mentions: z3.array(z3.string()).default([]),
  // user IDs mentioned in note
  attachments: z3.array(z3.object({
    name: z3.string(),
    url: z3.string(),
    type: z3.string()
  })).default([]),
  // Metadata
  createdAt: z3.date(),
  updatedAt: z3.date(),
  createdBy: z3.string(),
  lastModifiedBy: z3.string()
});
var TimelineEventSchema = z3.object({
  id: z3.string(),
  type: z3.enum([
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
  title: z3.string(),
  description: z3.string().optional(),
  // Relations
  projectId: z3.string().optional(),
  povId: z3.string().optional(),
  trrId: z3.string().optional(),
  taskId: z3.string().optional(),
  // Event details
  actor: z3.string(),
  // uid of user who triggered the event
  metadata: z3.record(z3.unknown()).optional(),
  // additional event data
  // Timing
  timestamp: z3.date(),
  createdAt: z3.date()
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
export {
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
};
