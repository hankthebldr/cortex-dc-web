import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore, Unsubscribe } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Functions } from 'firebase/functions';
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
 * Firebase Functions instance
 * Lazy-loaded via Proxy pattern for optimal performance
 */
declare const functions: Functions;
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

type AnalyticsFilters = {
    region?: string;
    theatre?: string | null;
    user?: string | null;
    sinceDays?: number;
};
type EngagementRecord = {
    region: string;
    theatre: string;
    user: string;
    location: string;
    customer: string;
    createdAt: Date;
    completedAt?: Date | null;
    scenariosExecuted?: number;
    detectionsValidated?: number;
    trrOutcome?: 'win' | 'loss' | null;
    cycleDays?: number;
};
type AnalyticsResult = {
    records: EngagementRecord[];
    okrs: {
        id: string;
        name: string;
        progress: number;
    }[];
    source: 'firestore' | 'mock' | 'empty';
};
type BlueprintSummary = {
    engagements: number;
    scenariosExecuted: number;
    detectionsValidated: number;
    trrWins: number;
    trrLosses: number;
    avgCycleDays: number;
    source: 'firestore' | 'mock' | 'empty';
};
/**
 * Fetch analytics data from Firestore with optional filters
 * @param filters - Region, theatre, user, and time range filters
 * @returns Analytics data including engagement records and OKRs
 */
declare function fetchAnalytics(filters: AnalyticsFilters): Promise<AnalyticsResult>;
/**
 * Fetch summary statistics for a specific customer
 * Used for Badass Blueprint generation and customer reports
 * @param customer - Customer name to filter by
 * @param sinceDays - Number of days to look back (default 90)
 * @returns Aggregated statistics for the customer
 */
declare function fetchBlueprintSummary(customer: string, sinceDays?: number): Promise<BlueprintSummary>;
/**
 * Fetch engagement records for a specific user
 * @param userId - User identifier
 * @param sinceDays - Number of days to look back
 * @returns User's engagement records
 */
declare function fetchUserEngagements(userId: string, sinceDays?: number): Promise<EngagementRecord[]>;
/**
 * Fetch engagement records for a specific region
 * @param region - Region code (AMER, EMEA, APJ, GLOBAL)
 * @param sinceDays - Number of days to look back
 * @returns Region's engagement records
 */
declare function fetchRegionEngagements(region: string, sinceDays?: number): Promise<EngagementRecord[]>;
/**
 * Calculate win rate from engagement records
 * @param records - Engagement records to analyze
 * @returns Win rate as percentage (0-100)
 */
declare function calculateWinRate(records: EngagementRecord[]): number;
/**
 * Calculate average cycle days from engagement records
 * @param records - Engagement records to analyze
 * @returns Average cycle days
 */
declare function calculateAvgCycleDays(records: EngagementRecord[]): number;

/**
 * User Management Service
 * Comprehensive service for user profile management, activity tracking,
 * settings, notifications, and organizational structure
 *
 * Migrated from henryreed.ai/hosting/lib/user-management-service.ts
 */

