import * as firebase_ai from 'firebase/ai';

/**
 * Request structure for Gemini AI operations
 */
interface GeminiRequest {
    /** The prompt/question to send to the AI */
    prompt: string;
    /** Optional conversation history for context */
    history?: Array<{
        role: 'user' | 'model';
        parts: string;
    }>;
    /** Optional system instruction for behavior customization */
    systemInstruction?: string;
    /** Temperature for response randomness (0.0-1.0) */
    temperature?: number;
    /** Maximum tokens in response */
    maxTokens?: number;
    /** Model to use (default: gemini-1.5-pro) */
    model?: string;
}
/**
 * Response structure from Gemini AI
 */
interface GeminiResponse$1 {
    /** Generated text response */
    text: string;
    /** Whether the operation was successful */
    success: boolean;
    /** Error message if operation failed */
    error?: string;
    /** Session ID for conversation continuity */
    sessionId?: string;
    /** Token usage information */
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
/**
 * AI-generated insight structure
 */
interface AIInsight$1 {
    /** Summary of the analysis */
    summary: string;
    /** Detailed insights and recommendations */
    insights: string[];
    /** Confidence score (0-100) */
    confidence: number;
    /** Any warnings or concerns */
    warnings?: string[];
    /** Suggested actions */
    suggestions?: string[];
    /** Generated artifacts (code, rules, etc.) */
    artifacts?: Array<{
        type: 'code' | 'rule' | 'config' | 'documentation';
        content: string;
        language?: string;
    }>;
}
/**
 * Gemini AI Service Configuration
 */
interface GeminiConfig {
    /** Gemini API Key (for direct API access) */
    apiKey?: string;
    /** Firebase project ID (for Vertex AI via Service Account) */
    projectId?: string;
    /** Google Cloud region for Vertex AI */
    region?: string;
    /** Default model to use */
    defaultModel?: string;
    /** Enable request caching */
    enableCaching?: boolean;
}
/**
 * Main Gemini AI Service Class
 *
 * Provides a comprehensive interface for AI operations including
 * domain-specific analysis and general-purpose generation.
 */
declare class GeminiAIService {
    private genAI;
    private config;
    private chatSessions;
    private readonly SESSION_TIMEOUT_MS;
    private readonly DEFAULT_MODEL;
    private readonly VERTEX_AI_ENDPOINT;
    constructor(config: GeminiConfig);
    /**
     * Initialize Google Generative AI client
     */
    private initializeGenAI;
    /**
     * Get or create a generative model
     */
    private getModel;
    /**
     * Get access token for Vertex AI (Service Account authentication)
     */
    private getAccessToken;
    /**
     * Invoke Vertex AI model directly (for Service Account auth)
     */
    private invokeModel;
    /**
     * Generate a response from Gemini AI
     *
     * @param request - Request configuration
     * @param sessionId - Optional session ID for conversation continuity
     * @returns Generated response with metadata
     */
    generateResponse(request: GeminiRequest, sessionId?: string): Promise<GeminiResponse$1>;
    /**
     * Analyze a POV (Proof of Value) engagement
     *
     * Provides insights on engagement quality, risk factors, and recommendations
     *
     * @param povData - POV engagement data
     * @returns AI-generated insights and recommendations
     */
    analyzePOV(povData: any): Promise<AIInsight$1>;
    /**
     * Analyze a TRR (Technical Readiness Review)
     *
     * Validates technical implementation and identifies gaps
     *
     * @param trrData - TRR data
     * @returns AI-generated validation and recommendations
     */
    analyzeTRR(trrData: any): Promise<AIInsight$1>;
    /**
     * Generate a detection rule for a scenario
     *
     * Creates XQL or YAML detection rules based on scenario requirements
     *
     * @param scenarioData - Scenario definition
     * @returns Generated detection rule with explanation
     */
    generateDetectionRule(scenarioData: any): Promise<AIInsight$1>;
    /**
     * Optimize a scenario for better performance
     *
     * Analyzes scenario execution data and suggests improvements
     *
     * @param scenarioData - Scenario configuration
     * @param performanceData - Optional performance metrics
     * @returns Optimization recommendations
     */
    optimizeScenario(scenarioData: any, performanceData?: any): Promise<AIInsight$1>;
    /**
     * Generate a risk assessment for a project
     *
     * @param projectData - Project information
     * @returns Risk assessment with mitigation strategies
     */
    generateRiskAssessment(projectData: any): Promise<AIInsight$1>;
    /**
     * Interactive chat with Gemini
     *
     * Maintains conversation context across multiple turns
     *
     * @param message - User message
     * @param context - Optional context about the conversation
     * @param sessionId - Session ID for continuity
     * @returns Chat response
     */
    chatWithGemini(message: string, context?: string, sessionId?: string): Promise<GeminiResponse$1>;
    /**
     * Clear a chat session
     */
    clearSession(sessionId: string): void;
    /**
     * Get session history
     */
    getSessionHistory(sessionId: string): Array<{
        role: 'user' | 'model';
        parts: string;
    }> | null;
    /**
     * Clean up expired sessions
     */
    private cleanupSessions;
    /**
     * Parse AI response into structured insight
     */
    private parseInsightResponse;
    /**
     * Create an error insight
     */
    private createErrorInsight;
}
/**
 * Initialize Gemini AI Service with configuration
 *
 * @param config - Gemini configuration
 * @returns Singleton service instance
 */
declare function initializeGeminiService(config: GeminiConfig): GeminiAIService;
/**
 * Get existing Gemini service instance
 *
 * @throws Error if service not initialized
 */
declare function getGeminiService(): GeminiAIService;
/**
 * Initialize Gemini with Firebase configuration
 *
 * Convenience function for Firebase-based apps
 */
declare function initializeGeminiWithFirebase(config: {
    apiKey?: string;
    projectId?: string;
}): GeminiAIService;
/**
 * Create a Firebase Cloud Function handler for Gemini operations
 *
 * Example usage in Firebase Functions:
 * ```typescript
 * export const geminiChat = createGeminiCloudFunction();
 * ```
 */
declare function createGeminiCloudFunction(): (data: {
    message: string;
    context?: string;
    sessionId?: string;
}) => Promise<GeminiResponse$1>;

/**
 * Gemini AI Types - Shared type definitions
 * Migrated from henryreed.ai
 */
/**
 * Gemini artifact (file attachment or data)
 */
interface GeminiArtifact {
    id: string;
    mimeType: string;
    data: string;
    description?: string;
}
/**
 * Gemini response from AI model
 */
interface GeminiResponse {
    response: string;
    confidence: number;
    tokensUsed: number;
    model: string;
    timestamp: string;
    sessionId?: string;
    raw?: any;
}
/**
 * AI-generated insight for domain consultant workflows
 */
interface AIInsight {
    type: 'risk_analysis' | 'recommendation' | 'detection_rule' | 'scenario_optimization' | 'trr_analysis';
    title: string;
    content: string;
    confidence: number;
    actionItems: string[];
    relatedData?: any;
}
/**
 * Cloud Function request structure
 */
interface GeminiFunctionRequest {
    action: 'analyze_pov' | 'analyze_trr' | 'generate_detection' | 'optimize_scenario' | 'chat';
    data: any;
    userId: string;
    sessionId?: string;
}
/**
 * Cloud Function response structure
 */
interface GeminiFunctionResponse {
    success: boolean;
    data?: AIInsight | GeminiResponse;
    error?: string;
    usage?: {
        tokensUsed: number;
        cost: number;
    };
}

/**
 * AI Insights Client - Migrated from henryreed.ai
 *
 * Lightweight AI client for GUI interactions
 * - Uses Firebase/Cloud Functions if configured via NEXT_PUBLIC_FUNCTIONS_BASE_URL
 * - Falls back to local GeminiAIService simulation when not configured
 *
 * Provides chat, POV analysis, TRR validation, and detection generation
 */

type AIInsightsAction = GeminiFunctionRequest['action'];
/**
 * AI Insights Client
 *
 * Provides AI-powered analysis for DC workflows:
 * - Chat with contextual awareness
 * - POV engagement analysis
 * - TRR validation guidance
 * - Detection rule generation
 */
declare const aiInsightsClient: {
    /**
     * Chat with AI assistant
     * @param message - User message
     * @param context - Optional conversation context
     * @param artifacts - Optional file attachments or data artifacts
     */
    chat(message: string, context?: any, artifacts?: GeminiArtifact[]): Promise<GeminiFunctionResponse>;
    /**
     * Analyze POV engagement
     * @param pov - POV engagement data
     * @param artifacts - Optional supporting documents
     */
    analyzePOV(pov: any, artifacts?: GeminiArtifact[]): Promise<GeminiFunctionResponse>;
    /**
     * Analyze TRR validation
     * @param trr - TRR data
     * @param artifacts - Optional validation evidence
     */
    analyzeTRR(trr: any, artifacts?: GeminiArtifact[]): Promise<GeminiFunctionResponse>;
    /**
     * Generate detection rule for scenario
     * @param scenario - Scenario definition
     * @param artifacts - Optional supporting data
     */
    generateDetection(scenario: any, artifacts?: GeminiArtifact[]): Promise<GeminiFunctionResponse>;
};

/**
 * Initialize Firebase AI Logic with Gemini backend
 */
declare function initializeAI(): Promise<firebase_ai.AI | null>;
/**
 * Get a generative model instance
 */
declare function getModel(modelName?: string): Promise<firebase_ai.GenerativeModel>;
/**
 * Generate content from a text prompt
 */
declare function generateContent(prompt: string, modelName?: string): Promise<string>;
/**
 * Generate streaming content (for real-time responses)
 */
declare function generateContentStream(prompt: string, modelName?: string): AsyncGenerator<string, void, unknown>;
/**
 * Specialized AI functions for Cortex Domain Consultant
 */
/**
 * Generate POV recommendations based on customer scenario
 */
declare function generatePOVRecommendations(customerScenario: string, industry?: string, challenges?: string[]): Promise<string>;
/**
 * Generate detection scenario templates
 */
declare function generateDetectionScenario(attackTechnique: string, cloudProvider: string): Promise<string>;
/**
 * Analyze and enhance knowledge base content
 */
declare function enhanceKnowledgeBaseContent(content: string, targetAudience?: string): Promise<{
    summary: string;
    keywords: string[];
    suggestedTags: string[];
    complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    relatedTopics: string[];
}>;
/**
 * Generate terminal command suggestions
 */
declare function generateCommandSuggestions(context: string, previousCommands: string[]): Promise<string[]>;
/**
 * Health check for AI Logic service
 */
declare function healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unavailable';
    message: string;
}>;

