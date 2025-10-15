import { ClassValue } from 'clsx';

/**
 * Comprehensive API Service Layer
 * Migrated from henryreed.ai/hosting/lib/api-service.ts
 * Provides standardized API endpoints for POV, TRR, Scenarios, and Analytics
 */
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: number;
    version: string;
}
interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}
interface POVData {
    id: string;
    name: string;
    customer: string;
    status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    scenarios: string[];
    tags: string[];
    metadata: Record<string, any>;
}
interface TRRData {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'validated' | 'rejected';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignee: string;
    createdAt: string;
    updatedAt: string;
    blockchain_hash?: string;
    metadata: Record<string, any>;
}
interface ScenarioData {
    id: string;
    name: string;
    type: string;
    status: 'available' | 'deployed' | 'archived';
    mitre_techniques: string[];
    cloud_providers: string[];
    resources: Record<string, any>;
    metadata: Record<string, any>;
}
interface AnalyticsData {
    region: string;
    theatre: string;
    user: string;
    engagements: number;
    povs_completed: number;
    trr_win_rate: number;
    avg_cycle_days: number;
    kpis: Record<string, number>;
    timestamp: string;
}
interface CommandExecutionResult {
    command: string;
    output: string;
    exit_code: number;
    execution_time: number;
}
interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    uptime: number;
    version: string;
}
/**
 * API Service Class
 * Handles all API operations with standardized response format
 */
