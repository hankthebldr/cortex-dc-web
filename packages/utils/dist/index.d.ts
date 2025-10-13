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

declare function validateEmail(email: string): boolean;
declare function validatePassword(password: string): boolean;

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

export { APP_CONFIG, type AnalyticsData, type ApiResponse, type AppConfig, type CommandExecutionResult, type FormatOptions, type HealthCheckResult, type POVData, type PaginatedResponse, type ScenarioData, type TRRData, VALIDATION_RULES, type ValidationResult, api, apiService, cn, debounce, formatDate, formatRelativeTime, generateId, slugify, throttle, validateEmail, validatePassword };
