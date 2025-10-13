import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { z } from 'zod';

declare const isMockAuthMode: boolean;
declare const useEmulator: boolean;
/**
 * Firebase Authentication instance
 * Lazy-loaded via Proxy pattern for optimal performance
 */
declare const auth: Auth;
/**
 * Firebase Firestore instance
 * Lazy-loaded via Proxy pattern for optimal performance
 */
declare const db: Firestore;
/**
 * Firebase Storage instance
 * Lazy-loaded via Proxy pattern for optimal performance
 */
declare const storage: FirebaseStorage;
/**
 * Firebase App instance
 * Lazy-loaded via Proxy pattern for optimal performance
 */
declare const firebaseApp: FirebaseApp;
/**
 * Get Firebase configuration (useful for debugging)
 */
declare function getFirebaseConfig(): {
    projectId: string;
    isMockMode: boolean;
    useEmulator: boolean;
    isConfigured: boolean;
};
/**
 * Force reconnect emulators (useful for testing)
 */
declare function forceReconnectEmulators(): void;

interface AuthUser {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    viewMode: 'admin' | 'user';
    permissions: string[];
    lastLogin: string;
    authProvider: 'local' | 'okta' | 'firebase';
}
interface AuthCredentials {
    username: string;
    password: string;
}
interface AuthResult {
    success: boolean;
    user?: AuthUser;
    error?: string;
}
declare class AuthService {
    private readonly STORAGE_KEYS;
    private readonly VALID_USERS;
    /**
     * Authenticate user with local credentials
     * Supports: user1/paloalto1 and cortex/xsiam
     * @param credentials - Username and password
     * @returns Authentication result with user data or error
     */
    authenticate(credentials: AuthCredentials): Promise<AuthResult>;
    /**
     * Check if user is currently authenticated
     * @returns True if user has valid session
     */
    isAuthenticated(): boolean;
    /**
     * Get current authenticated user
     * @returns User object or null if not authenticated
     */
    getCurrentUser(): AuthUser | null;
    /**
     * Get current session ID
     * @returns Session ID or null
     */
    getSessionId(): string | null;
    /**
     * Store authentication session
     * @param user - Authenticated user data
     */
    private setSession;
    /**
     * Clear authentication session
     */
    clearSession(): void;
    /**
     * Logout user and clear session
     */
    logout(): Promise<void>;
    /**
     * Check if user has specific permission
     * @param permission - Permission string to check
     * @returns True if user has permission
     */
    hasPermission(permission: string): boolean;
    /**
     * Check if user has admin role
     * @returns True if user is admin
     */
    isAdmin(): boolean;
    /**
     * Get user permissions
     * @returns Array of permission strings
     */
    getUserPermissions(): string[];
}
declare const authService: AuthService;

