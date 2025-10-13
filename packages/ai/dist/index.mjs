// src/gemini-ai-service.ts
var GeminiAIService = class {
  constructor(config) {
    this.genAI = null;
    this.chatSessions = /* @__PURE__ */ new Map();
    this.SESSION_TIMEOUT_MS = 30 * 60 * 1e3;
    // 30 minutes
    this.DEFAULT_MODEL = "gemini-1.5-pro";
    this.VERTEX_AI_ENDPOINT = "https://us-central1-aiplatform.googleapis.com/v1";
    this.config = {
      defaultModel: this.DEFAULT_MODEL,
      region: "us-central1",
      enableCaching: true,
      ...config
    };
    if (this.config.apiKey && typeof window !== "undefined") {
      this.initializeGenAI();
    }
  }
  /**
   * Initialize Google Generative AI client
   */
  async initializeGenAI() {
    if (this.genAI) return;
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    } catch (error) {
      console.error("Failed to initialize Gemini AI:", error);
      throw new Error("Gemini AI initialization failed");
    }
  }
  /**
   * Get or create a generative model
   */
  async getModel(modelName) {
    await this.initializeGenAI();
    if (!this.genAI) {
      throw new Error("Gemini AI not initialized. Please provide an API key.");
    }
    return this.genAI.getGenerativeModel({
      model: modelName || this.config.defaultModel || this.DEFAULT_MODEL
    });
  }
  /**
   * Get access token for Vertex AI (Service Account authentication)
   */
  async getAccessToken() {
    try {
      const response = await fetch("/api/auth/vertex-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error("Failed to get Vertex AI access token");
      }
      const data = await response.json();
      return data.accessToken;
    } catch (error) {
      console.error("Access token error:", error);
      throw error;
    }
  }
  /**
   * Invoke Vertex AI model directly (for Service Account auth)
   */
  async invokeModel(payload) {
    if (!this.config.projectId) {
      throw new Error("Project ID required for Vertex AI");
    }
    const accessToken = await this.getAccessToken();
    const model = payload.model || this.config.defaultModel || this.DEFAULT_MODEL;
    const endpoint = `${this.VERTEX_AI_ENDPOINT}/projects/${this.config.projectId}/locations/${this.config.region}/publishers/google/models/${model}:generateContent`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Vertex AI request failed: ${response.statusText}`);
    }
    return response.json();
  }
  /**
   * Generate a response from Gemini AI
   *
   * @param request - Request configuration
   * @param sessionId - Optional session ID for conversation continuity
   * @returns Generated response with metadata
   */
  async generateResponse(request, sessionId) {
    try {
      const model = await this.getModel(request.model);
      const generationConfig = {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 2048
      };
      let session = sessionId ? this.chatSessions.get(sessionId) : null;
      const history = request.history || session?.history || [];
      const chat = model.startChat({
        history: history.map((h) => ({
          role: h.role,
          parts: [{ text: h.parts }]
        })),
        generationConfig,
        systemInstruction: request.systemInstruction
      });
      const result = await chat.sendMessage(request.prompt);
      const response = result.response;
      const text = response.text();
      if (sessionId) {
        if (!session) {
          session = {
            sessionId,
            history: [],
            createdAt: Date.now(),
            lastActiveAt: Date.now()
          };
          this.chatSessions.set(sessionId, session);
        }
        session.history.push(
          { role: "user", parts: request.prompt },
          { role: "model", parts: text }
        );
        session.lastActiveAt = Date.now();
        this.cleanupSessions();
      }
      return {
        text,
        success: true,
        sessionId,
        usage: {
          promptTokens: 0,
          // Not available in SDK response
          completionTokens: 0,
          totalTokens: 0
        }
      };
    } catch (error) {
      console.error("Gemini AI error:", error);
      return {
        text: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * Analyze a POV (Proof of Value) engagement
   *
   * Provides insights on engagement quality, risk factors, and recommendations
   *
   * @param povData - POV engagement data
   * @returns AI-generated insights and recommendations
   */
  async analyzePOV(povData) {
    const prompt = `
Analyze this Proof of Value (POV) engagement and provide detailed insights:

Customer: ${povData.customer || "N/A"}
Region: ${povData.region || "N/A"}
Status: ${povData.status || "N/A"}
Start Date: ${povData.startDate || "N/A"}
Expected Close: ${povData.expectedClose || "N/A"}
Scenarios: ${povData.scenarios?.join(", ") || "None specified"}
Technical Contact: ${povData.technicalContact || "N/A"}
Decision Maker: ${povData.decisionMaker || "N/A"}
Budget: ${povData.budget || "N/A"}
Notes: ${povData.notes || "None"}

Please provide:
1. Overall assessment and health score
2. Key risk factors and concerns
3. Success probability and factors
4. Recommended actions and next steps
5. Timeline assessment
6. Resource allocation recommendations

Format your response as structured JSON with: summary, insights (array), confidence (0-100), warnings (array), suggestions (array).
`;
    const response = await this.generateResponse({
      prompt,
      systemInstruction: "You are a Cortex XSIAM sales engineering expert analyzing POV engagements. Provide actionable, specific recommendations.",
      temperature: 0.3
      // Lower temperature for more focused analysis
    });
    if (!response.success) {
      return this.createErrorInsight(response.error || "Analysis failed");
    }
    return this.parseInsightResponse(response.text);
  }
  /**
   * Analyze a TRR (Technical Readiness Review)
   *
   * Validates technical implementation and identifies gaps
   *
   * @param trrData - TRR data
   * @returns AI-generated validation and recommendations
   */
  async analyzeTRR(trrData) {
    const prompt = `
Analyze this Technical Readiness Review (TRR) and provide validation:

Title: ${trrData.title || "N/A"}
Customer: ${trrData.customer || "N/A"}
Status: ${trrData.status || "N/A"}
Priority: ${trrData.priority || "N/A"}
Technical Areas: ${trrData.technicalAreas?.join(", ") || "None"}
Completeness: ${trrData.completeness || "N/A"}%
Risks: ${trrData.risks?.join(", ") || "None identified"}
Dependencies: ${trrData.dependencies?.join(", ") || "None"}
Notes: ${trrData.notes || "None"}

Please provide:
1. Technical readiness assessment
2. Gap analysis and missing components
3. Risk evaluation and mitigation strategies
4. Dependencies and blockers analysis
5. Timeline feasibility
6. Go/No-Go recommendation with justification

Format your response as structured JSON with: summary, insights (array), confidence (0-100), warnings (array), suggestions (array).
`;
    const response = await this.generateResponse({
      prompt,
      systemInstruction: "You are a Cortex XSIAM technical architect performing TRR validation. Focus on technical accuracy and implementation feasibility.",
      temperature: 0.3
    });
    if (!response.success) {
      return this.createErrorInsight(response.error || "Analysis failed");
    }
    return this.parseInsightResponse(response.text);
  }
  /**
   * Generate a detection rule for a scenario
   *
   * Creates XQL or YAML detection rules based on scenario requirements
   *
   * @param scenarioData - Scenario definition
   * @returns Generated detection rule with explanation
   */
  async generateDetectionRule(scenarioData) {
    const prompt = `
Generate a Cortex XSIAM detection rule for this scenario:

Scenario: ${scenarioData.name || "N/A"}
Description: ${scenarioData.description || "N/A"}
Attack Technique: ${scenarioData.attackTechnique || "N/A"}
MITRE ATT&CK: ${scenarioData.mitreAttack || "N/A"}
Data Sources: ${scenarioData.dataSources?.join(", ") || "None"}
Detection Logic: ${scenarioData.detectionLogic || "N/A"}
Severity: ${scenarioData.severity || "Medium"}

Requirements:
1. Generate XQL query for detection
2. Provide YAML rule configuration
3. Include tuning recommendations
4. Add testing guidelines
5. Explain detection logic
6. List false positive scenarios

Format as structured JSON with detection rule artifacts.
`;
    const response = await this.generateResponse({
      prompt,
      systemInstruction: "You are a Cortex XSIAM detection engineer. Generate accurate, performant XQL queries and properly structured YAML rules. Include tuning guidance.",
      temperature: 0.2
      // Very low temperature for rule generation
    });
    if (!response.success) {
      return this.createErrorInsight(response.error || "Generation failed");
    }
    return this.parseInsightResponse(response.text);
  }
  /**
   * Optimize a scenario for better performance
   *
   * Analyzes scenario execution data and suggests improvements
   *
   * @param scenarioData - Scenario configuration
   * @param performanceData - Optional performance metrics
   * @returns Optimization recommendations
   */
  async optimizeScenario(scenarioData, performanceData) {
    const prompt = `
Optimize this Cortex XSIAM scenario for better performance and accuracy:

Scenario: ${scenarioData.name || "N/A"}
Current XQL: ${scenarioData.xql || "N/A"}
Execution Time: ${performanceData?.executionTime || "N/A"}
Data Volume: ${performanceData?.dataVolume || "N/A"}
False Positives: ${performanceData?.falsePositives || "N/A"}
True Positives: ${performanceData?.truePositives || "N/A"}

Please provide:
1. Query optimization recommendations
2. Performance improvement strategies
3. Accuracy enhancement suggestions
4. Data source optimization
5. Tuning parameters
6. Alternative approaches

Format as structured JSON with optimized XQL artifacts.
`;
    const response = await this.generateResponse({
      prompt,
      systemInstruction: "You are a Cortex XSIAM performance optimization expert. Focus on query efficiency, accuracy, and maintainability.",
      temperature: 0.3
    });
    if (!response.success) {
      return this.createErrorInsight(response.error || "Optimization failed");
    }
    return this.parseInsightResponse(response.text);
  }
  /**
   * Generate a risk assessment for a project
   *
   * @param projectData - Project information
   * @returns Risk assessment with mitigation strategies
   */
  async generateRiskAssessment(projectData) {
    const prompt = `
Generate a comprehensive risk assessment for this Cortex XSIAM project:

Project: ${projectData.name || "N/A"}
Customer: ${projectData.customer || "N/A"}
Timeline: ${projectData.timeline || "N/A"}
Budget: ${projectData.budget || "N/A"}
Team Size: ${projectData.teamSize || "N/A"}
Technical Complexity: ${projectData.complexity || "N/A"}
Dependencies: ${projectData.dependencies?.join(", ") || "None"}
Constraints: ${projectData.constraints || "None"}

Assess risks in these categories:
1. Technical risks
2. Schedule risks
3. Resource risks
4. Integration risks
5. Operational risks
6. Security risks

For each risk provide: likelihood (1-5), impact (1-5), mitigation strategy.
Format as structured JSON.
`;
    const response = await this.generateResponse({
      prompt,
      systemInstruction: "You are a Cortex XSIAM project risk assessment expert. Provide realistic, actionable risk analysis.",
      temperature: 0.4
    });
    if (!response.success) {
      return this.createErrorInsight(response.error || "Risk assessment failed");
    }
    return this.parseInsightResponse(response.text);
  }
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
  async chatWithGemini(message, context, sessionId) {
    const effectiveSessionId = sessionId || `session-${Date.now()}`;
    const systemInstruction = context ? `You are a helpful Cortex XSIAM assistant. Context: ${context}` : "You are a helpful Cortex XSIAM assistant. Provide clear, concise, and accurate information about Cortex XSIAM features, use cases, and best practices.";
    return this.generateResponse(
      {
        prompt: message,
        systemInstruction,
        temperature: 0.7
      },
      effectiveSessionId
    );
  }
  /**
   * Clear a chat session
   */
  clearSession(sessionId) {
    this.chatSessions.delete(sessionId);
  }
  /**
   * Get session history
   */
  getSessionHistory(sessionId) {
    const session = this.chatSessions.get(sessionId);
    return session?.history || null;
  }
  /**
   * Clean up expired sessions
   */
  cleanupSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.chatSessions.entries()) {
      if (now - session.lastActiveAt > this.SESSION_TIMEOUT_MS) {
        this.chatSessions.delete(sessionId);
      }
    }
  }
  /**
   * Parse AI response into structured insight
   */
  parseInsightResponse(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || "No summary provided",
          insights: parsed.insights || [],
          confidence: parsed.confidence || 50,
          warnings: parsed.warnings || [],
          suggestions: parsed.suggestions || [],
          artifacts: parsed.artifacts || []
        };
      }
    } catch (error) {
      console.warn("Failed to parse JSON response, using text format:", error);
    }
    return {
      summary: text.substring(0, 200),
      insights: [text],
      confidence: 50,
      warnings: [],
      suggestions: []
    };
  }
  /**
   * Create an error insight
   */
  createErrorInsight(error) {
    return {
      summary: "Analysis failed",
      insights: [],
      confidence: 0,
      warnings: [error],
      suggestions: ["Please check your input data and try again"]
    };
  }
};
var geminiServiceInstance = null;
function initializeGeminiService(config) {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiAIService(config);
  }
  return geminiServiceInstance;
}
function getGeminiService() {
  if (!geminiServiceInstance) {
    throw new Error("Gemini service not initialized. Call initializeGeminiService first.");
  }
  return geminiServiceInstance;
}
function initializeGeminiWithFirebase(config) {
  return initializeGeminiService({
    apiKey: config.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    projectId: config.projectId,
    region: "us-central1",
    defaultModel: "gemini-1.5-pro",
    enableCaching: true
  });
}
function createGeminiCloudFunction() {
  return async (data) => {
    const service = getGeminiService();
    return service.chatWithGemini(data.message, data.context, data.sessionId);
  };
}

// src/providers/base.ts
var AIProvider = class {
  // Placeholder implementation
};

// src/providers/vertex.ts
var VertexAIProvider = class extends AIProvider {
  // Placeholder implementation
};

// src/providers/openai.ts
var OpenAIProvider = class extends AIProvider {
  constructor(apiKey, model = "gpt-4") {
    super();
    this.apiKey = apiKey;
    this.model = model;
  }
  // Placeholder implementation
  async generateCompletion(prompt) {
    return `OpenAI response for: ${prompt}`;
  }
};

// src/chat/client.ts
var ChatClient = class {
  constructor(config = {}) {
    this.config = config;
  }
  async sendMessage(message) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `Echo: ${message}`,
      timestamp: /* @__PURE__ */ new Date()
    };
  }
  async getHistory() {
    return [];
  }
};

// src/chat/session.ts
var ChatSession = class {
  constructor(sessionId) {
    this.messages = [];
    this.sessionId = sessionId || Date.now().toString();
  }
  getId() {
    return this.sessionId;
  }
  addMessage(message) {
    this.messages.push(message);
  }
  getMessages() {
    return [...this.messages];
  }
  clear() {
    this.messages = [];
  }
  // TODO: Implement session persistence
  async save() {
  }
  async load() {
  }
};

// src/rag/orchestrator.ts
var RAGOrchestrator = class {
  // TODO: Type this properly
  constructor() {
  }
  async query(ragQuery) {
    return [
      {
        content: `RAG result for: ${ragQuery.query}`,
        score: 0.9,
        metadata: { source: "placeholder" }
      }
    ];
  }
  async indexDocument(content, metadata) {
    console.log("Indexing document:", { content: content.substring(0, 100), metadata });
  }
};

// src/embeddings/service.ts
var EmbeddingService = class {
  constructor(apiKey, model = "text-embedding-ada-002") {
    this.apiKey = apiKey;
    this.model = model;
  }
  async generateEmbedding(request) {
    const dimension = 1536;
    const values = Array.from({ length: dimension }, () => Math.random() - 0.5);
    return {
      values,
      dimension
    };
  }
  async generateEmbeddings(texts) {
    const embeddings = await Promise.all(
      texts.map((text) => this.generateEmbedding({ text }))
    );
    return embeddings;
  }
  calculateSimilarity(vec1, vec2) {
    if (vec1.dimension !== vec2.dimension) {
      throw new Error("Vectors must have the same dimension");
    }
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    for (let i = 0; i < vec1.dimension; i++) {
      dotProduct += vec1.values[i] * vec2.values[i];
      norm1 += vec1.values[i] * vec1.values[i];
      norm2 += vec2.values[i] * vec2.values[i];
    }
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
};
export {
  AIProvider,
  ChatClient,
  ChatSession,
  EmbeddingService,
  GeminiAIService,
  OpenAIProvider,
  RAGOrchestrator,
  VertexAIProvider,
  createGeminiCloudFunction,
  getGeminiService,
  initializeGeminiService,
  initializeGeminiWithFirebase
};
