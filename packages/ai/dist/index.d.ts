declare abstract class AIProvider {
}

declare class VertexAIProvider extends AIProvider {
}

declare class OpenAIProvider extends AIProvider {
    private apiKey;
    private model;
    constructor(apiKey: string, model?: string);
    generateCompletion(prompt: string): Promise<string>;
}

interface ChatMessage$1 {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}
interface ChatClientConfig {
    apiKey?: string;
    model?: string;
}
declare class ChatClient {
    private config;
    constructor(config?: ChatClientConfig);
    sendMessage(message: string): Promise<ChatMessage$1>;
    getHistory(): Promise<ChatMessage$1[]>;
}

declare class ChatSession {
    private sessionId;
    private messages;
    constructor(sessionId?: string);
    getId(): string;
    addMessage(message: ChatMessage$1): void;
    getMessages(): ChatMessage$1[];
    clear(): void;
    save(): Promise<void>;
    load(): Promise<void>;
}

interface RAGQuery {
    query: string;
    maxResults?: number;
    threshold?: number;
}
interface RAGResult {
    content: string;
    score: number;
    metadata?: Record<string, any>;
}
declare class RAGOrchestrator {
    private embeddingService?;
    private vectorStore?;
    constructor();
    query(ragQuery: RAGQuery): Promise<RAGResult[]>;
    indexDocument(content: string, metadata?: Record<string, any>): Promise<void>;
}

interface EmbeddingVector$1 {
    values: number[];
    dimension: number;
}
interface EmbeddingRequest {
    text: string;
    model?: string;
}
declare class EmbeddingService {
    private apiKey?;
    private model;
    constructor(apiKey?: string, model?: string);
    generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingVector$1>;
    generateEmbeddings(texts: string[]): Promise<EmbeddingVector$1[]>;
    calculateSimilarity(vec1: EmbeddingVector$1, vec2: EmbeddingVector$1): number;
}

interface AIProviderConfig {
}
interface ChatMessage {
}
interface ChatResponse {
}
interface EmbeddingVector {
}
interface RAGConfig {
}

export { AIProvider, type AIProviderConfig, ChatClient, type ChatMessage, type ChatResponse, ChatSession, EmbeddingService, type EmbeddingVector, OpenAIProvider, type RAGConfig, RAGOrchestrator, VertexAIProvider };