interface FirestoreConfig {
    app: FirebaseApp;
    useEmulator?: boolean;
    emulatorHost?: string;
    emulatorPort?: number;
}
declare class FirestoreClient {
    private db;
    private config;
    constructor(config: FirestoreConfig);
    getDatabase(): Firestore;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

declare class FirestoreQueries {
}

declare const USER_COLLECTION = "users";
declare const UserValidationRules: {
    required: string[];
    maxNameLength: number;
    maxBioLength: number;
    validRoles: string[];
};

interface UserSchema {
    id: string;
    email: string;
    name?: string;
    organizationId?: string;
    role: 'admin' | 'user' | 'viewer';
    profile?: {
        avatar?: string;
        bio?: string;
        preferences?: Record<string, any>;
    };
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<["admin", "user"]>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    role: "admin" | "user";
    email: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}, {
    role: "admin" | "user";
    email: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}>;
type User = z.infer<typeof UserSchema>;

interface ChatSchema {
    id: string;
    userId: string;
    sessionId: string;
    messages: {
        id: string;
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: Date;
        metadata?: Record<string, any>;
    }[];
    title?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const CHAT_COLLECTION = "chats";
declare const ChatValidationRules: {
    required: string[];
    maxMessages: number;
    maxTitleLength: number;
};

/**
 * User Role Definitions
 * Hierarchical access control system for Domain Consultant platform
 */
declare enum UserRole {
    USER = "user",
    MANAGER = "manager",
    ADMIN = "admin"
}
declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    SUSPENDED = "suspended"
}
/**
 * User Profile Schema
 */
declare const UserProfileSchema: z.ZodObject<{
    uid: z.ZodString;
    email: z.ZodString;
    displayName: z.ZodString;
    role: z.ZodNativeEnum<typeof UserRole>;
    status: z.ZodNativeEnum<typeof UserStatus>;
    department: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    manager: z.ZodOptional<z.ZodString>;
    teams: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    preferences: z.ZodDefault<z.ZodObject<{
        theme: z.ZodDefault<z.ZodEnum<["light", "dark", "system"]>>;
        notifications: z.ZodDefault<z.ZodObject<{
            email: z.ZodDefault<z.ZodBoolean>;
            inApp: z.ZodDefault<z.ZodBoolean>;
            desktop: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            email: boolean;
            inApp: boolean;
            desktop: boolean;
        }, {
            email?: boolean | undefined;
            inApp?: boolean | undefined;
            desktop?: boolean | undefined;
        }>>;
        dashboard: z.ZodDefault<z.ZodObject<{
            layout: z.ZodDefault<z.ZodEnum<["grid", "list"]>>;
            defaultView: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            layout: "grid" | "list";
            defaultView?: string | undefined;
        }, {
            layout?: "grid" | "list" | undefined;
            defaultView?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        theme: "system" | "light" | "dark";
        notifications: {
            email: boolean;
            inApp: boolean;
            desktop: boolean;
        };
        dashboard: {
            layout: "grid" | "list";
            defaultView?: string | undefined;
        };
    }, {
        theme?: "system" | "light" | "dark" | undefined;
        notifications?: {
            email?: boolean | undefined;
            inApp?: boolean | undefined;
            desktop?: boolean | undefined;
        } | undefined;
        dashboard?: {
            layout?: "grid" | "list" | undefined;
            defaultView?: string | undefined;
        } | undefined;
    }>>;
    permissions: z.ZodObject<{
        povManagement: z.ZodDefault<z.ZodObject<{
            create: z.ZodDefault<z.ZodBoolean>;
            edit: z.ZodDefault<z.ZodBoolean>;
            delete: z.ZodDefault<z.ZodBoolean>;
            viewAll: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            create: boolean;
            edit: boolean;
            delete: boolean;
            viewAll: boolean;
        }, {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            delete?: boolean | undefined;
            viewAll?: boolean | undefined;
        }>>;
        trrManagement: z.ZodDefault<z.ZodObject<{
            create: z.ZodDefault<z.ZodBoolean>;
            edit: z.ZodDefault<z.ZodBoolean>;
            delete: z.ZodDefault<z.ZodBoolean>;
            approve: z.ZodDefault<z.ZodBoolean>;
            viewAll: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            create: boolean;
            edit: boolean;
            delete: boolean;
            viewAll: boolean;
            approve: boolean;
        }, {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            delete?: boolean | undefined;
            viewAll?: boolean | undefined;
            approve?: boolean | undefined;
        }>>;
        contentHub: z.ZodDefault<z.ZodObject<{
            create: z.ZodDefault<z.ZodBoolean>;
            edit: z.ZodDefault<z.ZodBoolean>;
            publish: z.ZodDefault<z.ZodBoolean>;
            moderate: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            create: boolean;
            edit: boolean;
            publish: boolean;
            moderate: boolean;
        }, {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            publish?: boolean | undefined;
            moderate?: boolean | undefined;
        }>>;
        scenarioEngine: z.ZodDefault<z.ZodObject<{
            execute: z.ZodDefault<z.ZodBoolean>;
            create: z.ZodDefault<z.ZodBoolean>;
            modify: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            create: boolean;
            execute: boolean;
            modify: boolean;
        }, {
            create?: boolean | undefined;
            execute?: boolean | undefined;
            modify?: boolean | undefined;
        }>>;
        terminal: z.ZodDefault<z.ZodObject<{
            basic: z.ZodDefault<z.ZodBoolean>;
            advanced: z.ZodDefault<z.ZodBoolean>;
            admin: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            admin: boolean;
            basic: boolean;
            advanced: boolean;
        }, {
            admin?: boolean | undefined;
            basic?: boolean | undefined;
            advanced?: boolean | undefined;
        }>>;
        analytics: z.ZodDefault<z.ZodObject<{
            view: z.ZodDefault<z.ZodBoolean>;
            export: z.ZodDefault<z.ZodBoolean>;
            detailed: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            view: boolean;
            export: boolean;
            detailed: boolean;
        }, {
            view?: boolean | undefined;
            export?: boolean | undefined;
            detailed?: boolean | undefined;
        }>>;
        userManagement: z.ZodDefault<z.ZodObject<{
            view: z.ZodDefault<z.ZodBoolean>;
            edit: z.ZodDefault<z.ZodBoolean>;
            create: z.ZodDefault<z.ZodBoolean>;
            delete: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            create: boolean;
            edit: boolean;
            delete: boolean;
            view: boolean;
        }, {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            delete?: boolean | undefined;
            view?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        povManagement: {
            create: boolean;
            edit: boolean;
            delete: boolean;
            viewAll: boolean;
        };
        trrManagement: {
            create: boolean;
            edit: boolean;
            delete: boolean;
            viewAll: boolean;
            approve: boolean;
        };
        contentHub: {
            create: boolean;
            edit: boolean;
            publish: boolean;
            moderate: boolean;
        };
        scenarioEngine: {
            create: boolean;
            execute: boolean;
            modify: boolean;
        };
        terminal: {
            admin: boolean;
            basic: boolean;
            advanced: boolean;
        };
        analytics: {
            view: boolean;
            export: boolean;
            detailed: boolean;
        };
        userManagement: {
            create: boolean;
            edit: boolean;
            delete: boolean;
            view: boolean;
        };
    }, {
        povManagement?: {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            delete?: boolean | undefined;
            viewAll?: boolean | undefined;
        } | undefined;
        trrManagement?: {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            delete?: boolean | undefined;
            viewAll?: boolean | undefined;
            approve?: boolean | undefined;
        } | undefined;
        contentHub?: {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            publish?: boolean | undefined;
            moderate?: boolean | undefined;
        } | undefined;
        scenarioEngine?: {
            create?: boolean | undefined;
            execute?: boolean | undefined;
            modify?: boolean | undefined;
        } | undefined;
        terminal?: {
            admin?: boolean | undefined;
            basic?: boolean | undefined;
            advanced?: boolean | undefined;
        } | undefined;
        analytics?: {
            view?: boolean | undefined;
            export?: boolean | undefined;
            detailed?: boolean | undefined;
        } | undefined;
        userManagement?: {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            delete?: boolean | undefined;
            view?: boolean | undefined;
        } | undefined;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastLoginAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    role: UserRole;
    email: string;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    uid: string;
    displayName: string;
    teams: string[];
    preferences: {
        theme: "system" | "light" | "dark";
        notifications: {
            email: boolean;
            inApp: boolean;
            desktop: boolean;
        };
        dashboard: {
            layout: "grid" | "list";
            defaultView?: string | undefined;
        };
    };
    permissions: {
        povManagement: {
            create: boolean;
            edit: boolean;
            delete: boolean;
            viewAll: boolean;
        };
        trrManagement: {
            create: boolean;
            edit: boolean;
            delete: boolean;
            viewAll: boolean;
            approve: boolean;
        };
        contentHub: {
            create: boolean;
            edit: boolean;
            publish: boolean;
            moderate: boolean;
        };
        scenarioEngine: {
            create: boolean;
            execute: boolean;
            modify: boolean;
        };
        terminal: {
            admin: boolean;
            basic: boolean;
            advanced: boolean;
        };
        analytics: {
            view: boolean;
            export: boolean;
            detailed: boolean;
        };
        userManagement: {
            create: boolean;
            edit: boolean;
            delete: boolean;
            view: boolean;
        };
    };
    manager?: string | undefined;
    department?: string | undefined;
    title?: string | undefined;
    lastLoginAt?: Date | undefined;
}, {
    role: UserRole;
    email: string;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    uid: string;
    displayName: string;
    permissions: {
        povManagement?: {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            delete?: boolean | undefined;
            viewAll?: boolean | undefined;
        } | undefined;
        trrManagement?: {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            delete?: boolean | undefined;
            viewAll?: boolean | undefined;
            approve?: boolean | undefined;
        } | undefined;
        contentHub?: {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            publish?: boolean | undefined;
            moderate?: boolean | undefined;
        } | undefined;
        scenarioEngine?: {
            create?: boolean | undefined;
            execute?: boolean | undefined;
            modify?: boolean | undefined;
        } | undefined;
        terminal?: {
            admin?: boolean | undefined;
            basic?: boolean | undefined;
            advanced?: boolean | undefined;
        } | undefined;
        analytics?: {
            view?: boolean | undefined;
            export?: boolean | undefined;
            detailed?: boolean | undefined;
        } | undefined;
        userManagement?: {
            create?: boolean | undefined;
            edit?: boolean | undefined;
            delete?: boolean | undefined;
            view?: boolean | undefined;
        } | undefined;
    };
    manager?: string | undefined;
    department?: string | undefined;
    title?: string | undefined;
    teams?: string[] | undefined;
    preferences?: {
        theme?: "system" | "light" | "dark" | undefined;
        notifications?: {
            email?: boolean | undefined;
            inApp?: boolean | undefined;
            desktop?: boolean | undefined;
        } | undefined;
        dashboard?: {
            layout?: "grid" | "list" | undefined;
            defaultView?: string | undefined;
        } | undefined;
    } | undefined;
    lastLoginAt?: Date | undefined;
}>;
type UserProfile = z.infer<typeof UserProfileSchema>;
/**
 * Team Schema
 */
declare const TeamSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    manager: z.ZodString;
    members: z.ZodArray<z.ZodString, "many">;
    region: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    manager: string;
    members: string[];
    isActive: boolean;
    department?: string | undefined;
    description?: string | undefined;
    region?: string | undefined;
}, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    manager: string;
    members: string[];
    department?: string | undefined;
    description?: string | undefined;
    region?: string | undefined;
    isActive?: boolean | undefined;
}>;
type Team = z.infer<typeof TeamSchema>;
/**
 * Permission Groups
 * Define what each role can access by default
 */
declare const ROLE_PERMISSIONS: Record<UserRole, Partial<UserProfile['permissions']>>;
/**
 * Navigation permissions based on role
 */
declare const ROLE_NAVIGATION: Record<UserRole, string[]>;
/**
 * Utility functions
 */
declare const hasPermission: (userProfile: UserProfile, resource: keyof UserProfile["permissions"], action: string) => boolean;
declare const canAccessRoute: (userProfile: UserProfile, route: string) => boolean;
declare const getDefaultPermissions: (role: UserRole) => UserProfile["permissions"];

/**
 * Project Management Schema
 * Core backbone for Domain Consultant engagement tracking
 */
declare enum ProjectStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    ON_HOLD = "on_hold",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
declare enum Priority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
declare enum POVStatus {
    PLANNING = "planning",
    IN_PROGRESS = "in_progress",
    TESTING = "testing",
    VALIDATING = "validating",
    COMPLETED = "completed",
    AT_RISK = "at_risk",
    CANCELLED = "cancelled"
}
declare enum TRRStatus {
    DRAFT = "draft",
    IN_REVIEW = "in_review",
    PENDING_VALIDATION = "pending_validation",
    VALIDATED = "validated",
    APPROVED = "approved",
    REJECTED = "rejected",
    COMPLETED = "completed"
}
declare enum TaskStatus {
    TODO = "todo",
    IN_PROGRESS = "in_progress",
    REVIEW = "review",
    DONE = "done",
    BLOCKED = "blocked"
}
/**
 * Base Project Schema
 * Central entity that ties together POVs, TRRs, and other activities
 */
declare const ProjectSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    customer: z.ZodObject<{
        name: z.ZodString;
        industry: z.ZodOptional<z.ZodString>;
        size: z.ZodOptional<z.ZodEnum<["startup", "small", "medium", "enterprise"]>>;
        region: z.ZodOptional<z.ZodString>;
        contact: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            role: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            name: string;
            role?: string | undefined;
            phone?: string | undefined;
        }, {
            email: string;
            name: string;
            role?: string | undefined;
            phone?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        region?: string | undefined;
        industry?: string | undefined;
        size?: "medium" | "startup" | "small" | "enterprise" | undefined;
        contact?: {
            email: string;
            name: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    }, {
        name: string;
        region?: string | undefined;
        industry?: string | undefined;
        size?: "medium" | "startup" | "small" | "enterprise" | undefined;
        contact?: {
            email: string;
            name: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    }>;
    status: z.ZodNativeEnum<typeof ProjectStatus>;
    priority: z.ZodNativeEnum<typeof Priority>;
    owner: z.ZodString;
    team: z.ZodArray<z.ZodString, "many">;
    startDate: z.ZodDate;
    endDate: z.ZodOptional<z.ZodDate>;
    estimatedValue: z.ZodOptional<z.ZodNumber>;
    actualValue: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    povIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    trrIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    scenarioIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    createdBy: z.ZodString;
    lastModifiedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: ProjectStatus;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    customer: {
        name: string;
        region?: string | undefined;
        industry?: string | undefined;
        size?: "medium" | "startup" | "small" | "enterprise" | undefined;
        contact?: {
            email: string;
            name: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    };
    priority: Priority;
    owner: string;
    team: string[];
    startDate: Date;
    tags: string[];
    povIds: string[];
    trrIds: string[];
    scenarioIds: string[];
    createdBy: string;
    lastModifiedBy: string;
    description?: string | undefined;
    endDate?: Date | undefined;
    estimatedValue?: number | undefined;
    actualValue?: number | undefined;
}, {
    id: string;
    status: ProjectStatus;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    customer: {
        name: string;
        region?: string | undefined;
        industry?: string | undefined;
        size?: "medium" | "startup" | "small" | "enterprise" | undefined;
        contact?: {
            email: string;
            name: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    };
    priority: Priority;
    owner: string;
    team: string[];
    startDate: Date;
    createdBy: string;
    lastModifiedBy: string;
    description?: string | undefined;
    endDate?: Date | undefined;
    estimatedValue?: number | undefined;
    actualValue?: number | undefined;
    tags?: string[] | undefined;
    povIds?: string[] | undefined;
    trrIds?: string[] | undefined;
    scenarioIds?: string[] | undefined;
}>;
type Project = z.infer<typeof ProjectSchema>;
/**
 * POV (Proof of Value) Schema
 */
declare const POVSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    status: z.ZodNativeEnum<typeof POVStatus>;
    priority: z.ZodNativeEnum<typeof Priority>;
    objectives: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        success_criteria: z.ZodString;
        status: z.ZodEnum<["pending", "in_progress", "completed", "failed"]>;
        weight: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "pending" | "completed" | "in_progress" | "failed";
        description: string;
        success_criteria: string;
        weight: number;
    }, {
        id: string;
        status: "pending" | "completed" | "in_progress" | "failed";
        description: string;
        success_criteria: string;
        weight?: number | undefined;
    }>, "many">>;
    testPlan: z.ZodOptional<z.ZodObject<{
        scenarios: z.ZodArray<z.ZodString, "many">;
        environment: z.ZodOptional<z.ZodString>;
        timeline: z.ZodObject<{
            start: z.ZodDate;
            end: z.ZodDate;
            milestones: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                date: z.ZodDate;
                status: z.ZodEnum<["upcoming", "in_progress", "completed", "overdue"]>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                status: "completed" | "in_progress" | "upcoming" | "overdue";
                date: Date;
                title: string;
            }, {
                id: string;
                status: "completed" | "in_progress" | "upcoming" | "overdue";
                date: Date;
                title: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            start: Date;
            end: Date;
            milestones: {
                id: string;
                status: "completed" | "in_progress" | "upcoming" | "overdue";
                date: Date;
                title: string;
            }[];
        }, {
            start: Date;
            end: Date;
            milestones: {
                id: string;
                status: "completed" | "in_progress" | "upcoming" | "overdue";
                date: Date;
                title: string;
            }[];
        }>;
        resources: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["personnel", "equipment", "software", "budget"]>;
            description: z.ZodString;
            quantity: z.ZodOptional<z.ZodNumber>;
            cost: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "personnel" | "equipment" | "software" | "budget";
            description: string;
            quantity?: number | undefined;
            cost?: number | undefined;
        }, {
            type: "personnel" | "equipment" | "software" | "budget";
            description: string;
            quantity?: number | undefined;
            cost?: number | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        scenarios: string[];
        timeline: {
            start: Date;
            end: Date;
            milestones: {
                id: string;
                status: "completed" | "in_progress" | "upcoming" | "overdue";
                date: Date;
                title: string;
            }[];
        };
        resources: {
            type: "personnel" | "equipment" | "software" | "budget";
            description: string;
            quantity?: number | undefined;
            cost?: number | undefined;
        }[];
        environment?: string | undefined;
    }, {
        scenarios: string[];
        timeline: {
            start: Date;
            end: Date;
            milestones: {
                id: string;
                status: "completed" | "in_progress" | "upcoming" | "overdue";
                date: Date;
                title: string;
            }[];
        };
        environment?: string | undefined;
        resources?: {
            type: "personnel" | "equipment" | "software" | "budget";
            description: string;
            quantity?: number | undefined;
            cost?: number | undefined;
        }[] | undefined;
    }>>;
    successMetrics: z.ZodDefault<z.ZodObject<{
        businessValue: z.ZodOptional<z.ZodObject<{
            roi: z.ZodOptional<z.ZodNumber>;
            costSavings: z.ZodOptional<z.ZodNumber>;
            riskReduction: z.ZodOptional<z.ZodString>;
            efficiency_gains: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            roi?: number | undefined;
            costSavings?: number | undefined;
            riskReduction?: string | undefined;
            efficiency_gains?: string | undefined;
        }, {
            roi?: number | undefined;
            costSavings?: number | undefined;
            riskReduction?: string | undefined;
            efficiency_gains?: string | undefined;
        }>>;
        technicalMetrics: z.ZodOptional<z.ZodObject<{
            performance: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            reliability: z.ZodOptional<z.ZodNumber>;
            security_score: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            performance?: Record<string, number> | undefined;
            reliability?: number | undefined;
            security_score?: number | undefined;
        }, {
            performance?: Record<string, number> | undefined;
            reliability?: number | undefined;
            security_score?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        businessValue?: {
            roi?: number | undefined;
            costSavings?: number | undefined;
            riskReduction?: string | undefined;
            efficiency_gains?: string | undefined;
        } | undefined;
        technicalMetrics?: {
            performance?: Record<string, number> | undefined;
            reliability?: number | undefined;
            security_score?: number | undefined;
        } | undefined;
    }, {
        businessValue?: {
            roi?: number | undefined;
            costSavings?: number | undefined;
            riskReduction?: string | undefined;
            efficiency_gains?: string | undefined;
        } | undefined;
        technicalMetrics?: {
            performance?: Record<string, number> | undefined;
            reliability?: number | undefined;
            security_score?: number | undefined;
        } | undefined;
    }>>;
    phases: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        startDate: z.ZodDate;
        endDate: z.ZodOptional<z.ZodDate>;
        status: z.ZodNativeEnum<typeof TaskStatus>;
        tasks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        status: TaskStatus;
        startDate: Date;
        tasks: string[];
        description?: string | undefined;
        endDate?: Date | undefined;
    }, {
        id: string;
        name: string;
        status: TaskStatus;
        startDate: Date;
        description?: string | undefined;
        endDate?: Date | undefined;
        tasks?: string[] | undefined;
    }>, "many">>;
    owner: z.ZodString;
    team: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    createdBy: z.ZodString;
    lastModifiedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: POVStatus;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string;
    priority: Priority;
    owner: string;
    team: string[];
    createdBy: string;
    lastModifiedBy: string;
    projectId: string;
    objectives: {
        id: string;
        status: "pending" | "completed" | "in_progress" | "failed";
        description: string;
        success_criteria: string;
        weight: number;
    }[];
    successMetrics: {
        businessValue?: {
            roi?: number | undefined;
            costSavings?: number | undefined;
            riskReduction?: string | undefined;
            efficiency_gains?: string | undefined;
        } | undefined;
        technicalMetrics?: {
            performance?: Record<string, number> | undefined;
            reliability?: number | undefined;
            security_score?: number | undefined;
        } | undefined;
    };
    phases: {
        id: string;
        name: string;
        status: TaskStatus;
        startDate: Date;
        tasks: string[];
        description?: string | undefined;
        endDate?: Date | undefined;
    }[];
    testPlan?: {
        scenarios: string[];
        timeline: {
            start: Date;
            end: Date;
            milestones: {
                id: string;
                status: "completed" | "in_progress" | "upcoming" | "overdue";
                date: Date;
                title: string;
            }[];
        };
        resources: {
            type: "personnel" | "equipment" | "software" | "budget";
            description: string;
            quantity?: number | undefined;
            cost?: number | undefined;
        }[];
        environment?: string | undefined;
    } | undefined;
}, {
    id: string;
    status: POVStatus;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string;
    priority: Priority;
    owner: string;
    createdBy: string;
    lastModifiedBy: string;
    projectId: string;
    team?: string[] | undefined;
    objectives?: {
        id: string;
        status: "pending" | "completed" | "in_progress" | "failed";
        description: string;
        success_criteria: string;
        weight?: number | undefined;
    }[] | undefined;
    testPlan?: {
        scenarios: string[];
        timeline: {
            start: Date;
            end: Date;
            milestones: {
                id: string;
                status: "completed" | "in_progress" | "upcoming" | "overdue";
                date: Date;
                title: string;
            }[];
        };
        environment?: string | undefined;
        resources?: {
            type: "personnel" | "equipment" | "software" | "budget";
            description: string;
            quantity?: number | undefined;
            cost?: number | undefined;
        }[] | undefined;
    } | undefined;
    successMetrics?: {
        businessValue?: {
            roi?: number | undefined;
            costSavings?: number | undefined;
            riskReduction?: string | undefined;
            efficiency_gains?: string | undefined;
        } | undefined;
        technicalMetrics?: {
            performance?: Record<string, number> | undefined;
            reliability?: number | undefined;
            security_score?: number | undefined;
        } | undefined;
    } | undefined;
    phases?: {
        id: string;
        name: string;
        status: TaskStatus;
        startDate: Date;
        description?: string | undefined;
        endDate?: Date | undefined;
        tasks?: string[] | undefined;
    }[] | undefined;
}>;
type POV = z.infer<typeof POVSchema>;
/**
 * TRR (Technical Risk Review) Schema
 */
declare const TRRSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    povId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodString;
    status: z.ZodNativeEnum<typeof TRRStatus>;
    priority: z.ZodNativeEnum<typeof Priority>;
    riskAssessment: z.ZodObject<{
        overall_score: z.ZodNumber;
        categories: z.ZodArray<z.ZodObject<{
            category: z.ZodString;
            score: z.ZodNumber;
            description: z.ZodString;
            mitigation: z.ZodOptional<z.ZodString>;
            evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            category: string;
            score: number;
            evidence: string[];
            mitigation?: string | undefined;
        }, {
            description: string;
            category: string;
            score: number;
            mitigation?: string | undefined;
            evidence?: string[] | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        overall_score: number;
        categories: {
            description: string;
            category: string;
            score: number;
            evidence: string[];
            mitigation?: string | undefined;
        }[];
    }, {
        overall_score: number;
        categories: {
            description: string;
            category: string;
            score: number;
            mitigation?: string | undefined;
            evidence?: string[] | undefined;
        }[];
    }>;
    findings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
        category: z.ZodString;
        evidence: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["screenshot", "log", "document", "test_result"]>;
            url: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "screenshot" | "log" | "document" | "test_result";
            url: string;
            description?: string | undefined;
        }, {
            type: "screenshot" | "log" | "document" | "test_result";
            url: string;
            description?: string | undefined;
        }>, "many">>;
        recommendation: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<["open", "addressed", "accepted_risk", "false_positive"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "open" | "addressed" | "accepted_risk" | "false_positive";
        title: string;
        description: string;
        category: string;
        evidence: {
            type: "screenshot" | "log" | "document" | "test_result";
            url: string;
            description?: string | undefined;
        }[];
        severity: "low" | "medium" | "high" | "critical";
        recommendation?: string | undefined;
    }, {
        id: string;
        status: "open" | "addressed" | "accepted_risk" | "false_positive";
        title: string;
        description: string;
        category: string;
        severity: "low" | "medium" | "high" | "critical";
        evidence?: {
            type: "screenshot" | "log" | "document" | "test_result";
            url: string;
            description?: string | undefined;
        }[] | undefined;
        recommendation?: string | undefined;
    }>, "many">>;
    validation: z.ZodOptional<z.ZodObject<{
        validator: z.ZodOptional<z.ZodString>;
        validatedAt: z.ZodOptional<z.ZodDate>;
        validationNotes: z.ZodOptional<z.ZodString>;
        approved: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        approved?: boolean | undefined;
        validator?: string | undefined;
        validatedAt?: Date | undefined;
        validationNotes?: string | undefined;
    }, {
        approved?: boolean | undefined;
        validator?: string | undefined;
        validatedAt?: Date | undefined;
        validationNotes?: string | undefined;
    }>>;
    signoff: z.ZodOptional<z.ZodObject<{
        approver: z.ZodOptional<z.ZodString>;
        approvedAt: z.ZodOptional<z.ZodDate>;
        signoffNotes: z.ZodOptional<z.ZodString>;
        digitalSignature: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        approver?: string | undefined;
        approvedAt?: Date | undefined;
        signoffNotes?: string | undefined;
        digitalSignature?: string | undefined;
    }, {
        approver?: string | undefined;
        approvedAt?: Date | undefined;
        signoffNotes?: string | undefined;
        digitalSignature?: string | undefined;
    }>>;
    owner: z.ZodString;
    reviewers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    createdBy: z.ZodString;
    lastModifiedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: TRRStatus;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string;
    priority: Priority;
    owner: string;
    createdBy: string;
    lastModifiedBy: string;
    projectId: string;
    riskAssessment: {
        overall_score: number;
        categories: {
            description: string;
            category: string;
            score: number;
            evidence: string[];
            mitigation?: string | undefined;
        }[];
    };
    findings: {
        id: string;
        status: "open" | "addressed" | "accepted_risk" | "false_positive";
        title: string;
        description: string;
        category: string;
        evidence: {
            type: "screenshot" | "log" | "document" | "test_result";
            url: string;
            description?: string | undefined;
        }[];
        severity: "low" | "medium" | "high" | "critical";
        recommendation?: string | undefined;
    }[];
    reviewers: string[];
    validation?: {
        approved?: boolean | undefined;
        validator?: string | undefined;
        validatedAt?: Date | undefined;
        validationNotes?: string | undefined;
    } | undefined;
    povId?: string | undefined;
    signoff?: {
        approver?: string | undefined;
        approvedAt?: Date | undefined;
        signoffNotes?: string | undefined;
        digitalSignature?: string | undefined;
    } | undefined;
}, {
    id: string;
    status: TRRStatus;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string;
    priority: Priority;
    owner: string;
    createdBy: string;
    lastModifiedBy: string;
    projectId: string;
    riskAssessment: {
        overall_score: number;
        categories: {
            description: string;
            category: string;
            score: number;
            mitigation?: string | undefined;
            evidence?: string[] | undefined;
        }[];
    };
    validation?: {
        approved?: boolean | undefined;
        validator?: string | undefined;
        validatedAt?: Date | undefined;
        validationNotes?: string | undefined;
    } | undefined;
    povId?: string | undefined;
    findings?: {
        id: string;
        status: "open" | "addressed" | "accepted_risk" | "false_positive";
        title: string;
        description: string;
        category: string;
        severity: "low" | "medium" | "high" | "critical";
        evidence?: {
            type: "screenshot" | "log" | "document" | "test_result";
            url: string;
            description?: string | undefined;
        }[] | undefined;
        recommendation?: string | undefined;
    }[] | undefined;
    signoff?: {
        approver?: string | undefined;
        approvedAt?: Date | undefined;
        signoffNotes?: string | undefined;
        digitalSignature?: string | undefined;
    } | undefined;
    reviewers?: string[] | undefined;
}>;
type TRR = z.infer<typeof TRRSchema>;
/**
 * Task Schema
 * Granular tasks within projects, POVs, or TRRs
 */
declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodNativeEnum<typeof TaskStatus>;
    priority: z.ZodNativeEnum<typeof Priority>;
    projectId: z.ZodOptional<z.ZodString>;
    povId: z.ZodOptional<z.ZodString>;
    trrId: z.ZodOptional<z.ZodString>;
    parentTaskId: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    assignee: z.ZodOptional<z.ZodString>;
    estimatedHours: z.ZodOptional<z.ZodNumber>;
    actualHours: z.ZodOptional<z.ZodNumber>;
    startDate: z.ZodOptional<z.ZodDate>;
    dueDate: z.ZodOptional<z.ZodDate>;
    completedAt: z.ZodOptional<z.ZodDate>;
    labels: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    checklist: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        completed: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        completed: boolean;
        text: string;
    }, {
        id: string;
        text: string;
        completed?: boolean | undefined;
    }>, "many">>;
    attachments: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        type: z.ZodString;
        size: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: string;
        url: string;
        size?: number | undefined;
    }, {
        name: string;
        type: string;
        url: string;
        size?: number | undefined;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    createdBy: z.ZodString;
    lastModifiedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: TaskStatus;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    priority: Priority;
    createdBy: string;
    lastModifiedBy: string;
    dependencies: string[];
    labels: string[];
    checklist: {
        id: string;
        completed: boolean;
        text: string;
    }[];
    attachments: {
        name: string;
        type: string;
        url: string;
        size?: number | undefined;
    }[];
    description?: string | undefined;
    startDate?: Date | undefined;
    projectId?: string | undefined;
    povId?: string | undefined;
    trrId?: string | undefined;
    parentTaskId?: string | undefined;
    assignee?: string | undefined;
    estimatedHours?: number | undefined;
    actualHours?: number | undefined;
    dueDate?: Date | undefined;
    completedAt?: Date | undefined;
}, {
    id: string;
    status: TaskStatus;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    priority: Priority;
    createdBy: string;
    lastModifiedBy: string;
    description?: string | undefined;
    startDate?: Date | undefined;
    projectId?: string | undefined;
    povId?: string | undefined;
    trrId?: string | undefined;
    parentTaskId?: string | undefined;
    dependencies?: string[] | undefined;
    assignee?: string | undefined;
    estimatedHours?: number | undefined;
    actualHours?: number | undefined;
    dueDate?: Date | undefined;
    completedAt?: Date | undefined;
    labels?: string[] | undefined;
    checklist?: {
        id: string;
        text: string;
        completed?: boolean | undefined;
    }[] | undefined;
    attachments?: {
        name: string;
        type: string;
        url: string;
        size?: number | undefined;
    }[] | undefined;
}>;
type Task = z.infer<typeof TaskSchema>;
/**
 * Note Schema
 * Notes and documentation attached to any entity
 */
