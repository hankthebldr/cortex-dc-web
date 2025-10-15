import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore, Unsubscribe } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Functions } from 'firebase/functions';
import { z } from 'zod';
import { EventEmitter } from 'events';

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

interface AuthUser$1 {
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
interface AuthResult$1 {
    success: boolean;
    user?: AuthUser$1;
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
    authenticate(credentials: AuthCredentials): Promise<AuthResult$1>;
    /**
     * Check if user is currently authenticated
     * @returns True if user has valid session
     */
    isAuthenticated(): boolean;
    /**
     * Get current authenticated user
     * @returns User object or null if not authenticated
     */
    getCurrentUser(): AuthUser$1 | null;
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
 *
 * MIGRATION NOTE: This service now supports both Firebase Functions and REST API
 * - In Firebase mode: Uses httpsCallable for createUserProfile/updateUserProfile
 * - In self-hosted mode: Uses REST API endpoints
 *
 * Mode is determined by DEPLOYMENT_MODE or NEXT_PUBLIC_DEPLOYMENT_MODE environment variable
 */

interface UserProfile$3 {
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
interface CreateUserRequest$1 {
    email: string;
    displayName: string;
    role?: string;
    department?: string;
    organizationId?: string;
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
}
interface UpdateUserRequest$1 {
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
    private apiClient;
    /**
     * Get deployment mode
     */
    private getDeploymentMode;
    /**
     * Get API client (lazy load)
     */
    private getApiClient;
    /**
     * Create a new user profile
     * Uses Firebase Functions in Firebase mode, REST API in self-hosted mode
     */
    createUser(userData: CreateUserRequest$1): Promise<{
        success: boolean;
        profile?: UserProfile$3;
        error?: string;
    }>;
    /**
     * Update user profile
     * Uses Firebase Functions in Firebase mode, REST API in self-hosted mode
     */
    updateUser(updates: UpdateUserRequest$1): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Get user profile by UID
     */
    getUserProfile(uid: string): Promise<UserProfile$3 | null>;
    /**
     * Get all users with optional filters
     */
    getUsers(filters?: {
        role?: string;
        status?: string;
        organizationId?: string;
        limit?: number;
    }): Promise<UserProfile$3[]>;
    /**
     * Subscribe to users collection changes
     */
    subscribeToUsers(callback: (users: UserProfile$3[]) => void, filters?: {
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
    getOrganizationMembers(organizationId: string): Promise<UserProfile$3[]>;
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
    bulkUpdateUsers(userIds: string[], updates: Partial<Pick<UserProfile$3, 'role' | 'status' | 'organizationId'>>): Promise<{
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
    }): Promise<UserProfile$3[]>;
}
declare const userManagementService: UserManagementService;

/**
 * User Management API Client
 * Replaces Firebase Functions with REST API calls
 * Works with both Firebase and self-hosted deployments
 */
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
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    profile?: T;
    error?: string;
}
/**
 * User Management API Client Class
 */
declare class UserManagementApiClient {
    /**
     * Create a new user profile
     */
    createUser(userData: CreateUserRequest): Promise<ApiResponse<UserProfile$2>>;
    /**
     * Update user profile
     */
    updateUser(userId: string, updates: UpdateUserRequest): Promise<ApiResponse<UserProfile$2>>;
    /**
     * Get user profile by ID
     */
    getUserProfile(userId: string): Promise<UserProfile$2 | null>;
    /**
     * Get current user profile
     */
    getCurrentUser(): Promise<UserProfile$2 | null>;
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
     * Delete user
     */
    deleteUser(userId: string): Promise<boolean>;
    /**
     * Bulk update users
     */
    bulkUpdateUsers(userIds: string[], updates: Partial<Pick<UserProfile$2, 'role' | 'status' | 'organizationId'>>): Promise<{
        success: number;
        failed: number;
    }>;
    /**
     * Get organization members
     */
    getOrganizationMembers(organizationId: string): Promise<UserProfile$2[]>;
    /**
     * Export users data
     */
    exportUsers(filters?: {
        role?: string;
        status?: string;
        organizationId?: string;
    }): Promise<UserProfile$2[]>;
}
declare const userManagementApiClient: UserManagementApiClient;

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
interface QueryFilter$1 {
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
    static filterQuery(context: RBACContext, baseQuery?: QueryFilter$1): QueryFilter$1;
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

/**
 * Database Validation Service
 * Validates that database operations are correctly migrated
 * and working across Firebase and self-hosted modes
 */
interface ValidationResult$1 {
    passed: boolean;
    test: string;
    duration: number;
    error?: string;
    details?: any;
}
interface ValidationReport {
    overall: 'passed' | 'failed' | 'partial';
    timestamp: Date;
    mode: 'firebase' | 'self-hosted';
    results: ValidationResult$1[];
    summary: {
        total: number;
        passed: number;
        failed: number;
        duration: number;
    };
}
declare class DatabaseValidationService {
    /**
     * Run comprehensive database validation tests
     */
    validate(): Promise<ValidationReport>;
    /**
     * Test database connection
     */
    private testDatabaseConnection;
    /**
     * Test CRUD operations
     */
    private testCRUDOperations;
    /**
     * Test query operations
     */
    private testQueryOperations;
    /**
     * Test transaction support
     */
    private testTransactions;
    /**
     * Test storage operations
     */
    private testStorageOperations;
    /**
     * Test relationship integrity
     */
    private testRelationshipIntegrity;
    /**
     * Quick health check (subset of full validation)
     */
    healthCheck(): Promise<{
        healthy: boolean;
        details: any;
    }>;
}
declare const databaseValidationService: DatabaseValidationService;

/**
 * Analytics Service
 * Provides analytics for both user space and admin space
 * Tracks POV/TRR activity, user engagement, and system metrics
 */
interface UserAnalytics {
    userId: string;
    period: 'week' | 'month' | 'quarter' | 'year';
    metrics: {
        totalPOVs: number;
        activePOVs: number;
        completedPOVs: number;
        totalTRRs: number;
        completedTRRs: number;
        totalProjects: number;
        activeProjects: number;
        hoursLogged: number;
        tasksCompleted: number;
        collaborations: number;
    };
    trends: {
        povsCreated: number[];
        trrsSubmitted: number[];
        activityScore: number[];
        dates: string[];
    };
    topProjects: Array<{
        id: string;
        title: string;
        status: string;
        lastActivity: Date;
    }>;
    recentActivity: Array<{
        id: string;
        type: string;
        action: string;
        timestamp: Date;
        entityTitle: string;
    }>;
}
interface AdminAnalytics {
    period: 'week' | 'month' | 'quarter' | 'year';
    systemMetrics: {
        totalUsers: number;
        activeUsers: number;
        newUsers: number;
        totalPOVs: number;
        activePOVs: number;
        totalTRRs: number;
        pendingTRRs: number;
        totalProjects: number;
        activeProjects: number;
        storageUsed: number;
        apiCalls: number;
    };
    performance: {
        avgResponseTime: number;
        errorRate: number;
        uptime: number;
    };
    userEngagement: {
        dailyActiveUsers: number[];
        weeklyActiveUsers: number[];
        dates: string[];
    };
    projectHealth: {
        good: number;
        warning: number;
        atRisk: number;
    };
    topUsers: Array<{
        userId: string;
        displayName: string;
        povsCreated: number;
        trrsCompleted: number;
        activityScore: number;
    }>;
    trendsOverTime: {
        povsPerWeek: number[];
        trrsPerWeek: number[];
        projectsPerWeek: number[];
        dates: string[];
    };
}
declare class AnalyticsService {
    /**
     * Get user-specific analytics
     */
    getUserAnalytics(userId: string, period?: 'week' | 'month' | 'quarter' | 'year'): Promise<UserAnalytics>;
    /**
     * Get admin-level analytics
     */
    getAdminAnalytics(period?: 'week' | 'month' | 'quarter' | 'year'): Promise<AdminAnalytics>;
    /**
     * Get recent activity for a user
     */
    private getUserRecentActivity;
    /**
     * Get top performing users
     */
    private getTopUsers;
    /**
     * Calculate trends for a period
     */
    private calculateTrends;
    /**
     * Calculate system-wide trends
     */
    private calculateSystemTrends;
    /**
     * Calculate user engagement metrics
     */
    private calculateUserEngagement;
    /**
     * Calculate project health score
     */
    private calculateProjectHealth;
    /**
     * Get period date range
     */
    private getPeriodDates;
    /**
     * Get time intervals for a period
     */
    private getIntervals;
    /**
     * Get interval index for a date
     */
    private getIntervalIndex;
}
declare const analyticsService: AnalyticsService;

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
        status: "in_progress" | "completed" | "pending" | "failed";
        id: string;
        description: string;
        success_criteria: string;
        weight: number;
    }, {
        status: "in_progress" | "completed" | "pending" | "failed";
        id: string;
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
                status: "in_progress" | "completed" | "upcoming" | "overdue";
                id: string;
                title: string;
                date: Date;
            }, {
                status: "in_progress" | "completed" | "upcoming" | "overdue";
                id: string;
                title: string;
                date: Date;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            start: Date;
            end: Date;
            milestones: {
                status: "in_progress" | "completed" | "upcoming" | "overdue";
                id: string;
                title: string;
                date: Date;
            }[];
        }, {
            start: Date;
            end: Date;
            milestones: {
                status: "in_progress" | "completed" | "upcoming" | "overdue";
                id: string;
                title: string;
                date: Date;
            }[];
        }>;
        resources: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["personnel", "equipment", "software", "budget"]>;
            description: z.ZodString;
            quantity: z.ZodOptional<z.ZodNumber>;
            cost: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "budget" | "personnel" | "equipment" | "software";
            description: string;
            quantity?: number | undefined;
            cost?: number | undefined;
        }, {
            type: "budget" | "personnel" | "equipment" | "software";
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
                status: "in_progress" | "completed" | "upcoming" | "overdue";
                id: string;
                title: string;
                date: Date;
            }[];
        };
        resources: {
            type: "budget" | "personnel" | "equipment" | "software";
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
                status: "in_progress" | "completed" | "upcoming" | "overdue";
                id: string;
                title: string;
                date: Date;
            }[];
        };
        environment?: string | undefined;
        resources?: {
            type: "budget" | "personnel" | "equipment" | "software";
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
        status: TaskStatus;
        id: string;
        name: string;
        startDate: Date;
        tasks: string[];
        description?: string | undefined;
        endDate?: Date | undefined;
    }, {
        status: TaskStatus;
        id: string;
        name: string;
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
    createdAt: Date;
    priority: Priority;
    status: POVStatus;
    id: string;
    updatedAt: Date;
    title: string;
    description: string;
    projectId: string;
    createdBy: string;
    objectives: {
        status: "in_progress" | "completed" | "pending" | "failed";
        id: string;
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
    owner: string;
    team: string[];
    lastModifiedBy: string;
    phases: {
        status: TaskStatus;
        id: string;
        name: string;
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
                status: "in_progress" | "completed" | "upcoming" | "overdue";
                id: string;
                title: string;
                date: Date;
            }[];
        };
        resources: {
            type: "budget" | "personnel" | "equipment" | "software";
            description: string;
            quantity?: number | undefined;
            cost?: number | undefined;
        }[];
        environment?: string | undefined;
    } | undefined;
}, {
    createdAt: Date;
    priority: Priority;
    status: POVStatus;
    id: string;
    updatedAt: Date;
    title: string;
    description: string;
    projectId: string;
    createdBy: string;
    owner: string;
    lastModifiedBy: string;
    objectives?: {
        status: "in_progress" | "completed" | "pending" | "failed";
        id: string;
        description: string;
        success_criteria: string;
        weight?: number | undefined;
    }[] | undefined;
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
    team?: string[] | undefined;
    testPlan?: {
        scenarios: string[];
        timeline: {
            start: Date;
            end: Date;
            milestones: {
                status: "in_progress" | "completed" | "upcoming" | "overdue";
                id: string;
                title: string;
                date: Date;
            }[];
        };
        environment?: string | undefined;
        resources?: {
            type: "budget" | "personnel" | "equipment" | "software";
            description: string;
            quantity?: number | undefined;
            cost?: number | undefined;
        }[] | undefined;
    } | undefined;
    phases?: {
        status: TaskStatus;
        id: string;
        name: string;
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
            type: "document" | "screenshot" | "log" | "test_result";
            url: string;
            description?: string | undefined;
        }, {
            type: "document" | "screenshot" | "log" | "test_result";
            url: string;
            description?: string | undefined;
        }>, "many">>;
        recommendation: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<["open", "addressed", "accepted_risk", "false_positive"]>;
    }, "strip", z.ZodTypeAny, {
        status: "open" | "addressed" | "accepted_risk" | "false_positive";
        id: string;
        title: string;
        description: string;
        category: string;
        evidence: {
            type: "document" | "screenshot" | "log" | "test_result";
            url: string;
            description?: string | undefined;
        }[];
        severity: "low" | "medium" | "high" | "critical";
        recommendation?: string | undefined;
    }, {
        status: "open" | "addressed" | "accepted_risk" | "false_positive";
        id: string;
        title: string;
        description: string;
        category: string;
        severity: "low" | "medium" | "high" | "critical";
        evidence?: {
            type: "document" | "screenshot" | "log" | "test_result";
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
    createdAt: Date;
    priority: Priority;
    status: TRRStatus;
    id: string;
    updatedAt: Date;
    title: string;
    description: string;
    projectId: string;
    createdBy: string;
    reviewers: string[];
    owner: string;
    lastModifiedBy: string;
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
        status: "open" | "addressed" | "accepted_risk" | "false_positive";
        id: string;
        title: string;
        description: string;
        category: string;
        evidence: {
            type: "document" | "screenshot" | "log" | "test_result";
            url: string;
            description?: string | undefined;
        }[];
        severity: "low" | "medium" | "high" | "critical";
        recommendation?: string | undefined;
    }[];
    povId?: string | undefined;
    validation?: {
        approved?: boolean | undefined;
        validator?: string | undefined;
        validatedAt?: Date | undefined;
        validationNotes?: string | undefined;
    } | undefined;
    signoff?: {
        approver?: string | undefined;
        approvedAt?: Date | undefined;
        signoffNotes?: string | undefined;
        digitalSignature?: string | undefined;
    } | undefined;
}, {
    createdAt: Date;
    priority: Priority;
    status: TRRStatus;
    id: string;
    updatedAt: Date;
    title: string;
    description: string;
    projectId: string;
    createdBy: string;
    owner: string;
    lastModifiedBy: string;
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
    povId?: string | undefined;
    reviewers?: string[] | undefined;
    validation?: {
        approved?: boolean | undefined;
        validator?: string | undefined;
        validatedAt?: Date | undefined;
        validationNotes?: string | undefined;
    } | undefined;
    findings?: {
        status: "open" | "addressed" | "accepted_risk" | "false_positive";
        id: string;
        title: string;
        description: string;
        category: string;
        severity: "low" | "medium" | "high" | "critical";
        evidence?: {
            type: "document" | "screenshot" | "log" | "test_result";
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
}>;
type TRR = z.infer<typeof TRRSchema>;
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
    id: string;
    title: string;
    type: "project_created" | "project_updated" | "project_completed" | "pov_created" | "pov_phase_completed" | "pov_completed" | "trr_created" | "trr_submitted" | "trr_approved" | "task_created" | "task_completed" | "milestone_reached" | "note_added" | "team_member_added" | "status_changed";
    timestamp: Date;
    actor: string;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    projectId?: string | undefined;
    povId?: string | undefined;
    trrId?: string | undefined;
    taskId?: string | undefined;
}, {
    createdAt: Date;
    id: string;
    title: string;
    type: "project_created" | "project_updated" | "project_completed" | "pov_created" | "pov_phase_completed" | "pov_completed" | "trr_created" | "trr_submitted" | "trr_approved" | "task_created" | "task_completed" | "milestone_reached" | "note_added" | "team_member_added" | "status_changed";
    timestamp: Date;
    actor: string;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    projectId?: string | undefined;
    povId?: string | undefined;
    trrId?: string | undefined;
    taskId?: string | undefined;
}>;
type TimelineEvent = z.infer<typeof TimelineEventSchema>;

/**
 * Relationship Management Service
 * Manages relationships between TRRs, POVs, Projects, and Demo Scenarios
 * Ensures referential integrity and proper lifecycle management
 */

interface RelationshipValidation {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
interface RelationshipGraph {
    projectId: string;
    povs: POV[];
    trrs: TRR[];
    scenarios: any[];
    relationships: {
        povToTRR: Record<string, string[]>;
        povToScenario: Record<string, string[]>;
        trrToPOV: Record<string, string>;
        scenarioToPOV: Record<string, string>;
    };
}
declare class RelationshipManagementService {
    /**
     * Associate a TRR with a POV
     */
    associateTRRWithPOV(trrId: string, povId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Associate a POV with a Demo Scenario
     */
    associatePOVWithScenario(povId: string, scenarioId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Associate POV with Project
     */
    associatePOVWithProject(povId: string, projectId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Associate TRR with Project
     */
    associateTRRWithProject(trrId: string, projectId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Get relationship graph for a project
     */
    getProjectRelationshipGraph(projectId: string): Promise<RelationshipGraph | null>;
    /**
     * Validate relationships for integrity
     */
    validateRelationships(projectId: string): Promise<RelationshipValidation>;
    /**
     * Automatically fix broken relationships
     */
    repairRelationships(projectId: string): Promise<{
        fixed: number;
        errors: string[];
    }>;
    /**
     * Log relationship changes for audit
     */
    private logRelationshipChange;
    /**
     * Get POVs for a TRR
     */
    getPOVForTRR(trrId: string): Promise<POV | null>;
    /**
     * Get TRRs for a POV
     */
    getTRRsForPOV(povId: string): Promise<TRR[]>;
    /**
     * Get Scenarios for a POV
     */
    getScenariosForPOV(povId: string): Promise<any[]>;
}
declare const relationshipManagementService: RelationshipManagementService;

/**
 * Dynamic Record Population Service
 * Automatically creates and populates records as user flows progress
 * Handles lifecycle management for POVs, TRRs, Projects, and Scenarios
 */

interface RecordCreationOptions {
    autoPopulateDefaults?: boolean;
    createRelationships?: boolean;
    userId?: string;
}
interface LifecycleTransition {
    recordId: string;
    recordType: 'pov' | 'trr' | 'project' | 'scenario';
    from: string;
    to: string;
    triggeredBy: string;
    timestamp: Date;
    metadata?: any;
}
declare class DynamicRecordService {
    /**
     * Create a new POV with defaults and relationships
     */
    createPOV(data: Partial<POV>, projectId: string, options?: RecordCreationOptions): Promise<{
        success: boolean;
        povId?: string;
        error?: string;
    }>;
    /**
     * Create a new TRR with defaults and relationships
     */
    createTRR(data: Partial<TRR>, projectId: string, povId?: string, options?: RecordCreationOptions): Promise<{
        success: boolean;
        trrId?: string;
        error?: string;
    }>;
    /**
     * Create a new Demo Scenario
     */
    createScenario(data: any, povId?: string, options?: RecordCreationOptions): Promise<{
        success: boolean;
        scenarioId?: string;
        error?: string;
    }>;
    /**
     * Transition POV to next phase
     */
    transitionPOVPhase(povId: string, userId: string): Promise<{
        success: boolean;
        nextPhase?: string;
        error?: string;
    }>;
    /**
     * Transition TRR through workflow
     */
    transitionTRRStatus(trrId: string, newStatus: string, userId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Log lifecycle event
     */
    private logLifecycleEvent;
    /**
     * Log user activity
     */
    private logActivity;
    /**
     * Auto-populate related records when creating a POV
     */
    autoPopulatePOVRecords(povId: string, userId: string): Promise<{
        created: string[];
        errors: string[];
    }>;
    private getDatabase;
}
declare const dynamicRecordService: DynamicRecordService;

/**
 * Terraform Generation Service
 * Generates Terraform deployment configurations from scenarios
 * Enables infrastructure-as-code deployment for demo scenarios
 */
interface TerraformConfig {
    version: string;
    provider: 'gcp' | 'aws' | 'azure';
    region: string;
    projectId?: string;
    resources: TerraformResource[];
}
interface TerraformResource {
    type: string;
    name: string;
    config: Record<string, any>;
    dependencies?: string[];
}
interface ScenarioTerraformOutput {
    filename: string;
    content: string;
    format: 'hcl' | 'json';
    variables: Record<string, any>;
    outputs: Record<string, any>;
}
declare class TerraformGenerationService {
    /**
     * Generate Terraform configuration from a scenario
     */
    generateTerraformForScenario(scenarioId: string, options?: {
        provider?: 'gcp' | 'aws' | 'azure';
        format?: 'hcl' | 'json';
        includeVariables?: boolean;
        includeOutputs?: boolean;
    }): Promise<ScenarioTerraformOutput>;
    /**
     * Generate Terraform resources from scenario configuration
     */
    private generateResourcesFromScenario;
    /**
     * Generate resources from scenario step
     */
    private generateResourcesFromStep;
    /**
     * Generate HCL format Terraform configuration
     */
    private generateHCL;
    /**
     * Generate variables block in HCL
     */
    private generateVariablesHCL;
    /**
     * Generate resource block in HCL
     */
    private generateResourceHCL;
    /**
     * Format HCL value with proper indentation
     */
    private formatHCLValue;
    /**
     * Generate outputs block in HCL
     */
    private generateOutputsHCL;
    /**
     * Generate JSON format Terraform configuration
     */
    private generateJSON;
    /**
     * Extract variables from configuration
     */
    private extractVariables;
    /**
     * Generate output values
     */
    private generateOutputs;
    /**
     * Helper methods to determine required resources
     */
    private requiresGKE;
    private requiresFirestore;
    private requiresStorage;
    private requiresBigQuery;
    private requiresCloudFunctions;
    /**
     * Generate Terraform configuration as downloadable file
     */
    generateDownloadableFile(scenarioId: string, format?: 'hcl' | 'json'): Promise<{
        filename: string;
        content: Buffer;
        mimeType: string;
    }>;
}
declare const terraformGenerationService: TerraformGenerationService;

/**
 * Event Tracking Service
 * Provides comprehensive event tracking for user actions, logins, and analytics
 * Supports both Firebase Firestore and PostgreSQL backends
 */
interface ActivityLogEvent {
    userId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    entityTitle?: string;
    metadata?: Record<string, any>;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
}
interface LoginEventData {
    userId: string;
    email: string;
    loginMethod: 'email' | 'google' | 'okta_saml' | 'okta_oauth';
    success: boolean;
    failureReason?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: Record<string, any>;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;
}
interface UserSessionData {
    userId: string;
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
}
interface LoginAnalytics {
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    uniqueUsers: number;
    loginsByMethod: Record<string, number>;
    loginsByDay: Array<{
        date: string;
        count: number;
    }>;
    recentLogins: LoginEventData[];
}
interface UserActivityAnalytics {
    userId: string;
    totalActions: number;
    actionsByType: Record<string, number>;
    recentActivity: ActivityLogEvent[];
    lastActive: Date | null;
    sessionsCount: number;
}
declare class EventTrackingService {
    /**
     * Log a user activity event
     */
    logActivity(event: ActivityLogEvent): Promise<void>;
    /**
     * Log a user login event
     */
    logLogin(event: LoginEventData): Promise<void>;
    /**
     * Create or update a user session
     */
    createSession(session: UserSessionData): Promise<void>;
    /**
     * Update session activity
     */
    updateSessionActivity(sessionId: string): Promise<void>;
    /**
     * End a user session
     */
    endSession(sessionId: string): Promise<void>;
    /**
     * Get login analytics for a time period (with Redis caching)
     */
    getLoginAnalytics(startDate: Date, endDate: Date): Promise<LoginAnalytics>;
    /**
     * Get user activity analytics (with Redis caching)
     */
    getUserActivityAnalytics(userId: string): Promise<UserActivityAnalytics>;
    /**
     * Get recent activity logs for admin dashboard
     */
    getRecentActivity(limit?: number): Promise<ActivityLogEvent[]>;
    /**
     * Get active user sessions
     */
    getActiveSessions(userId?: string): Promise<any[]>;
    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions(): Promise<void>;
}
declare const eventTrackingService: EventTrackingService;

/**
 * Redis Cache Service
 * High-performance caching layer for database queries and analytics
 * Optimized for dynamic cloud applications with automatic cache invalidation
 */
interface CacheOptions {
    ttl?: number;
    prefix?: string;
}
interface CacheStats {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
}
declare class RedisCacheService {
    private client;
    private isConnected;
    private stats;
    /**
     * Initialize Redis connection
     */
    connect(): Promise<void>;
    /**
     * Disconnect from Redis
     */
    disconnect(): Promise<void>;
    /**
     * Check if Redis is connected
     */
    isReady(): boolean;
    /**
     * Get value from cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set value in cache with optional TTL
     */
    set(key: string, value: any, options?: CacheOptions): Promise<void>;
    /**
     * Delete value from cache
     */
    delete(key: string): Promise<void>;
    /**
     * Delete all keys matching a pattern
     */
    deletePattern(pattern: string): Promise<void>;
    /**
     * Get or set pattern - returns cached value or computes and caches result
     */
    getOrSet<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T>;
    /**
     * Invalidate cache by pattern (e.g., "user:*", "analytics:*")
     */
    invalidate(pattern: string): Promise<void>;
    /**
     * Clear all cache
     */
    flush(): Promise<void>;
    /**
     * Get cache statistics
     */
    getStats(): Promise<CacheStats>;
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Utility: Generate cache key with prefix
     */
    generateKey(prefix: string, ...parts: string[]): string;
}
declare const CacheKeys: {
    user: (userId: string) => string;
    userByEmail: (email: string) => string;
    userList: (filters: string) => string;
    loginAnalytics: (startDate: string, endDate: string) => string;
    userActivity: (userId: string) => string;
    adminAnalytics: (period: string) => string;
    recentActivity: (limit: number) => string;
    pov: (povId: string) => string;
    povList: (filters: string) => string;
    trr: (trrId: string) => string;
    trrList: (filters: string) => string;
    session: (sessionId: string) => string;
    userSessions: (userId: string) => string;
    activeSessions: () => string;
};
declare const CacheInvalidationPatterns: {
    user: (userId: string) => string[];
    analytics: () => string[];
    pov: (povId: string) => string[];
    trr: (trrId: string) => string[];
    sessions: (userId: string) => string[];
};
declare function getRedisCacheService(): RedisCacheService;
declare const redisCacheService: RedisCacheService;

/**
 * Optimized Record Processing Strategy for Legacy Data Migration
 * Designed for high-throughput processing on GKE with Node.js
 * Handles millions of records with parallel processing and intelligent batching
 *
 * Integrated with Cortex DC PostgreSQL and Redis caching
 */

interface ProcessingConfig {
    initialBatchSize: number;
    minBatchSize: number;
    maxBatchSize: number;
    maxParallelBatches: number;
    maxWorkersPerBatch: number;
    memoryThresholdMB: number;
    dbConnectionPoolSize: number;
    prefetchSize: number;
    maxRetries: number;
    retryBackoffMs: number[];
    errorThresholdPercent: number;
    pauseBetweenBatchesMs: number;
    healthCheckIntervalMs: number;
    progressReportIntervalMs: number;
}
declare const DEFAULT_CONFIG: ProcessingConfig;
interface StagingRecord {
    id: string;
    importJobId: string;
    rowNumber: number;
    rawData: Record<string, any>;
    transformedData: Record<string, any>;
    validationStatus: string;
    validationErrors: ValidationError[];
    processingStatus: string;
    createdAt: Date;
}
interface ValidationError {
    field: string;
    ruleId: string;
    severity: 'error' | 'warning';
    message: string;
    currentValue: any;
    suggestedValue?: any;
}
interface ImportConfiguration {
    targetTable: string;
    uniqueFields: string[];
    mappings: FieldMapping[];
    transformations: DataTransformation[];
    skipHeaders: boolean;
    conflictResolution: string;
}
interface FieldMapping {
    sourceField: string;
    targetField: string;
    targetType: string;
    required: boolean;
}
interface DataTransformation {
    id: string;
    type: string;
    order: number;
    parameters: any;
}
interface ValidationResult {
    valid: any[];
    invalid: any[];
    warnings: any[];
}
interface TransformedRecord {
    id: string;
    originalData: any;
    transformedData: any;
    timestamp: Date;
}
interface WriteResult {
    inserted: number;
    updated: number;
    failed: number;
    errors: any[];
}
interface ProcessingMetrics {
    totalProcessed: number;
    successfulRecords: number;
    failedRecords: number;
    batchesProcessed: number;
    batchErrors: number;
    averageProcessingTimeMs: number;
    errorRate: number;
    throughputRecordsPerSecond: number;
    startTime: Date;
}
interface JobResult {
    jobId: string;
    status: string;
    metrics: ProcessingMetrics;
    duration: number;
}
declare class RecordProcessingOrchestrator extends EventEmitter {
    private config;
    private metrics;
    private isPaused;
    private isHealthy;
    private healthCheckInterval;
    private progressInterval;
    constructor(config?: Partial<ProcessingConfig>);
    processImportJob(jobId: string): Promise<JobResult>;
    private processBatch;
    private adjustBatchSize;
    private shouldPauseOnErrors;
    private startHealthMonitoring;
    private startProgressReporting;
    private stopMonitoring;
    private fetchStagingRecords;
    private initializeMetrics;
    private updateMetrics;
    private finalizeJob;
    private sleep;
    private getJobConfig;
    private handleInvalidRecords;
    private updateStagingRecordsStatus;
}

/**
 * OpenSearch Service
 * Full-text search implementation for Cortex DC Platform
 *
 * Features:
 * - Full-text search across POVs, TRRs, users, and projects
 * - Fuzzy matching and autocomplete
 * - Highlighting of matching terms
 * - Aggregations and filters
 * - Auto-indexing on create/update
 *
 * @see OPENSEARCH_MEMGRAPH_INTEGRATION_GUIDE.md for setup instructions
 */
interface SearchOptions {
    query: string;
    types?: string[];
    limit?: number;
    offset?: number;
    userId?: string;
    filters?: Record<string, any>;
}
interface SearchResult {
    id: string;
    type: string;
    title: string;
    description?: string;
    metadata?: any;
    score: number;
    highlight?: any;
}
interface BulkIndexDocument {
    id: string;
    doc: any;
}
interface IndexStats {
    totalDocuments: number;
    indexSize: string;
    lastIndexed: Date | null;
}
declare class OpenSearchService {
    private client;
    private isConnected;
    private readonly indexes;
    constructor();
    /**
     * Connect to OpenSearch cluster
     */
    connect(): Promise<void>;
    /**
     * Disconnect from OpenSearch
     */
    disconnect(): Promise<void>;
    /**
     * Check if connected to OpenSearch
     */
    isReady(): boolean;
    /**
     * Create indexes with optimized settings
     */
    private createIndexes;
    /**
     * Index a single document
     */
    indexDocument(type: string, id: string, document: any): Promise<void>;
    /**
     * Bulk index multiple documents (optimized for large datasets)
     */
    bulkIndex(type: string, documents: BulkIndexDocument[]): Promise<void>;
    /**
     * Search across indexes with advanced features
     */
    search(options: SearchOptions): Promise<SearchResult[]>;
    /**
     * Update an existing document
     */
    updateDocument(type: string, id: string, doc: any): Promise<void>;
    /**
     * Delete a document from the index
     */
    deleteDocument(type: string, id: string): Promise<void>;
    /**
     * Get suggestions for autocomplete
     */
    getSuggestions(query: string, type?: string, limit?: number): Promise<string[]>;
    /**
     * Get index statistics
     */
    getIndexStats(type: string): Promise<IndexStats | null>;
    /**
     * Reindex all documents from database (useful for initial setup)
     */
    reindexAll(): Promise<void>;
    /**
     * Delete an entire index
     */
    deleteIndex(type: string): Promise<void>;
    /**
     * Format bytes to human-readable size
     */
    private formatBytes;
}
declare const openSearchService: OpenSearchService;

/**
 * Memgraph Service
 * Graph database for user interaction tracking and AI-powered recommendations
 *
 * Features:
 * - User interaction tracking (views, clicks, searches)
 * - Relationship graph between users and entities
 * - Collaborative filtering recommendations
 * - Trending entity detection
 * - User similarity analysis
 * - AI-powered recommendation engine
 *
 * @see OPENSEARCH_MEMGRAPH_INTEGRATION_GUIDE.md for setup instructions
 */
interface Interaction {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp?: Date;
    metadata?: Record<string, any>;
}
interface Recommendation {
    entityId: string;
    entityType: string;
    title?: string;
    score: number;
    reason: string;
    confidence: number;
}
interface TrendingEntity {
    entityId: string;
    entityType: string;
    interactionCount: number;
    uniqueUsers: number;
    trendScore: number;
}
interface UserSimilarity {
    userId: string;
    similarityScore: number;
    commonInterests: number;
}
interface InteractionStats {
    totalInteractions: number;
    uniqueUsers: number;
    uniqueEntities: number;
    topActions: Array<{
        action: string;
        count: number;
    }>;
    activityByDay: Array<{
        date: string;
        count: number;
    }>;
}
declare class MemgraphService {
    private driver;
    private isConnected;
    constructor();
    /**
     * Connect to Memgraph database
     */
    connect(): Promise<void>;
    /**
     * Disconnect from Memgraph
     */
    disconnect(): Promise<void>;
    /**
     * Check if connected to Memgraph
     */
    isReady(): boolean;
    /**
     * Get a database session
     */
    private getSession;
    /**
     * Create database constraints and indexes
     */
    private createConstraintsAndIndexes;
    /**
     * Track a user interaction
     */
    trackInteraction(interaction: Interaction): Promise<void>;
    /**
     * Get personalized recommendations for a user
     * Uses collaborative filtering based on similar users' interactions
     */
    getRecommendations(userId: string, limit?: number): Promise<Recommendation[]>;
    /**
     * Get trending entities based on recent interactions
     */
    getTrending(entityType?: string, days?: number, limit?: number): Promise<TrendingEntity[]>;
    /**
     * Get user's interaction history
     */
    getUserInteractions(userId: string, limit?: number): Promise<any[]>;
    /**
     * Find similar users based on interaction patterns
     */
    findSimilarUsers(userId: string, limit?: number): Promise<UserSimilarity[]>;
    /**
     * Get interaction statistics
     */
    getInteractionStats(): Promise<InteractionStats | null>;
    /**
     * Delete all user interactions (for privacy/GDPR compliance)
     */
    deleteUserData(userId: string): Promise<void>;
    /**
     * Clear all data (use with caution!)
     */
    clearAllData(): Promise<void>;
    /**
     * Parse JSON string safely
     */
    private parseJSON;
}
declare const memgraphService: MemgraphService;

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
    updatedAt: Date;
    name: string;
    email: string;
}, {
    role: "admin" | "user";
    createdAt: Date;
    id: string;
    updatedAt: Date;
    name: string;
    email: string;
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
 * Storage Adapter Interface
 * Abstraction for file storage operations
 * Supports both Firebase Storage and MinIO (S3-compatible)
 */
interface UploadOptions {
    contentType?: string;
    customMetadata?: Record<string, string>;
    cacheControl?: string;
}
interface StorageFile {
    name: string;
    fullPath: string;
    size: number;
    contentType?: string;
    bucket: string;
    metadata?: Record<string, any>;
    timeCreated?: Date;
    updated?: Date;
}
interface StorageAdapter {
    /**
     * Upload a file to storage
     * @param path - Path where file will be stored (e.g., 'content-hub/notes/file.md')
     * @param data - File data (Blob, File, ArrayBuffer, or Uint8Array)
     * @param options - Upload options (content type, metadata, etc.)
     */
    upload(path: string, data: Blob | File | ArrayBuffer | Uint8Array, options?: UploadOptions): Promise<StorageFile>;
    /**
     * Get download URL for a file
     * @param path - Path to the file
     */
    getDownloadURL(path: string): Promise<string>;
    /**
     * Download file data
     * @param path - Path to the file
     */
    download(path: string): Promise<Uint8Array>;
    /**
     * Delete a file
     * @param path - Path to the file
     */
    delete(path: string): Promise<void>;
    /**
     * List files in a directory
     * @param path - Directory path
     * @param options - List options (prefix, maxResults, etc.)
     */
    list(path: string, options?: {
        maxResults?: number;
        pageToken?: string;
    }): Promise<{
        items: StorageFile[];
        nextPageToken?: string;
    }>;
    /**
     * Get file metadata
     * @param path - Path to the file
     */
    getMetadata(path: string): Promise<StorageFile>;
    /**
     * Update file metadata
     * @param path - Path to the file
     * @param metadata - Metadata to update
     */
    updateMetadata(path: string, metadata: Partial<StorageFile>): Promise<StorageFile>;
    /**
     * Check if file exists
     * @param path - Path to the file
     */
    exists(path: string): Promise<boolean>;
    /**
     * Initialize the storage adapter
     */
    initialize(): Promise<void>;
    /**
     * Check if the adapter is initialized
     */
    isInitialized(): boolean;
}

/**
 * Storage Factory
 * Automatically selects the appropriate storage adapter based on environment configuration
 */

type StorageMode = 'firebase' | 'minio' | 's3';
/**
 * Get the storage adapter instance
 * This is the main function to use throughout the application
 */
declare function getStorage(): StorageAdapter;
/**
 * Initialize storage with explicit configuration
 * Useful for testing or specific deployment scenarios
 */
declare function initializeStorage(config?: {
    mode?: StorageMode;
    options?: any;
}): Promise<StorageAdapter>;

/**
 * Database Adapter Interface
 * Provides abstraction layer for both Firebase Firestore and PostgreSQL
 */
interface QueryFilter {
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'array-contains';
    value: any;
}
interface QueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    filters?: QueryFilter[];
}
interface DatabaseAdapter {
    findMany<T>(collection: string, options?: QueryOptions): Promise<T[]>;
    findOne<T>(collection: string, id: string): Promise<T | null>;
    findByField<T>(collection: string, field: string, value: any): Promise<T | null>;
    create<T>(collection: string, data: Partial<T>): Promise<T>;
    update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
    delete(collection: string, id: string): Promise<void>;
    createMany<T>(collection: string, data: Partial<T>[]): Promise<T[]>;
    updateMany(collection: string, ids: string[], data: any): Promise<void>;
    deleteMany(collection: string, ids: string[]): Promise<void>;
    transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;
    exists(collection: string, id: string): Promise<boolean>;
    count(collection: string, options?: QueryOptions): Promise<number>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
}
interface DatabaseTransaction {
    findOne<T>(collection: string, id: string): Promise<T | null>;
    create<T>(collection: string, data: Partial<T>): Promise<T>;
    update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
    delete(collection: string, id: string): Promise<void>;
}

/**
 * Database Factory
 * Returns the appropriate database adapter based on configuration
 */

/**
 * Convenience function to get the database adapter
 */
declare function getDatabase(): DatabaseAdapter;

/**
 * Authentication Adapter Interface
 * Provides abstraction layer for both Firebase Auth and Keycloak
 */
interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    role?: string;
    customClaims?: Record<string, any>;
}
interface AuthResult {
    user: AuthUser;
    token: string;
    refreshToken?: string;
}
interface TokenPayload {
    uid: string;
    email?: string;
    role?: string;
    exp?: number;
    iat?: number;
    [key: string]: any;
}
interface SignInCredentials {
    email: string;
    password: string;
}
interface SignUpCredentials extends SignInCredentials {
    displayName?: string;
}
interface AuthAdapter {
    signIn(credentials: SignInCredentials): Promise<AuthResult>;
    signUp(credentials: SignUpCredentials): Promise<AuthResult>;
    signOut(): Promise<void>;
    signInWithGoogle(): Promise<AuthResult>;
    signInWithMicrosoft?(): Promise<AuthResult>;
    getCurrentUser(): Promise<AuthUser | null>;
    getUserById(uid: string): Promise<AuthUser | null>;
    updateUserProfile(uid: string, data: Partial<AuthUser>): Promise<AuthUser>;
    deleteUser(uid: string): Promise<void>;
    getIdToken(forceRefresh?: boolean): Promise<string | null>;
    verifyToken(token: string): Promise<TokenPayload>;
    refreshToken?(refreshToken: string): Promise<AuthResult>;
    sendPasswordResetEmail(email: string): Promise<void>;
    confirmPasswordReset(code: string, newPassword: string): Promise<void>;
    updatePassword(newPassword: string): Promise<void>;
    sendEmailVerification?(): Promise<void>;
    verifyEmail?(code: string): Promise<void>;
    setCustomClaims?(uid: string, claims: Record<string, any>): Promise<void>;
    getCustomClaims?(uid: string): Promise<Record<string, any>>;
    onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
    initialize(): Promise<void>;
    isInitialized(): boolean;
}

/**
 * Authentication Factory
 * Returns the appropriate auth adapter based on configuration
 */

/**
 * Convenience function to get the auth adapter
 */
declare function getAuth(): AuthAdapter;

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
            desktop: boolean;
            inApp: boolean;
        }, {
            email?: boolean | undefined;
            desktop?: boolean | undefined;
            inApp?: boolean | undefined;
        }>>;
        dashboard: z.ZodDefault<z.ZodObject<{
            layout: z.ZodDefault<z.ZodEnum<["grid", "list"]>>;
            defaultView: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            layout: "list" | "grid";
            defaultView?: string | undefined;
        }, {
            defaultView?: string | undefined;
            layout?: "list" | "grid" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        dashboard: {
            layout: "list" | "grid";
            defaultView?: string | undefined;
        };
        notifications: {
            email: boolean;
            desktop: boolean;
            inApp: boolean;
        };
        theme: "light" | "dark" | "system";
    }, {
        dashboard?: {
            defaultView?: string | undefined;
            layout?: "list" | "grid" | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            desktop?: boolean | undefined;
            inApp?: boolean | undefined;
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
            delete: boolean;
            create: boolean;
            edit: boolean;
            viewAll: boolean;
        }, {
            delete?: boolean | undefined;
            create?: boolean | undefined;
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
            delete: boolean;
            create: boolean;
            edit: boolean;
            viewAll: boolean;
            approve: boolean;
        }, {
            delete?: boolean | undefined;
            create?: boolean | undefined;
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
            publish: boolean;
            edit: boolean;
            moderate: boolean;
        }, {
            create?: boolean | undefined;
            publish?: boolean | undefined;
            edit?: boolean | undefined;
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
            advanced: boolean;
            basic: boolean;
        }, {
            admin?: boolean | undefined;
            advanced?: boolean | undefined;
            basic?: boolean | undefined;
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
            delete: boolean;
            create: boolean;
            edit: boolean;
            view: boolean;
        }, {
            delete?: boolean | undefined;
            create?: boolean | undefined;
            edit?: boolean | undefined;
            view?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        analytics: {
            view: boolean;
            export: boolean;
            detailed: boolean;
        };
        povManagement: {
            delete: boolean;
            create: boolean;
            edit: boolean;
            viewAll: boolean;
        };
        trrManagement: {
            delete: boolean;
            create: boolean;
            edit: boolean;
            viewAll: boolean;
            approve: boolean;
        };
        contentHub: {
            create: boolean;
            publish: boolean;
            edit: boolean;
            moderate: boolean;
        };
        scenarioEngine: {
            create: boolean;
            execute: boolean;
            modify: boolean;
        };
        terminal: {
            admin: boolean;
            advanced: boolean;
            basic: boolean;
        };
        userManagement: {
            delete: boolean;
            create: boolean;
            edit: boolean;
            view: boolean;
        };
    }, {
        analytics?: {
            view?: boolean | undefined;
            export?: boolean | undefined;
            detailed?: boolean | undefined;
        } | undefined;
        povManagement?: {
            delete?: boolean | undefined;
            create?: boolean | undefined;
            edit?: boolean | undefined;
            viewAll?: boolean | undefined;
        } | undefined;
        trrManagement?: {
            delete?: boolean | undefined;
            create?: boolean | undefined;
            edit?: boolean | undefined;
            viewAll?: boolean | undefined;
            approve?: boolean | undefined;
        } | undefined;
        contentHub?: {
            create?: boolean | undefined;
            publish?: boolean | undefined;
            edit?: boolean | undefined;
            moderate?: boolean | undefined;
        } | undefined;
        scenarioEngine?: {
            create?: boolean | undefined;
            execute?: boolean | undefined;
            modify?: boolean | undefined;
        } | undefined;
        terminal?: {
            admin?: boolean | undefined;
            advanced?: boolean | undefined;
            basic?: boolean | undefined;
        } | undefined;
        userManagement?: {
            delete?: boolean | undefined;
            create?: boolean | undefined;
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
    updatedAt: Date;
    uid: string;
    email: string;
    displayName: string;
    permissions: {
        analytics: {
            view: boolean;
            export: boolean;
            detailed: boolean;
        };
        povManagement: {
            delete: boolean;
            create: boolean;
            edit: boolean;
            viewAll: boolean;
        };
        trrManagement: {
            delete: boolean;
            create: boolean;
            edit: boolean;
            viewAll: boolean;
            approve: boolean;
        };
        contentHub: {
            create: boolean;
            publish: boolean;
            edit: boolean;
            moderate: boolean;
        };
        scenarioEngine: {
            create: boolean;
            execute: boolean;
            modify: boolean;
        };
        terminal: {
            admin: boolean;
            advanced: boolean;
            basic: boolean;
        };
        userManagement: {
            delete: boolean;
            create: boolean;
            edit: boolean;
            view: boolean;
        };
    };
    preferences: {
        dashboard: {
            layout: "list" | "grid";
            defaultView?: string | undefined;
        };
        notifications: {
            email: boolean;
            desktop: boolean;
            inApp: boolean;
        };
        theme: "light" | "dark" | "system";
    };
    teams: string[];
    title?: string | undefined;
    manager?: string | undefined;
    department?: string | undefined;
    lastLoginAt?: Date | undefined;
}, {
    role: UserRole;
    createdAt: Date;
    status: UserStatus;
    updatedAt: Date;
    uid: string;
    email: string;
    displayName: string;
    permissions: {
        analytics?: {
            view?: boolean | undefined;
            export?: boolean | undefined;
            detailed?: boolean | undefined;
        } | undefined;
        povManagement?: {
            delete?: boolean | undefined;
            create?: boolean | undefined;
            edit?: boolean | undefined;
            viewAll?: boolean | undefined;
        } | undefined;
        trrManagement?: {
            delete?: boolean | undefined;
            create?: boolean | undefined;
            edit?: boolean | undefined;
            viewAll?: boolean | undefined;
            approve?: boolean | undefined;
        } | undefined;
        contentHub?: {
            create?: boolean | undefined;
            publish?: boolean | undefined;
            edit?: boolean | undefined;
            moderate?: boolean | undefined;
        } | undefined;
        scenarioEngine?: {
            create?: boolean | undefined;
            execute?: boolean | undefined;
            modify?: boolean | undefined;
        } | undefined;
        terminal?: {
            admin?: boolean | undefined;
            advanced?: boolean | undefined;
            basic?: boolean | undefined;
        } | undefined;
        userManagement?: {
            delete?: boolean | undefined;
            create?: boolean | undefined;
            edit?: boolean | undefined;
            view?: boolean | undefined;
        } | undefined;
    };
    title?: string | undefined;
    manager?: string | undefined;
    department?: string | undefined;
    preferences?: {
        dashboard?: {
            defaultView?: string | undefined;
            layout?: "list" | "grid" | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            desktop?: boolean | undefined;
            inApp?: boolean | undefined;
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

export { type ActivityLogEvent, type AdminAnalytics, type AnalyticsFilters, type AnalyticsResult, AnalyticsService, type AuthAdapter, type AuthCredentials, type AuthResult, type AuthUser, type BlueprintSummary, type BulkIndexDocument, CHAT_COLLECTION, CacheInvalidationPatterns, CacheKeys, type CacheOptions, type CacheStats, type ChatSchema, ChatValidationRules, type CreateUserRequest$1 as CreateUserRequest, DEFAULT_CONFIG, type DataScope, type DatabaseAdapter, type DatabaseClient, DatabaseValidationService, DynamicRecordService, type EngagementRecord, EventTrackingService, FirestoreClient, FirestoreQueries, type ImportConfiguration, type IndexStats, type Interaction, type InteractionStats, type JobResult, type LifecycleTransition, type LoginAnalytics, type LoginEventData, MemgraphService, type ValidationResult as MigrationValidationResult, OpenSearchService, type Permission, type ProcessingConfig, type ProcessingMetrics, type QueryFilter$1 as QueryFilter, type QueryOptions, type QueryResult, type RBACContext, type RBACEvent, RBACMiddleware, ROLE_PERMISSIONS, type Recommendation, type RecordCreationOptions, RecordProcessingOrchestrator, RedisCacheService, type RelationshipGraph, RelationshipManagementService, type RelationshipValidation, type ScenarioTerraformOutput, type SearchOptions, type SearchResult, type StagingRecord, type StorageAdapter, type StorageFile, type TerraformConfig, TerraformGenerationService, type TerraformResource, type TimelineEvent, type TransactionContext, type TransformedRecord, type TrendingEntity, USER_COLLECTION, type UpdateUserRequest$1 as UpdateUserRequest, type UploadOptions, type User, type UserActivity$1 as UserActivity, type UserActivityAnalytics, type UserAnalytics, UserManagementService, type UserProfile, UserRole, UserSchema, type UserSessionData, type UserSettings, type UserSimilarity, UserValidationRules, type ValidationReport, type ValidationResult$1 as ValidationResult, type WriteResult, analyticsService, firebaseApp as app, auth, authService, calculateAvgCycleDays, calculateWinRate, databaseValidationService, db, dcContextStore, dynamicRecordService, eventTrackingService, fetchAnalytics, fetchBlueprintSummary, fetchRegionEngagements, fetchUserEngagements, firebaseApp, forceReconnectEmulators, functions, getAuth, getDatabase, getFirebaseConfig, getRedisCacheService, getStorage, initializeStorage, isMockAuthMode, memgraphService, openSearchService, redisCacheService, relationshipManagementService, storage, terraformGenerationService, useEmulator, userActivityService, userManagementApiClient, userManagementService };