declare class ApiService {
    private baseVersion;
    private mockData;
    constructor();
    /**
     * Initialize mock data for development/testing
     */
    private initializeMockData;
    /**
     * Create standardized API response
     */
    private createResponse;
    /**
     * Create paginated response
     */
    private createPaginatedResponse;
    /**
     * Simulate network delay for realistic mock responses
     */
    private delay;
    getPOVs(options?: {
        page?: number;
        limit?: number;
        status?: string;
        customer?: string;
        tags?: string[];
    }): Promise<PaginatedResponse<POVData>>;
    getPOV(id: string): Promise<ApiResponse<POVData>>;
    createPOV(povData: Omit<POVData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<POVData>>;
    updatePOV(id: string, updates: Partial<POVData>): Promise<ApiResponse<POVData>>;
    getTRRs(options?: {
        page?: number;
        limit?: number;
        status?: string;
        priority?: string;
        assignee?: string;
    }): Promise<PaginatedResponse<TRRData>>;
    getTRR(id: string): Promise<ApiResponse<TRRData>>;
    createTRR(trrData: Omit<TRRData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TRRData>>;
    getScenarios(options?: {
        page?: number;
        limit?: number;
        type?: string;
        status?: string;
        cloud_provider?: string;
    }): Promise<PaginatedResponse<ScenarioData>>;
    deployScenario(id: string, config?: Record<string, any>): Promise<ApiResponse<{
        deployment_id: string;
        status: string;
        config?: Record<string, any>;
    }>>;
    getAnalytics(options?: {
        region?: string;
        theatre?: string;
        user?: string;
        sinceDays?: number;
    }): Promise<ApiResponse<AnalyticsData[]>>;
    executeCommand(command: string, context?: Record<string, any>): Promise<ApiResponse<CommandExecutionResult>>;
    healthCheck(): Promise<ApiResponse<HealthCheckResult>>;
}
declare const apiService: ApiService;
declare const api: {
    povs: {
        list: (options?: Parameters<typeof apiService.getPOVs>[0]) => Promise<PaginatedResponse<POVData>>;
        get: (id: string) => Promise<ApiResponse<POVData>>;
        create: (data: Parameters<typeof apiService.createPOV>[0]) => Promise<ApiResponse<POVData>>;
        update: (id: string, updates: Parameters<typeof apiService.updatePOV>[1]) => Promise<ApiResponse<POVData>>;
    };
    trrs: {
        list: (options?: Parameters<typeof apiService.getTRRs>[0]) => Promise<PaginatedResponse<TRRData>>;
        get: (id: string) => Promise<ApiResponse<TRRData>>;
        create: (data: Parameters<typeof apiService.createTRR>[0]) => Promise<ApiResponse<TRRData>>;
    };
    scenarios: {
        list: (options?: Parameters<typeof apiService.getScenarios>[0]) => Promise<PaginatedResponse<ScenarioData>>;
        deploy: (id: string, config?: Record<string, any>) => Promise<ApiResponse<{
            deployment_id: string;
            status: string;
            config?: Record<string, any>;
        }>>;
    };
    analytics: {
        get: (options?: Parameters<typeof apiService.getAnalytics>[0]) => Promise<ApiResponse<AnalyticsData[]>>;
    };
    commands: {
        execute: (command: string, context?: Record<string, any>) => Promise<ApiResponse<CommandExecutionResult>>;
    };
    health: () => Promise<ApiResponse<HealthCheckResult>>;
};

/**
 * User Management API Client
 * Client-side wrapper for user management API endpoints
 * Replaces Firebase Functions with REST API calls
 */
interface UserProfile {
    id?: string;
    uid?: string;
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
/**
 * User Management API Client Class
 */
declare class UserApiClient {
    private baseUrl;
    constructor(baseUrl?: string);
    /**
     * Get authorization header
     */
    private getAuthHeader;
    /**
     * Make API request with authentication
     */
    private request;
    /**
     * Create a new user profile
     */
    createUser(userData: CreateUserRequest): Promise<{
        success: boolean;
        profile?: UserProfile;
        error?: string;
    }>;
    /**
     * Update user profile
     */
    updateUser(userId: string, updates: UpdateUserRequest): Promise<{
        success: boolean;
        profile?: UserProfile;
        error?: string;
    }>;
    /**
     * Get user profile by ID
     */
    getUserProfile(uid: string): Promise<UserProfile | null>;
    /**
     * Get current user profile
     */
    getCurrentUser(): Promise<UserProfile | null>;
    /**
     * Get all users with optional filters
     */
    getUsers(filters?: {
        role?: string;
        status?: string;
        organizationId?: string;
        limit?: number;
    }): Promise<UserProfile[]>;
    /**
     * Delete user
     */
    deleteUser(userId: string): Promise<boolean>;
    /**
     * Bulk update users
     */
    bulkUpdateUsers(userIds: string[], updates: Partial<Pick<UserProfile, 'role' | 'status' | 'organizationId'>>): Promise<{
        success: number;
        failed: number;
    }>;
    /**
     * Get organization members
     */
    getOrganizationMembers(organizationId: string): Promise<UserProfile[]>;
    /**
     * Export users data
     */
    exportUsers(filters?: {
        role?: string;
        status?: string;
        organizationId?: string;
    }): Promise<UserProfile[]>;
}
declare const userApiClient: UserApiClient;

/**
 * Utility function to merge class names conditionally
 * Combines clsx functionality for flexible className handling
 */
declare function cn(...inputs: ClassValue[]): string;

declare function formatDate(date: Date): string;
declare function formatRelativeTime(date: Date): string;

declare function generateId(): string;
declare function slugify(text: string): string;

declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;

/**
 * Browser Info Utility
 * Extracts browser, OS, and device information from user agent
 */
interface BrowserInfo {
    browser: string;
    os: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
}
declare function getBrowserInfo(userAgent?: string): BrowserInfo;
declare function generateSessionId(): string;

declare function validateEmail(email: string): boolean;
declare function validatePassword(password: string): boolean;

/**
 * Argument Parser
 * Simple command-line argument parser for terminal commands
 *
 * Migrated from henryreed.ai/hosting/lib/arg-parser.ts
 */
type ArgType = 'boolean' | 'string' | 'enum';
interface ArgSpecItem {
    flag: string;
    type: ArgType;
    enumValues?: string[];
    default?: any;
}
type ArgSpec = ArgSpecItem[];
interface ParsedArgs {
    _: string[];
    [key: string]: any;
}
declare function parseArgs(spec: ArgSpec, argv: string[]): ParsedArgs;
/**
 * Convert parsed args back to command string
 */
declare function argsToString(args: ParsedArgs): string;
/**
 * Validate args against spec
 */
declare function validateArgs(args: ParsedArgs, spec: ArgSpec): {
    valid: boolean;
    errors: string[];
};

/**
 * Cloud Store Service
 * Firebase Storage integration for markdown notes and documents
 *
 * Migrated from henryreed.ai/hosting/lib/cloud-store-service.ts
 */
interface CloudStoredMarkdown {
    id: string;
    name: string;
    path: string;
    size: number;
    uploadedAt: string;
    downloadUrl?: string;
    content?: string;
    metadata?: Record<string, any>;
}
declare class CloudStoreService {
    private readonly STORAGE_KEY;
    private storage;
    private get hasWindow();
    /**
     * Initialize storage instance
     */
    initializeStorage(): Promise<void>;
    private readLocalRecords;
    private writeLocalRecords;
    saveMarkdownNote(file: File, options?: {
        metadata?: Record<string, any>;
        contentText?: string;
    }): Promise<CloudStoredMarkdown>;
    getMarkdownRecord(id: string): CloudStoredMarkdown | null;
    listMarkdownRecords(): CloudStoredMarkdown[];
    getCallableMarkdown(id: string): (() => Promise<string>) | null;
    /**
     * Delete markdown record
     */
    deleteMarkdownRecord(id: string): boolean;
    /**
     * Clear all records
     */
    clearAllRecords(): void;
}
declare const cloudStoreService: CloudStoreService;

/**
 * Context Storage - Migrated from henryreed.ai
 *
 * Manages user session context, project requirements, and command history
 * Uses localStorage for persistence with SSR compatibility
 */
/**
 * User context for POV/engagement tracking
 */
interface UserContext {
    name?: string;
    company?: string;
    role?: string;
    email?: string;
    industry?: string;
    projectType?: string;
    budget?: string;
    timeline?: string;
    techStack?: string[];
    useCase?: string;
    dataSize?: string;
    currentSolution?: string;
    challenges?: string[];
    activeScenarios?: string[];
    completedAssessments?: string[];
    sessionStartTime?: Date;
    lastActivity?: Date;
    commandHistory?: string[];
}
/**
 * Context Storage Service
 *
 * Provides session-based context storage with localStorage persistence
 */
declare class ContextStorage {
    private context;
    private storageKey;
    constructor();
    /**
     * Store a key-value pair
     */
    set(key: keyof UserContext, value: any): void;
    /**
     * Retrieve a value by key
     */
    get(key: keyof UserContext): any;
    /**
     * Get all context data
     */
    getAll(): UserContext;
    /**
     * Update multiple values at once
     */
    update(updates: Partial<UserContext>): void;
    /**
     * Clear specific key
     */
    remove(key: keyof UserContext): void;
    /**
     * Clear all context data
     */
    clear(): void;
    /**
     * Check if a key exists
     */
    has(key: keyof UserContext): boolean;
    /**
     * Get user profile summary
     */
    getProfile(): {
        name?: string;
        company?: string;
        role?: string;
        email?: string;
    };
    /**
     * Get project context summary
     */
    getProjectContext(): {
        industry?: string;
        projectType?: string;
        budget?: string;
        timeline?: string;
        useCase?: string;
    };
    /**
     * Add to array fields
     */
    addToArray(key: 'techStack' | 'challenges' | 'activeScenarios' | 'completedAssessments' | 'commandHistory', value: string): void;
    /**
     * Remove from array fields
     */
    removeFromArray(key: 'techStack' | 'challenges' | 'activeScenarios' | 'completedAssessments' | 'commandHistory', value: string): void;
    /**
     * Session management
     */
    startSession(): void;
    updateActivity(): void;
    getSessionDuration(): string;
    /**
     * Persistence - localStorage with SSR guard
     */
    private saveToStorage;
    private loadFromStorage;
    /**
     * Export context for sharing/debugging
     */
    exportContext(): string;
    /**
     * Import context from JSON string
     */
    importContext(jsonString: string): boolean;
}
declare const contextStorage: ContextStorage;

/**
 * Platform Settings Service - Migrated from henryreed.ai
 *
 * Manages platform-wide configuration:
 * - Feature flags
 * - Environment configuration
 * - Audit logging
 *
 * Uses localStorage for persistence with fallback to global store
 */
type PlatformEnvironment = 'production' | 'staging' | 'qa' | 'development';
type ReleaseChannel = 'stable' | 'beta' | 'canary';
interface FeatureFlagDefinition {
    key: string;
    name: string;
    description: string;
    category: 'experience' | 'analytics' | 'integrations' | 'productivity' | 'mobile';
    defaultEnabled: boolean;
}
interface FeatureFlagState extends FeatureFlagDefinition {
    enabled: boolean;
    lastModified: string;
    modifiedBy: string;
}
interface EnvironmentConfig {
    environment: PlatformEnvironment;
    apiBaseUrl: string;
    analyticsDataset: string;
    releaseChannel: ReleaseChannel;
    maintenanceMode: boolean;
    region: string;
}
interface PlatformSettingsAuditEntry {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    message: string;
    metadata?: Record<string, string>;
}
interface PlatformSettingsDocument {
    featureFlags: FeatureFlagState[];
    environment: EnvironmentConfig;
    updatedAt: string;
    updatedBy: string;
    auditLog: PlatformSettingsAuditEntry[];
}
interface FeatureFlagUpdateResult {
    flag: FeatureFlagState;
    settings: PlatformSettingsDocument;
}
interface EnvironmentUpdateResult {
    settings: PlatformSettingsDocument;
}
/**
 * Platform Settings Service
 *
 * Centralized management of platform configuration and feature flags
 */
declare class PlatformSettingsService {
    private readonly storageKey;
    private cachedSettings;
    private readonly defaultFlags;
    constructor();
    getSettings(): Promise<PlatformSettingsDocument>;
    getSnapshot(): PlatformSettingsDocument;
    getDefaultEnvironment(): EnvironmentConfig;
    getFeatureFlagDefinitions(): FeatureFlagDefinition[];
    updateFeatureFlag(key: string, enabled: boolean, actor: {
        id: string;
        name: string;
    }): Promise<FeatureFlagUpdateResult>;
    updateEnvironmentConfig(config: EnvironmentConfig, actor: {
        id: string;
        name: string;
    }): Promise<EnvironmentUpdateResult>;
    validateEnvironmentConfig(config: EnvironmentConfig): Record<string, string>;
    private addAuditEntry;
    private loadFromStorage;
    private persist;
    private createDefaultSettings;
    private createDefaultEnvironment;
    private clone;
}
declare const platformSettingsService: PlatformSettingsService;

declare const APP_CONFIG: {
    readonly name: "Cortex DC Web";
    readonly version: "0.1.0";
    readonly description: "Domain Consultant Platform";
};

declare const VALIDATION_RULES: {
    readonly EMAIL_REGEX: RegExp;
    readonly PASSWORD_MIN_LENGTH: 8;
    readonly USERNAME_MIN_LENGTH: 3;
};

interface AppConfig {
    name: string;
    version: string;
    description: string;
}
interface ValidationResult {
    isValid: boolean;
    errors?: string[];
}
interface FormatOptions {
    locale?: string;
    timeZone?: string;
}

export { APP_CONFIG, type AnalyticsData, type ApiResponse, type AppConfig, type ArgSpec, type ArgSpecItem, type ArgType, type BrowserInfo, cloudStoreService as CloudStoreService, type CloudStoredMarkdown, type CommandExecutionResult, type CreateUserRequest, type EnvironmentConfig, type FeatureFlagDefinition, type FeatureFlagState, type FormatOptions, type HealthCheckResult, type POVData, type PaginatedResponse, type ParsedArgs, type PlatformEnvironment, type PlatformSettingsAuditEntry, type PlatformSettingsDocument, type ReleaseChannel, type ScenarioData, type TRRData, type UpdateUserRequest, type UserContext, type UserProfile, VALIDATION_RULES, type ValidationResult, api, apiService, argsToString, cloudStoreService, cn, contextStorage, debounce, formatDate, formatRelativeTime, generateId, generateSessionId, getBrowserInfo, parseArgs, platformSettingsService, slugify, throttle, userApiClient, validateArgs, validateEmail, validatePassword };