declare const NoteSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["note", "meeting", "decision", "action_item", "issue"]>>;
    projectId: z.ZodOptional<z.ZodString>;
    povId: z.ZodOptional<z.ZodString>;
    trrId: z.ZodOptional<z.ZodString>;
    taskId: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isPrivate: z.ZodDefault<z.ZodBoolean>;
    isPinned: z.ZodDefault<z.ZodBoolean>;
    mentions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: string;
        url: string;
    }, {
        name: string;
        type: string;
        url: string;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    createdBy: z.ZodString;
    lastModifiedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "note" | "meeting" | "decision" | "action_item" | "issue";
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    createdBy: string;
    lastModifiedBy: string;
    attachments: {
        name: string;
        type: string;
        url: string;
    }[];
    content: string;
    isPrivate: boolean;
    isPinned: boolean;
    mentions: string[];
    title?: string | undefined;
    projectId?: string | undefined;
    povId?: string | undefined;
    trrId?: string | undefined;
    taskId?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    content: string;
    type?: "note" | "meeting" | "decision" | "action_item" | "issue" | undefined;
    title?: string | undefined;
    tags?: string[] | undefined;
    projectId?: string | undefined;
    povId?: string | undefined;
    trrId?: string | undefined;
    attachments?: {
        name: string;
        type: string;
        url: string;
    }[] | undefined;
    taskId?: string | undefined;
    isPrivate?: boolean | undefined;
    isPinned?: boolean | undefined;
    mentions?: string[] | undefined;
}>;
type Note = z.infer<typeof NoteSchema>;
/**
 * Timeline Event Schema
 * Tracks all significant events across projects
 */
