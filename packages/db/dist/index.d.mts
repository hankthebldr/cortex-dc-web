import { Firestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import { z } from 'zod';

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
    email: string;
    role: "admin" | "user";
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}, {
    email: string;
    role: "admin" | "user";
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}>;
type User = z.infer<typeof UserSchema>;

interface POVSchema {
    id: string;
    organizationId: string;
    userId: string;
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
    status: 'draft' | 'active' | 'archived';
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
declare const POV_COLLECTION = "povs";
declare const POVValidationRules: {
    required: string[];
    maxTitleLength: number;
    maxDescriptionLength: number;
    maxTags: number;
    validStatuses: string[];
};

declare const TRR_COLLECTION = "trrs";
declare const TRRValidationRules: {
    required: string[];
    maxTitleLength: number;
    maxDescriptionLength: number;
    validStatuses: string[];
    validPriorities: string[];
};
interface TRRSchema {
    id: string;
    povId: string;
    organizationId: string;
    userId: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignedTo?: string[];
    dueDate?: Date;
    completedAt?: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
declare const TRRSchema: {};

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

export { CHAT_COLLECTION, type ChatSchema, ChatValidationRules, type DatabaseClient, FirestoreClient, FirestoreQueries, type POVSchema, POVValidationRules, POV_COLLECTION, type QueryResult, TRRSchema, TRRValidationRules, TRR_COLLECTION, type TransactionContext, USER_COLLECTION, type User, UserSchema, UserValidationRules };