/**
 * Domain Consultant workflow context
 */
interface DCWorkflowContext {
    workflowType: 'pov_planning' | 'trr_validation' | 'scenario_selection' | 'customer_analysis' | 'engagement_summary';
    currentStep?: string;
    customerProfile?: {
        industry?: string;
        size?: string;
        maturityLevel?: string;
        primaryConcerns?: string[];
        techStack?: string[];
    };
    engagementData?: {
        duration?: string;
        scope?: string[];
        stakeholders?: string[];
        objectives?: string[];
        povStatus?: {
            id: string;
            status: string;
            completedScenarios: number;
            totalScenarios: number;
        };
        trrFocus?: {
            id: string;
            title: string;
            status: string;
            priority: 'low' | 'medium' | 'high' | 'critical';
        };
    };
    workInProgress?: {
        povsActive?: number;
        trrsCompleted?: number;
        scenariosDeployed?: string[];
        blockers?: string[];
    };
}
/**
 * DC-specific recommendation
 */
interface DCRecommendation {
    type: 'next_action' | 'optimization' | 'risk_mitigation' | 'acceleration';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionable: boolean;
    estimatedImpact: string;
    suggestedActions?: string[];
}
/**
 * DC workflow summary
 */
interface DCWorkflowSummary {
    workflowType: string;
    currentStatus: string;
    keyAccomplishments: string[];
    upcomingMilestones: string[];
    recommendations: DCRecommendation[];
    estimatedCompletion: string;
    riskFactors: string[];
}
/**
 * DC AI Client
 *
 * Provides AI-powered assistance for Domain Consultant workflows
 */
