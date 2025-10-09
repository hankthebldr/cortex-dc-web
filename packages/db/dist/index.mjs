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
export {
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
};