declare const TimelineEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["project_created", "project_updated", "project_completed", "pov_created", "pov_phase_completed", "pov_completed", "trr_created", "trr_submitted", "trr_approved", "task_created", "task_completed", "milestone_reached", "note_added", "team_member_added", "status_changed"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    povId: z.ZodOptional<z.ZodString>;
    trrId: z.ZodOptional<z.ZodString>;
    taskId: z.ZodOptional<z.ZodString>;
    actor: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodDate;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "project_created" | "project_updated" | "project_completed" | "pov_created" | "pov_phase_completed" | "pov_completed" | "trr_created" | "trr_submitted" | "trr_approved" | "task_created" | "task_completed" | "milestone_reached" | "note_added" | "team_member_added" | "status_changed";
    createdAt: Date;
    title: string;
    actor: string;
    timestamp: Date;
    description?: string | undefined;
    projectId?: string | undefined;
    povId?: string | undefined;
    trrId?: string | undefined;
    taskId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    id: string;
    type: "project_created" | "project_updated" | "project_completed" | "pov_created" | "pov_phase_completed" | "pov_completed" | "trr_created" | "trr_submitted" | "trr_approved" | "task_created" | "task_completed" | "milestone_reached" | "note_added" | "team_member_added" | "status_changed";
    createdAt: Date;
    title: string;
    actor: string;
    timestamp: Date;
    description?: string | undefined;
    projectId?: string | undefined;
    povId?: string | undefined;
    trrId?: string | undefined;
    taskId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
type TimelineEvent = z.infer<typeof TimelineEventSchema>;
/**
 * Utility functions for project management
 */
declare const calculatePOVProgress: (pov: POV) => number;
declare const calculateProjectHealth: (project: Project, povs: POV[], trrs: TRR[]) => {
    health: "good" | "warning" | "at_risk";
    score: number;
    factors: string[];
};
declare const getProjectTimeline: (project: Project, povs: POV[], trrs: TRR[], tasks: Task[]) => TimelineEvent[];

interface DatabaseClient {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
interface QueryResult<T = any> {
    data: T[];
    total: number;
    hasMore: boolean;
}
interface TransactionContext {
    commit(): Promise<void>;
    rollback(): Promise<void>;
}

export { type AuthCredentials, type AuthResult, type AuthUser, CHAT_COLLECTION, type ChatSchema, ChatValidationRules, type DatabaseClient, FirestoreClient, FirestoreQueries, type Note, NoteSchema, type POV, POVSchema, POVStatus, Priority, type Project, ProjectSchema, ProjectStatus, type QueryResult, ROLE_NAVIGATION, ROLE_PERMISSIONS, type TRR, TRRSchema, TRRStatus, type Task, TaskSchema, TaskStatus, type Team, TeamSchema, type TimelineEvent, TimelineEventSchema, type TransactionContext, USER_COLLECTION, type User, type UserProfile, UserProfileSchema, UserRole, UserSchema, UserStatus, UserValidationRules, auth, authService, calculatePOVProgress, calculateProjectHealth, canAccessRoute, db, firebaseApp, forceReconnectEmulators, getDefaultPermissions, getFirebaseConfig, getProjectTimeline, hasPermission, isMockAuthMode, storage, useEmulator };