declare const dcAIClient: {
    /**
     * POV Planning and Optimization
     * Analyzes POV data and provides strategic optimization recommendations
     */
    optimizePOVPlan(povData: any, context: DCWorkflowContext): Promise<any>;
    /**
     * TRR Validation Intelligence
     * Analyzes TRRs and provides validation acceleration insights
     */
    accelerateTRRValidation(trrData: any, context: DCWorkflowContext): Promise<any>;
    /**
     * Scenario Selection and Customer Fit
     * Recommends optimal security scenarios for customer profile
     */
    recommendScenarios(customerProfile: any, context: DCWorkflowContext): Promise<any>;
    /**
     * Engagement Summary and Next Steps
     * Creates comprehensive engagement summary with recommendations
     */
    generateEngagementSummary(engagementData: any, context: DCWorkflowContext): Promise<DCWorkflowSummary>;
    /**
     * Real-time Workflow Assistance
     * Provides immediate guidance for current workflow step
     */
    getWorkflowGuidance(currentTask: string, context: DCWorkflowContext): Promise<any>;
    /**
     * Customer-Specific Intelligence
     * Analyzes customer-solution fit
     */
    analyzeCustomerFit(customerData: any, proposedSolution: any): Promise<any>;
    /**
     * Intelligent Form Pre-population
     * Suggests form data based on context
     */
    suggestFormData(formType: string, context: DCWorkflowContext, existingData?: any): Promise<any>;
};

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

export { type AIInsight$1 as AIInsight, type AIInsightsAction, AIProvider, type AIProviderConfig, ChatClient, type ChatMessage, type ChatResponse, ChatSession, type DCRecommendation, type DCWorkflowContext, type DCWorkflowSummary, EmbeddingService, type EmbeddingVector, GeminiAIService, type GeminiArtifact, type GeminiConfig, type GeminiFunctionRequest, type GeminiFunctionResponse, type GeminiRequest, type GeminiResponse$1 as GeminiResponse, OpenAIProvider, type RAGConfig, RAGOrchestrator, VertexAIProvider, aiInsightsClient, createGeminiCloudFunction, dcAIClient, enhanceKnowledgeBaseContent, generateCommandSuggestions, generateContent, generateContentStream, generateDetectionScenario, generatePOVRecommendations, getGeminiService, getModel, healthCheck, initializeAI, initializeGeminiService, initializeGeminiWithFirebase };