interface UserProfile$2 {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    role: 'user' | 'admin' | 'analyst' | 'manager';
    organizationId: string | null;
    department: string | null;
    permissions: string[];
    preferences: {
        theme: 'light' | 'dark';
        notifications: boolean;
        language: string;
    };
    metadata: {
        createdAt: any;
        lastActive: any;
        loginCount: number;
        emailVerified: boolean;
        providerData: any[];
    };
    status: 'active' | 'inactive' | 'pending' | 'suspended';
}
interface CreateUserRequest {
    email: string;
    displayName: string;
    role?: string;
    department?: string;
    organizationId?: string;
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
}
interface UpdateUserRequest {
    uid?: string;
    displayName?: string;
    department?: string;
    role?: string;
    status?: string;
    preferences?: {
        theme?: 'light' | 'dark';
        notifications?: boolean;
        language?: string;
    };
}
interface UserActivity$1 {
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details: any;
    timestamp: any;
}
interface UserSettings {
    userId: string;
    dashboard: {
        layout: string;
        widgets: string[];
    };
    notifications: {
        email: boolean;
        browser: boolean;
        mobile: boolean;
        frequency: string;
    };
    security: {
        twoFactorEnabled: boolean;
        sessionTimeout: number;
    };
    createdAt: any;
}
declare class UserManagementService {
    private createUserProfileFn;
    private updateUserProfileFn;
    /**
     * Create a new user profile
     */
    createUser(userData: CreateUserRequest): Promise<{
        success: boolean;
        profile?: UserProfile$2;
        error?: string;
    }>;
    /**
     * Update user profile
     */
    updateUser(updates: UpdateUserRequest): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Get user profile by UID
     */
    getUserProfile(uid: string): Promise<UserProfile$2 | null>;
    /**
     * Get all users with optional filters
     */
    getUsers(filters?: {
        role?: string;
        status?: string;
        organizationId?: string;
        limit?: number;
    }): Promise<UserProfile$2[]>;
    /**
     * Subscribe to users collection changes
     */
    subscribeToUsers(callback: (users: UserProfile$2[]) => void, filters?: {
        role?: string;
        status?: string;
        organizationId?: string;
        limit?: number;
    }): Unsubscribe;
    /**
     * Get user activity logs
     */
    getUserActivity(userId?: string, limitCount?: number): Promise<UserActivity$1[]>;
    /**
     * Subscribe to activity logs
     */
    subscribeToActivity(callback: (activities: UserActivity$1[]) => void, userId?: string, limitCount?: number): Unsubscribe;
    /**
     * Log user activity
     */
    logActivity(activity: Omit<UserActivity$1, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Get user settings
     */
    getUserSettings(userId: string): Promise<UserSettings | null>;
    /**
     * Update user settings
     */
    updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean>;
    /**
     * Get organization members
     */
    getOrganizationMembers(organizationId: string): Promise<UserProfile$2[]>;
    /**
     * Add user to organization
     */
    addUserToOrganization(userId: string, organizationId: string): Promise<boolean>;
    /**
     * Remove user from organization
     */
    removeUserFromOrganization(userId: string, organizationId: string): Promise<boolean>;
    /**
     * Get user notifications
     */
    getUserNotifications(userId: string, limitCount?: number): Promise<any[]>;
    /**
     * Mark notification as read
     */
    markNotificationRead(notificationId: string): Promise<boolean>;
    /**
     * Create notification
     */
    createNotification(notification: {
        userId: string;
        type: string;
        title: string;
        message: string;
        data?: any;
    }): Promise<boolean>;
    /**
     * Get user statistics
     */
    getUserStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        newUsersThisWeek: number;
        usersByRole: Record<string, number>;
        usersByStatus: Record<string, number>;
    }>;
    /**
     * Bulk update users
     */
    bulkUpdateUsers(userIds: string[], updates: Partial<Pick<UserProfile$2, 'role' | 'status' | 'organizationId'>>): Promise<{
        success: number;
        failed: number;
    }>;
    /**
     * Export users data
     */
    exportUsers(filters?: {
        role?: string;
        status?: string;
        organizationId?: string;
    }): Promise<UserProfile$2[]>;
}
declare const userManagementService: UserManagementService;

/**
 * User Activity Service
 * Comprehensive service for managing user-specific features including:
 * - Note taking and management
 * - Meeting capture and scheduling
 * - Activity timeline tracking
 * - User preferences and settings
 * - POV progress tracking
 *
 * Migrated from henryreed.ai/hosting/lib/user-activity-service.ts
 */
