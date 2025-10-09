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
  POVValidationRules: () => POVValidationRules,
  POV_COLLECTION: () => POV_COLLECTION,
  TRRSchema: () => TRRSchema,
  TRRValidationRules: () => TRRValidationRules,
  TRR_COLLECTION: () => TRR_COLLECTION,
  USER_COLLECTION: () => USER_COLLECTION,
  UserSchema: () => UserSchema,
  UserValidationRules: () => UserValidationRules
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

// src/schemas/pov.ts
var POV_COLLECTION = "povs";
var POVValidationRules = {
  required: ["organizationId", "userId", "title"],
  maxTitleLength: 200,
  maxDescriptionLength: 2e3,
  maxTags: 20,
  validStatuses: ["draft", "active", "archived"]
};

// src/schemas/trr.ts
var TRR_COLLECTION = "trrs";
var TRRValidationRules = {
  required: ["povId", "organizationId", "userId", "title"],
  maxTitleLength: 200,
  maxDescriptionLength: 2e3,
  validStatuses: ["pending", "in-progress", "completed", "failed"],
  validPriorities: ["low", "medium", "high", "critical"]
};
var TRRSchema = {};

// src/schemas/chat.ts
var CHAT_COLLECTION = "chats";
var ChatValidationRules = {
  required: ["userId", "sessionId", "messages"],
  maxMessages: 1e3,
  maxTitleLength: 100
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CHAT_COLLECTION,
  ChatValidationRules,
  FirestoreClient,
  FirestoreQueries,
  POVValidationRules,
  POV_COLLECTION,
  TRRSchema,
  TRRValidationRules,
  TRR_COLLECTION,
  USER_COLLECTION,
  UserSchema,
  UserValidationRules
});