interface UserNote {
    id: string;
    title: string;
    content: string;
    type: 'general' | 'meeting' | 'pov' | 'scenario' | 'customer';
    associatedId?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    pinned: boolean;
    archived: boolean;
    author: string;
}
interface MeetingCapture {
    id: string;
    title: string;
    type: 'demo' | 'follow-up' | 'planning' | 'review' | 'customer' | 'internal';
    participants: string[];
    scheduledAt: string;
    duration?: number;
    location?: string;
    meetingLink?: string;
    agenda: string[];
    notes: string;
    actionItems: ActionItem[];
    recordings?: string[];
    attachments?: string[];
    relatedPOV?: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}
interface ActionItem {
    id: string;
    description: string;
    assignee: string;
    dueDate?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in-progress' | 'done' | 'blocked';
    createdAt: string;
    completedAt?: string;
}
interface TimelineEvent$1 {
    id: string;
    type: 'pov-created' | 'pov-updated' | 'meeting' | 'note' | 'scenario-generated' | 'customer-interaction' | 'milestone' | 'action-item';
    title: string;
    description: string;
    timestamp: string;
    associatedId?: string;
    metadata: Record<string, any>;
    priority: 'low' | 'medium' | 'high';
    category: 'pov' | 'customer' | 'technical' | 'administrative';
    author: string;
}
interface UserPreferences {
    userId: string;
    theme: 'dark' | 'light' | 'auto';
    notifications: {
        email: boolean;
        inApp: boolean;
        meetingReminders: boolean;
        povUpdates: boolean;
        actionItemDues: boolean;
    };
    defaultView: 'dashboard' | 'timeline' | 'pov-list' | 'content-library';
    timeZone: string;
    dateFormat: string;
    autoSaveInterval: number;
    favoriteCommands: string[];
    customTags: string[];
    updatedAt: string;
}
interface UserActivity {
    userId: string;
    sessionId: string;
    action: string;
    component: string;
    metadata: Record<string, any>;
    timestamp: string;
    duration?: number;
}
declare class UserActivityService {
    private currentUser;
    private sessionId;
    createNote(note: Omit<UserNote, 'id' | 'createdAt' | 'updatedAt' | 'author'>): Promise<UserNote>;
    updateNote(noteId: string, updates: Partial<UserNote>): Promise<UserNote | null>;
    getNotes(filters?: {
        type?: UserNote['type'];
        tags?: string[];
        pinned?: boolean;
        archived?: boolean;
        search?: string;
    }): UserNote[];
    deleteNote(noteId: string): Promise<boolean>;
    private saveNotes;
    scheduleMeeting(meeting: Omit<MeetingCapture, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<MeetingCapture>;
    updateMeeting(meetingId: string, updates: Partial<MeetingCapture>): Promise<MeetingCapture | null>;
    getMeetings(filters?: {
        type?: MeetingCapture['type'];
        status?: MeetingCapture['status'];
        dateRange?: {
            start: string;
            end: string;
        };
        relatedPOV?: string;
    }): MeetingCapture[];
    private saveMeetings;
    createActionItem(item: Omit<ActionItem, 'id' | 'createdAt'>): Promise<ActionItem>;
    updateActionItem(itemId: string, updates: Partial<ActionItem>): Promise<ActionItem | null>;
    getActionItems(filters?: {
        status?: ActionItem['status'];
        assignee?: string;
        priority?: ActionItem['priority'];
        overdue?: boolean;
    }): ActionItem[];
    private saveActionItems;
    addTimelineEvent(event: Omit<TimelineEvent$1, 'id' | 'timestamp' | 'author'>): TimelineEvent$1;
    getTimelineEvents(filters?: {
        type?: TimelineEvent$1['type'];
        category?: TimelineEvent$1['category'];
        dateRange?: {
            start: string;
            end: string;
        };
        associatedId?: string;
        priority?: TimelineEvent$1['priority'];
    }): TimelineEvent$1[];
    private saveTimeline;
    updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences>;
    getPreferences(): UserPreferences;
    private getDefaultPreferences;
    trackActivity(action: string, component: string, metadata?: Record<string, any>): void;
    getActivities(limit?: number): UserActivity[];
    getInsights(): {
        totalNotes: number;
        totalMeetings: number;
        pendingActionItems: number;
        recentActivity: number;
        productivityScore: number;
        trendsLastWeek: Record<string, number>;
    };
    exportUserData(): {
        notes: UserNote[];
        meetings: MeetingCapture[];
        timeline: TimelineEvent$1[];
        actionItems: ActionItem[];
        preferences: UserPreferences;
        exportedAt: string;
    };
    importUserData(data: any): Promise<boolean>;
    clearAllData(): void;
}
declare const userActivityService: UserActivityService;

/**
 * Role-Based Access Control (RBAC) Middleware
 * Provides role-based data filtering and access control for DC operations
 *
 * Migrated from henryreed.ai/hosting/lib/rbac-middleware.ts
 */
interface DataScope {
    canViewAllUsers: boolean;
    canViewAllPOVs: boolean;
    canViewAllTRRs: boolean;
    canModifySystemSettings: boolean;
    allowedCustomers: string[] | 'all';
    allowedProjects: string[] | 'all';
}
interface Permission {
    resource: string;
    actions: string[];
}
interface QueryFilter {
    where?: any;
    include?: any;
    select?: any;
}
interface RBACContext {
    userId: string;
    userRole: string;
    userTeam?: string;
    assignedProjects?: string[];
    assignedCustomers?: string[];
}
interface RBACEvent {
    timestamp: string;
    userId: string;
    userRole: string;
    action: string;
    resource: string;
    allowed: boolean;
    reason?: string;
}
declare class RBACMiddleware {
    /**
     * Apply role-based filtering to database queries
     */
    static filterQuery(context: RBACContext, baseQuery?: QueryFilter): QueryFilter;
    /**
     * Check if user has permission to perform an action on a resource
     */
    static canAccessResource(userRole: string, resource: string, action: string, context?: {
        ownerId?: string;
        userId?: string;
    }): boolean;
    /**
     * Filter data based on user's role and assignments
     */
    static filterData<T extends {
        id: string;
        assignedUserId?: string;
        createdBy?: string;
        ownerId?: string;
    }>(data: T[], context: RBACContext): T[];
    /**
     * Apply RBAC filtering to command execution
     */
    static filterCommand(command: string, userRole: string, userId: string): string;
    /**
     * Get user's effective permissions summary
     */
    static getUserPermissions(userRole: string): {
        canView: string[];
        canCreate: string[];
        canUpdate: string[];
        canDelete: string[];
    };
    /**
     * Audit log for RBAC events
     */
    static logRBACEvent(event: {
        userId: string;
        userRole: string;
        action: string;
        resource: string;
        allowed: boolean;
        reason?: string;
    }): void;
    private static isOwnerOrAssigned;
    private static isUserAssignedToItem;
}

/**
 * DC Context Store - Migrated from henryreed.ai
 *
 * Manages user-specific workflow data and state:
 * - Customer engagements
 * - Active POVs
 * - TRR records
 * - Workflow history
 * - AI insights
 *
 * Integrates with GUI components and persists workflow context in localStorage
 */
interface UserProfile$1 {
    id: string;
    name: string;
    email: string;
    role: 'dc' | 'se' | 'manager';
    region: 'AMER' | 'EMEA' | 'APJ';
    specializations: string[];
    createdAt: string;
    lastActive: string;
}
interface CustomerEngagement {
    id: string;
    ownerId?: string;
    name: string;
    industry: string;
    size: 'startup' | 'smb' | 'mid-market' | 'enterprise';
    maturityLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
    primaryConcerns: string[];
    techStack: string[];
    stakeholders: {
        name: string;
        role: string;
        influence: 'high' | 'medium' | 'low';
        technical: boolean;
    }[];
    timeline: {
        startDate: string;
        targetDecision: string;
        keyMilestones: {
            name: string;
            date: string;
            status: 'pending' | 'complete' | 'at-risk';
        }[];
    };
    budget: {
        range: string;
        decisionMaker: string;
        approvalProcess: string;
    };
    competition: string[];
    notes: string[];
    createdAt: string;
    updatedAt: string;
}
interface ActivePOV {
    id: string;
    ownerId?: string;
    customerId: string;
    name: string;
    status: 'planning' | 'executing' | 'completed' | 'on-hold';
    scenarios: {
        id: string;
        name: string;
        type: string;
        status: 'planned' | 'deployed' | 'validated' | 'completed';
        results?: string;
        customerFeedback?: string;
    }[];
    objectives: string[];
    successMetrics: string[];
    timeline: {
        planned: string;
        actual?: string;
        milestones: {
            name: string;
            planned: string;
            actual?: string;
        }[];
    };
    resources: {
        dcHours: number;
        seHours: number;
        infrastructure: string[];
    };
    outcomes: {
        technicalWins: string[];
        businessImpact: string[];
        lessonsLearned: string[];
    };
    nextSteps: string[];
    aiInsights?: AIWorkflowInsight[];
    createdAt: string;
    updatedAt: string;
}
interface TRRRecord {
    id: string;
    ownerId?: string;
    customerId: string;
    povId?: string;
    title: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'draft' | 'pending' | 'in-review' | 'validated' | 'failed' | 'blocked';
    description: string;
    acceptanceCriteria: string[];
    validationMethod: string;
    validationEvidence?: string[];
    assignedTo: string;
    reviewers: string[];
    timeline: {
        created: string;
        targetValidation: string;
        actualValidation?: string;
    };
    dependencies: string[];
    riskLevel: 'low' | 'medium' | 'high';
    businessImpact: string;
    customerStakeholder: string;
    notes: string[];
    aiInsights?: AIWorkflowInsight[];
    createdAt: string;
    updatedAt: string;
}
interface WorkflowHistory {
    id: string;
    userId: string;
    workflowType: string;
    action: string;
    context: any;
    aiRecommendations?: any;
    outcome: string;
    duration: number;
    timestamp: string;
}
interface AIWorkflowInsight {
    id: string;
    type: 'scenario_recommendation' | 'validation_summary' | 'executive_briefing' | 'engagement_update' | 'general';
    source: 'gemini' | 'manual' | 'system';
    title?: string;
    content: string;
    confidence?: number;
    createdAt: string;
    metadata?: Record<string, any>;
}
/**
 * DC Context Store
 *
 * Singleton store for managing DC workflow state with localStorage persistence
 */
declare class DCContextStore {
    private static instance;
    private data;
    private constructor();
    static getInstance(): DCContextStore;
    private loadFromStorage;
    private saveToStorage;
    setCurrentUser(user: UserProfile$1): void;
    getCurrentUser(): UserProfile$1 | null;
    addCustomerEngagement(engagement: CustomerEngagement): void;
    replaceCustomerEngagements(engagements: CustomerEngagement[]): void;
    getCustomerEngagement(id: string): CustomerEngagement | undefined;
    getAllCustomerEngagements(): CustomerEngagement[];
    updateCustomerEngagement(id: string, updates: Partial<CustomerEngagement>): void;
    addActivePOV(pov: ActivePOV): void;
    replaceActivePOVs(povs: ActivePOV[]): void;
    getActivePOV(id: string): ActivePOV | undefined;
    getAllActivePOVs(): ActivePOV[];
    updateActivePOV(id: string, updates: Partial<ActivePOV>): void;
    recordPOVInsight(id: string, insight: AIWorkflowInsight): ActivePOV | undefined;
    addTRRRecord(trr: TRRRecord): void;
    replaceTRRRecords(trrs: TRRRecord[]): void;
    getTRRRecord(id: string): TRRRecord | undefined;
    getAllTRRRecords(): TRRRecord[];
    getTRRsByCustomer(customerId: string): TRRRecord[];
    getTRRsByPOV(povId: string): TRRRecord[];
    updateTRRRecord(id: string, updates: Partial<TRRRecord>): void;
    recordTRRInsight(id: string, insight: AIWorkflowInsight): TRRRecord | undefined;
    addWorkflowHistory(entry: Omit<WorkflowHistory, 'id' | 'timestamp'>): void;
    getWorkflowHistory(userId?: string, workflowType?: string): WorkflowHistory[];
    getCurrentWorkflowContext(): {
        activeCustomers: number;
        activePOVs: number;
        pendingTRRs: number;
        recentActivity: WorkflowHistory[];
        upcomingMilestones: {
            name: string;
            date: string;
            type: string;
        }[];
    };
    seedStarterDataForUser(user: UserProfile$1): {
        seeded: boolean;
        customer?: undefined;
        pov?: undefined;
        trrs?: undefined;
    } | {
        seeded: boolean;
        customer: CustomerEngagement;
        pov: ActivePOV;
        trrs: TRRRecord[];
    };
}
declare const dcContextStore: DCContextStore;

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
    createdAt: Date;
    id: string;
    email: string;
    updatedAt: Date;
    name: string;
}, {
    role: "admin" | "user";
    createdAt: Date;
    id: string;
    email: string;
    updatedAt: Date;
    name: string;
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
            defaultView?: string | undefined;
            layout?: "grid" | "list" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        dashboard: {
            layout: "grid" | "list";
            defaultView?: string | undefined;
        };
        notifications: {
            email: boolean;
            inApp: boolean;
            desktop: boolean;
        };
        theme: "light" | "dark" | "system";
    }, {
        dashboard?: {
            defaultView?: string | undefined;
            layout?: "grid" | "list" | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            inApp?: boolean | undefined;
            desktop?: boolean | undefined;
        } | undefined;
        theme?: "light" | "dark" | "system" | undefined;
    }>>;
    permissions: z.ZodObject<{
        povManagement: z.ZodDefault<z.ZodObject<{
            create: z.ZodDefault<z.ZodBoolean>;
            edit: z.ZodDefault<z.ZodBoolean>;
            delete: z.ZodDefault<z.ZodBoolean>;
            viewAll: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            create: boolean;
            delete: boolean;
            edit: boolean;
            viewAll: boolean;
        }, {
            create?: boolean | undefined;
            delete?: boolean | undefined;
            edit?: boolean | undefined;
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
            delete: boolean;
            edit: boolean;
            viewAll: boolean;
            approve: boolean;
        }, {
            create?: boolean | undefined;
            delete?: boolean | undefined;
            edit?: boolean | undefined;
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
            delete: boolean;
            edit: boolean;
            view: boolean;
        }, {
            create?: boolean | undefined;
            delete?: boolean | undefined;
            edit?: boolean | undefined;
            view?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        povManagement: {
            create: boolean;
            delete: boolean;
            edit: boolean;
            viewAll: boolean;
        };
        trrManagement: {
            create: boolean;
            delete: boolean;
            edit: boolean;
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
            delete: boolean;
            edit: boolean;
            view: boolean;
        };
    }, {
        povManagement?: {
            create?: boolean | undefined;
            delete?: boolean | undefined;
            edit?: boolean | undefined;
            viewAll?: boolean | undefined;
        } | undefined;
        trrManagement?: {
            create?: boolean | undefined;
            delete?: boolean | undefined;
            edit?: boolean | undefined;
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
            delete?: boolean | undefined;
            edit?: boolean | undefined;
            view?: boolean | undefined;
        } | undefined;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastLoginAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    role: UserRole;
    createdAt: Date;
    status: UserStatus;
    uid: string;
    email: string;
    displayName: string;
    permissions: {
        povManagement: {
            create: boolean;
            delete: boolean;
            edit: boolean;
            viewAll: boolean;
        };
        trrManagement: {
            create: boolean;
            delete: boolean;
            edit: boolean;
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
            delete: boolean;
            edit: boolean;
            view: boolean;
        };
    };
    preferences: {
        dashboard: {
            layout: "grid" | "list";
            defaultView?: string | undefined;
        };
        notifications: {
            email: boolean;
            inApp: boolean;
            desktop: boolean;
        };
        theme: "light" | "dark" | "system";
    };
    updatedAt: Date;
    teams: string[];
    manager?: string | undefined;
    title?: string | undefined;
    department?: string | undefined;
    lastLoginAt?: Date | undefined;
}, {
    role: UserRole;
    createdAt: Date;
    status: UserStatus;
    uid: string;
    email: string;
    displayName: string;
    permissions: {
        povManagement?: {
            create?: boolean | undefined;
            delete?: boolean | undefined;
            edit?: boolean | undefined;
            viewAll?: boolean | undefined;
        } | undefined;
        trrManagement?: {
            create?: boolean | undefined;
            delete?: boolean | undefined;
            edit?: boolean | undefined;
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
            delete?: boolean | undefined;
            edit?: boolean | undefined;
            view?: boolean | undefined;
        } | undefined;
    };
    updatedAt: Date;
    manager?: string | undefined;
    title?: string | undefined;
    department?: string | undefined;
    preferences?: {
        dashboard?: {
            defaultView?: string | undefined;
            layout?: "grid" | "list" | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            inApp?: boolean | undefined;
            desktop?: boolean | undefined;
        } | undefined;
        theme?: "light" | "dark" | "system" | undefined;
    } | undefined;
    teams?: string[] | undefined;
    lastLoginAt?: Date | undefined;
}>;
type UserProfile = z.infer<typeof UserProfileSchema>;
/**
 * Permission Groups
 * Define what each role can access by default
 */
declare const ROLE_PERMISSIONS: Record<UserRole, Partial<UserProfile['permissions']>>;

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
    createdAt: Date;
    timestamp: Date;
    id: string;
    type: "project_created" | "project_updated" | "project_completed" | "pov_created" | "pov_phase_completed" | "pov_completed" | "trr_created" | "trr_submitted" | "trr_approved" | "task_created" | "task_completed" | "milestone_reached" | "note_added" | "team_member_added" | "status_changed";
    title: string;
    actor: string;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    projectId?: string | undefined;
    povId?: string | undefined;
    trrId?: string | undefined;
    taskId?: string | undefined;
}, {
    createdAt: Date;
    timestamp: Date;
    id: string;
    type: "project_created" | "project_updated" | "project_completed" | "pov_created" | "pov_phase_completed" | "pov_completed" | "trr_created" | "trr_submitted" | "trr_approved" | "task_created" | "task_completed" | "milestone_reached" | "note_added" | "team_member_added" | "status_changed";
    title: string;
    actor: string;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    projectId?: string | undefined;
    povId?: string | undefined;
    trrId?: string | undefined;
    taskId?: string | undefined;
}>;
type TimelineEvent = z.infer<typeof TimelineEventSchema>;

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

export { type AnalyticsFilters, type AnalyticsResult, type AuthCredentials, type AuthResult, type AuthUser, type BlueprintSummary, CHAT_COLLECTION, type ChatSchema, ChatValidationRules, type CreateUserRequest, type DataScope, type DatabaseClient, type EngagementRecord, FirestoreClient, FirestoreQueries, type Permission, type QueryFilter, type QueryResult, type RBACContext, type RBACEvent, RBACMiddleware, ROLE_PERMISSIONS, type TimelineEvent, type TransactionContext, USER_COLLECTION, type UpdateUserRequest, type User, type UserActivity$1 as UserActivity, UserManagementService, type UserProfile, UserRole, UserSchema, type UserSettings, UserValidationRules, firebaseApp as app, auth, authService, calculateAvgCycleDays, calculateWinRate, db, dcContextStore, fetchAnalytics, fetchBlueprintSummary, fetchRegionEngagements, fetchUserEngagements, firebaseApp, forceReconnectEmulators, functions, getFirebaseConfig, isMockAuthMode, storage, useEmulator, userActivityService, userManagementService };
