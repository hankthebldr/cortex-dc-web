import {
  openDB
} from "./chunk-45BCUNX3.mjs";
import "./chunk-2RCBK75L.mjs";

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

// src/services/ai-insights-client.ts
var getBaseUrl = () => {
  const fromEnv = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
  const sanitized = fromEnv && fromEnv.trim().length > 0 ? fromEnv.trim().replace(/\/$/, "") : "";
  return sanitized || "/api";
};
async function callCloudFunction(payload) {
  const base = getBaseUrl();
  if (!base) {
    throw new Error("Cloud Functions base URL not configured");
  }
  const res = await fetch(`${base}/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini function error: ${res.status} ${text}`);
  }
  return await res.json();
}
var LOCAL_MODEL_ID = "gemini-simulator";
var createUsage = () => ({
  tokensUsed: 128,
  cost: 0
});
var buildActionItems = () => [
  "Review the recommendation with engagement stakeholders",
  "Align next steps to the current POV milestone plan",
  "Document the decisions in the Cortex DC portal"
];
var buildInsight = (type, title, content, relatedData) => ({
  type,
  title,
  content,
  confidence: 0.72,
  actionItems: buildActionItems(),
  relatedData
});
var buildChatResponse = (message, context, sessionId, artifacts) => {
  const contextSummary = context ? "conversation context has been applied" : "no additional context supplied";
  const artifactSummary = artifacts?.length ? ` ${artifacts.length} artifact${artifacts.length > 1 ? "s" : ""} referenced.` : "";
  const responseBody = {
    response: `Simulated Gemini response for "${message}". The ${contextSummary}.${artifactSummary}`,
    confidence: 0.7,
    tokensUsed: 128,
    model: LOCAL_MODEL_ID,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    sessionId
  };
  return {
    success: true,
    data: responseBody,
    usage: createUsage()
  };
};
var buildInsightResponse = (insight) => ({
  success: true,
  data: insight,
  usage: createUsage()
});
var aiInsightsClient = {
  /**
   * Chat with AI assistant
   * @param message - User message
   * @param context - Optional conversation context
   * @param artifacts - Optional file attachments or data artifacts
   */
  async chat(message, context, artifacts) {
    const base = getBaseUrl();
    const userId = "dc-user";
    const sessionId = `sess_${Date.now()}`;
    if (base) {
      return callCloudFunction({ action: "chat", data: { message, context, artifacts }, userId, sessionId });
    }
    return buildChatResponse(message, context, sessionId, artifacts);
  },
  /**
   * Analyze POV engagement
   * @param pov - POV engagement data
   * @param artifacts - Optional supporting documents
   */
  async analyzePOV(pov, artifacts) {
    const base = getBaseUrl();
    const userId = "dc-user";
    if (base) {
      return callCloudFunction({ action: "analyze_pov", data: { ...pov, artifacts }, userId });
    }
    const insight = buildInsight(
      "recommendation",
      `POV Insights: ${pov?.name || "Customer POV"}`,
      `Based on the supplied engagement data, focus on reinforcing executive sponsorship, validating priority scenarios, and highlighting quantified business outcomes for ${pov?.customer || "the customer"}.`,
      pov
    );
    return buildInsightResponse(insight);
  },
  /**
   * Analyze TRR validation
   * @param trr - TRR data
   * @param artifacts - Optional validation evidence
   */
  async analyzeTRR(trr, artifacts) {
    const base = getBaseUrl();
    const userId = "dc-user";
    if (base) {
      return callCloudFunction({ action: "analyze_trr", data: { ...trr, artifacts }, userId });
    }
    const insight = buildInsight(
      "trr_analysis",
      `Validation Guidance: ${trr?.title || trr?.id || "TRR"}`,
      `Validate the requirement using customer telemetry samples, capture screenshots or log snippets as evidence, and align remediation steps with the documented risk level (${trr?.riskLevel || "medium"}).`,
      trr
    );
    return buildInsightResponse(insight);
  },
  /**
   * Generate detection rule for scenario
   * @param scenario - Scenario definition
   * @param artifacts - Optional supporting data
   */
  async generateDetection(scenario, artifacts) {
    const base = getBaseUrl();
    const userId = "dc-user";
    if (base) {
      return callCloudFunction({ action: "generate_detection", data: { ...scenario, artifacts }, userId });
    }
    const insight = buildInsight(
      "detection_rule",
      `Detection Blueprint: ${scenario?.name || "Scenario"}`,
      `Create a high-fidelity detection aligned to MITRE techniques ${scenario?.mitreMapping?.join(", ") || "TTPs"}, include enrichment for affected assets, and stage an automation playbook for containment.`,
      scenario
    );
    return buildInsightResponse(insight);
  }
};

// ../../node_modules/.pnpm/@firebase+util@1.13.0/node_modules/@firebase/util/dist/postinstall.mjs
var getDefaultsFromPostinstall = () => void 0;

// ../../node_modules/.pnpm/@firebase+util@1.13.0/node_modules/@firebase/util/dist/node-esm/index.node.esm.js
var CONSTANTS = {
  /**
   * @define {boolean} Whether this is the client Node.js SDK.
   */
  NODE_CLIENT: false,
  /**
   * @define {boolean} Whether this is the Admin Node.js SDK.
   */
  NODE_ADMIN: false,
  /**
   * Firebase SDK Version
   */
  SDK_VERSION: "${JSCORE_VERSION}"
};
var stringToByteArray$1 = function(str) {
  const out = [];
  let p = 0;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 128) {
      out[p++] = c;
    } else if (c < 2048) {
      out[p++] = c >> 6 | 192;
      out[p++] = c & 63 | 128;
    } else if ((c & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
      c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
      out[p++] = c >> 18 | 240;
      out[p++] = c >> 12 & 63 | 128;
      out[p++] = c >> 6 & 63 | 128;
      out[p++] = c & 63 | 128;
    } else {
      out[p++] = c >> 12 | 224;
      out[p++] = c >> 6 & 63 | 128;
      out[p++] = c & 63 | 128;
    }
  }
  return out;
};
var byteArrayToString = function(bytes) {
  const out = [];
  let pos = 0, c = 0;
  while (pos < bytes.length) {
    const c1 = bytes[pos++];
    if (c1 < 128) {
      out[c++] = String.fromCharCode(c1);
    } else if (c1 > 191 && c1 < 224) {
      const c2 = bytes[pos++];
      out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
    } else if (c1 > 239 && c1 < 365) {
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];
      const c4 = bytes[pos++];
      const u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 65536;
      out[c++] = String.fromCharCode(55296 + (u >> 10));
      out[c++] = String.fromCharCode(56320 + (u & 1023));
    } else {
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];
      out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
    }
  }
  return out.join("");
};
var base64 = {
  /**
   * Maps bytes to characters.
   */
  byteToCharMap_: null,
  /**
   * Maps characters to bytes.
   */
  charToByteMap_: null,
  /**
   * Maps bytes to websafe characters.
   * @private
   */
  byteToCharMapWebSafe_: null,
  /**
   * Maps websafe characters to bytes.
   * @private
   */
  charToByteMapWebSafe_: null,
  /**
   * Our default alphabet, shared between
   * ENCODED_VALS and ENCODED_VALS_WEBSAFE
   */
  ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /**
   * Our default alphabet. Value 64 (=) is special; it means "nothing."
   */
  get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  },
  /**
   * Our websafe alphabet.
   */
  get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  },
  /**
   * Whether this browser supports the atob and btoa functions. This extension
   * started at Mozilla but is now implemented by many browsers. We use the
   * ASSUME_* variables to avoid pulling in the full useragent detection library
   * but still allowing the standard per-browser compilations.
   *
   */
  HAS_NATIVE_SUPPORT: typeof atob === "function",
  /**
   * Base64-encode an array of bytes.
   *
   * @param input An array of bytes (numbers with
   *     value in [0, 255]) to encode.
   * @param webSafe Boolean indicating we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeByteArray(input, webSafe) {
    if (!Array.isArray(input)) {
      throw Error("encodeByteArray takes an array as a parameter");
    }
    this.init_();
    const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
    const output = [];
    for (let i = 0; i < input.length; i += 3) {
      const byte1 = input[i];
      const haveByte2 = i + 1 < input.length;
      const byte2 = haveByte2 ? input[i + 1] : 0;
      const haveByte3 = i + 2 < input.length;
      const byte3 = haveByte3 ? input[i + 2] : 0;
      const outByte1 = byte1 >> 2;
      const outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
      let outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
      let outByte4 = byte3 & 63;
      if (!haveByte3) {
        outByte4 = 64;
        if (!haveByte2) {
          outByte3 = 64;
        }
      }
      output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
    }
    return output.join("");
  },
  /**
   * Base64-encode a string.
   *
   * @param input A string to encode.
   * @param webSafe If true, we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeString(input, webSafe) {
    if (this.HAS_NATIVE_SUPPORT && !webSafe) {
      return btoa(input);
    }
    return this.encodeByteArray(stringToByteArray$1(input), webSafe);
  },
  /**
   * Base64-decode a string.
   *
   * @param input to decode.
   * @param webSafe True if we should use the
   *     alternative alphabet.
   * @return string representing the decoded value.
   */
  decodeString(input, webSafe) {
    if (this.HAS_NATIVE_SUPPORT && !webSafe) {
      return atob(input);
    }
    return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
  },
  /**
   * Base64-decode a string.
   *
   * In base-64 decoding, groups of four characters are converted into three
   * bytes.  If the encoder did not apply padding, the input length may not
   * be a multiple of 4.
   *
   * In this case, the last group will have fewer than 4 characters, and
   * padding will be inferred.  If the group has one or two characters, it decodes
   * to one byte.  If the group has three characters, it decodes to two bytes.
   *
   * @param input Input to decode.
   * @param webSafe True if we should use the web-safe alphabet.
   * @return bytes representing the decoded value.
   */
  decodeStringToByteArray(input, webSafe) {
    this.init_();
    const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
    const output = [];
    for (let i = 0; i < input.length; ) {
      const byte1 = charToByteMap[input.charAt(i++)];
      const haveByte2 = i < input.length;
      const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
      ++i;
      const haveByte3 = i < input.length;
      const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
      ++i;
      const haveByte4 = i < input.length;
      const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
      ++i;
      if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
        throw new DecodeBase64StringError();
      }
      const outByte1 = byte1 << 2 | byte2 >> 4;
      output.push(outByte1);
      if (byte3 !== 64) {
        const outByte2 = byte2 << 4 & 240 | byte3 >> 2;
        output.push(outByte2);
        if (byte4 !== 64) {
          const outByte3 = byte3 << 6 & 192 | byte4;
          output.push(outByte3);
        }
      }
    }
    return output;
  },
  /**
   * Lazy static initialization function. Called before
   * accessing any of the static map variables.
   * @private
   */
  init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {};
      this.charToByteMap_ = {};
      this.byteToCharMapWebSafe_ = {};
      this.charToByteMapWebSafe_ = {};
      for (let i = 0; i < this.ENCODED_VALS.length; i++) {
        this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
        this.charToByteMap_[this.byteToCharMap_[i]] = i;
        this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
        this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
        if (i >= this.ENCODED_VALS_BASE.length) {
          this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
          this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
        }
      }
    }
  }
};
var DecodeBase64StringError = class extends Error {
  constructor() {
    super(...arguments);
    this.name = "DecodeBase64StringError";
  }
};
var base64Encode = function(str) {
  const utf8Bytes = stringToByteArray$1(str);
  return base64.encodeByteArray(utf8Bytes, true);
};
var base64urlEncodeWithoutPadding = function(str) {
  return base64Encode(str).replace(/\./g, "");
};
var base64Decode = function(str) {
  try {
    return base64.decodeString(str, true);
  } catch (e) {
    console.error("base64Decode failed: ", e);
  }
  return null;
};
function getGlobal() {
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("Unable to locate global object.");
}
var getDefaultsFromGlobal = () => getGlobal().__FIREBASE_DEFAULTS__;
var getDefaultsFromEnvVariable = () => {
  if (typeof process === "undefined" || typeof process.env === "undefined") {
    return;
  }
  const defaultsJsonString = process.env.__FIREBASE_DEFAULTS__;
  if (defaultsJsonString) {
    return JSON.parse(defaultsJsonString);
  }
};
var getDefaultsFromCookie = () => {
  if (typeof document === "undefined") {
    return;
  }
  let match;
  try {
    match = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
  } catch (e) {
    return;
  }
  const decoded = match && base64Decode(match[1]);
  return decoded && JSON.parse(decoded);
};
var getDefaults = () => {
  try {
    return getDefaultsFromPostinstall() || getDefaultsFromGlobal() || getDefaultsFromEnvVariable() || getDefaultsFromCookie();
  } catch (e) {
    console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
    return;
  }
};
var getDefaultAppConfig = () => getDefaults()?.config;
var Deferred = class {
  constructor() {
    this.reject = () => {
    };
    this.resolve = () => {
    };
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  /**
   * Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
   * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
   * and returns a node-style callback which will resolve or reject the Deferred's promise.
   */
  wrapCallback(callback) {
    return (error, value) => {
      if (error) {
        this.reject(error);
      } else {
        this.resolve(value);
      }
      if (typeof callback === "function") {
        this.promise.catch(() => {
        });
        if (callback.length === 1) {
          callback(error);
        } else {
          callback(error, value);
        }
      }
    };
  }
};
function isIndexedDBAvailable() {
  try {
    return typeof indexedDB === "object";
  } catch (e) {
    return false;
  }
}
function validateIndexedDBOpenable() {
  return new Promise((resolve, reject) => {
    try {
      let preExist = true;
      const DB_CHECK_NAME = "validate-browser-context-for-indexeddb-analytics-module";
      const request = self.indexedDB.open(DB_CHECK_NAME);
      request.onsuccess = () => {
        request.result.close();
        if (!preExist) {
          self.indexedDB.deleteDatabase(DB_CHECK_NAME);
        }
        resolve(true);
      };
      request.onupgradeneeded = () => {
        preExist = false;
      };
      request.onerror = () => {
        reject(request.error?.message || "");
      };
    } catch (error) {
      reject(error);
    }
  });
}
var ERROR_NAME = "FirebaseError";
var FirebaseError = class _FirebaseError extends Error {
  constructor(code, message, customData) {
    super(message);
    this.code = code;
    this.customData = customData;
    this.name = ERROR_NAME;
    Object.setPrototypeOf(this, _FirebaseError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorFactory.prototype.create);
    }
  }
};
var ErrorFactory = class {
  constructor(service, serviceName, errors) {
    this.service = service;
    this.serviceName = serviceName;
    this.errors = errors;
  }
  create(code, ...data) {
    const customData = data[0] || {};
    const fullCode = `${this.service}/${code}`;
    const template = this.errors[code];
    const message = template ? replaceTemplate(template, customData) : "Error";
    const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
    const error = new FirebaseError(fullCode, fullMessage, customData);
    return error;
  }
};
function replaceTemplate(template, data) {
  return template.replace(PATTERN, (_, key) => {
    const value = data[key];
    return value != null ? String(value) : `<${key}?>`;
  });
}
var PATTERN = /\{\$([^}]+)}/g;
function deepEqual(a, b) {
  if (a === b) {
    return true;
  }
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  for (const k of aKeys) {
    if (!bKeys.includes(k)) {
      return false;
    }
    const aProp = a[k];
    const bProp = b[k];
    if (isObject(aProp) && isObject(bProp)) {
      if (!deepEqual(aProp, bProp)) {
        return false;
      }
    } else if (aProp !== bProp) {
      return false;
    }
  }
  for (const k of bKeys) {
    if (!aKeys.includes(k)) {
      return false;
    }
  }
  return true;
}
function isObject(thing) {
  return thing !== null && typeof thing === "object";
}
var MAX_VALUE_MILLIS = 4 * 60 * 60 * 1e3;
function getModularInstance(service) {
  if (service && service._delegate) {
    return service._delegate;
  } else {
    return service;
  }
}
CONSTANTS.NODE_CLIENT = true;

// ../../node_modules/.pnpm/@firebase+component@0.7.0/node_modules/@firebase/component/dist/esm/index.esm.js
var Component = class {
  /**
   *
   * @param name The public service name, e.g. app, auth, firestore, database
   * @param instanceFactory Service factory responsible for creating the public interface
   * @param type whether the service provided by the component is public or private
   */
  constructor(name3, instanceFactory, type) {
    this.name = name3;
    this.instanceFactory = instanceFactory;
    this.type = type;
    this.multipleInstances = false;
    this.serviceProps = {};
    this.instantiationMode = "LAZY";
    this.onInstanceCreated = null;
  }
  setInstantiationMode(mode) {
    this.instantiationMode = mode;
    return this;
  }
  setMultipleInstances(multipleInstances) {
    this.multipleInstances = multipleInstances;
    return this;
  }
  setServiceProps(props) {
    this.serviceProps = props;
    return this;
  }
  setInstanceCreatedCallback(callback) {
    this.onInstanceCreated = callback;
    return this;
  }
};
var DEFAULT_ENTRY_NAME = "[DEFAULT]";
var Provider = class {
  constructor(name3, container) {
    this.name = name3;
    this.container = container;
    this.component = null;
    this.instances = /* @__PURE__ */ new Map();
    this.instancesDeferred = /* @__PURE__ */ new Map();
    this.instancesOptions = /* @__PURE__ */ new Map();
    this.onInitCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * @param identifier A provider can provide multiple instances of a service
   * if this.component.multipleInstances is true.
   */
  get(identifier) {
    const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
    if (!this.instancesDeferred.has(normalizedIdentifier)) {
      const deferred = new Deferred();
      this.instancesDeferred.set(normalizedIdentifier, deferred);
      if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
        try {
          const instance = this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier
          });
          if (instance) {
            deferred.resolve(instance);
          }
        } catch (e) {
        }
      }
    }
    return this.instancesDeferred.get(normalizedIdentifier).promise;
  }
  getImmediate(options) {
    const normalizedIdentifier = this.normalizeInstanceIdentifier(options?.identifier);
    const optional = options?.optional ?? false;
    if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
      try {
        return this.getOrInitializeService({
          instanceIdentifier: normalizedIdentifier
        });
      } catch (e) {
        if (optional) {
          return null;
        } else {
          throw e;
        }
      }
    } else {
      if (optional) {
        return null;
      } else {
        throw Error(`Service ${this.name} is not available`);
      }
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(component) {
    if (component.name !== this.name) {
      throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
    }
    if (this.component) {
      throw Error(`Component for ${this.name} has already been provided`);
    }
    this.component = component;
    if (!this.shouldAutoInitialize()) {
      return;
    }
    if (isComponentEager(component)) {
      try {
        this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME });
      } catch (e) {
      }
    }
    for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
      const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
      try {
        const instance = this.getOrInitializeService({
          instanceIdentifier: normalizedIdentifier
        });
        instanceDeferred.resolve(instance);
      } catch (e) {
      }
    }
  }
  clearInstance(identifier = DEFAULT_ENTRY_NAME) {
    this.instancesDeferred.delete(identifier);
    this.instancesOptions.delete(identifier);
    this.instances.delete(identifier);
  }
  // app.delete() will call this method on every provider to delete the services
  // TODO: should we mark the provider as deleted?
  async delete() {
    const services = Array.from(this.instances.values());
    await Promise.all([
      ...services.filter((service) => "INTERNAL" in service).map((service) => service.INTERNAL.delete()),
      ...services.filter((service) => "_delete" in service).map((service) => service._delete())
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(identifier = DEFAULT_ENTRY_NAME) {
    return this.instances.has(identifier);
  }
  getOptions(identifier = DEFAULT_ENTRY_NAME) {
    return this.instancesOptions.get(identifier) || {};
  }
  initialize(opts = {}) {
    const { options = {} } = opts;
    const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
    if (this.isInitialized(normalizedIdentifier)) {
      throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
    }
    if (!this.isComponentSet()) {
      throw Error(`Component ${this.name} has not been registered yet`);
    }
    const instance = this.getOrInitializeService({
      instanceIdentifier: normalizedIdentifier,
      options
    });
    for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
      const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
      if (normalizedIdentifier === normalizedDeferredIdentifier) {
        instanceDeferred.resolve(instance);
      }
    }
    return instance;
  }
  /**
   *
   * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
   * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
   *
   * @param identifier An optional instance identifier
   * @returns a function to unregister the callback
   */
  onInit(callback, identifier) {
    const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
    const existingCallbacks = this.onInitCallbacks.get(normalizedIdentifier) ?? /* @__PURE__ */ new Set();
    existingCallbacks.add(callback);
    this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
    const existingInstance = this.instances.get(normalizedIdentifier);
    if (existingInstance) {
      callback(existingInstance, normalizedIdentifier);
    }
    return () => {
      existingCallbacks.delete(callback);
    };
  }
  /**
   * Invoke onInit callbacks synchronously
   * @param instance the service instance`
   */
  invokeOnInitCallbacks(instance, identifier) {
    const callbacks = this.onInitCallbacks.get(identifier);
    if (!callbacks) {
      return;
    }
    for (const callback of callbacks) {
      try {
        callback(instance, identifier);
      } catch {
      }
    }
  }
  getOrInitializeService({ instanceIdentifier, options = {} }) {
    let instance = this.instances.get(instanceIdentifier);
    if (!instance && this.component) {
      instance = this.component.instanceFactory(this.container, {
        instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
        options
      });
      this.instances.set(instanceIdentifier, instance);
      this.instancesOptions.set(instanceIdentifier, options);
      this.invokeOnInitCallbacks(instance, instanceIdentifier);
      if (this.component.onInstanceCreated) {
        try {
          this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
        } catch {
        }
      }
    }
    return instance || null;
  }
  normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME) {
    if (this.component) {
      return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME;
    } else {
      return identifier;
    }
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== "EXPLICIT";
  }
};
function normalizeIdentifierForFactory(identifier) {
  return identifier === DEFAULT_ENTRY_NAME ? void 0 : identifier;
}
function isComponentEager(component) {
  return component.instantiationMode === "EAGER";
}
var ComponentContainer = class {
  constructor(name3) {
    this.name = name3;
    this.providers = /* @__PURE__ */ new Map();
  }
  /**
   *
   * @param component Component being added
   * @param overwrite When a component with the same name has already been registered,
   * if overwrite is true: overwrite the existing component with the new component and create a new
   * provider with the new component. It can be useful in tests where you want to use different mocks
   * for different tests.
   * if overwrite is false: throw an exception
   */
  addComponent(component) {
    const provider = this.getProvider(component.name);
    if (provider.isComponentSet()) {
      throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
    }
    provider.setComponent(component);
  }
  addOrOverwriteComponent(component) {
    const provider = this.getProvider(component.name);
    if (provider.isComponentSet()) {
      this.providers.delete(component.name);
    }
    this.addComponent(component);
  }
  /**
   * getProvider provides a type safe interface where it can only be called with a field name
   * present in NameServiceMapping interface.
   *
   * Firebase SDKs providing services should extend NameServiceMapping interface to register
   * themselves.
   */
  getProvider(name3) {
    if (this.providers.has(name3)) {
      return this.providers.get(name3);
    }
    const provider = new Provider(name3, this);
    this.providers.set(name3, provider);
    return provider;
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
};

// ../../node_modules/.pnpm/@firebase+logger@0.5.0/node_modules/@firebase/logger/dist/esm/index.esm.js
var instances = [];
var LogLevel;
(function(LogLevel2) {
  LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
  LogLevel2[LogLevel2["VERBOSE"] = 1] = "VERBOSE";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
  LogLevel2[LogLevel2["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
var levelStringToEnum = {
  "debug": LogLevel.DEBUG,
  "verbose": LogLevel.VERBOSE,
  "info": LogLevel.INFO,
  "warn": LogLevel.WARN,
  "error": LogLevel.ERROR,
  "silent": LogLevel.SILENT
};
var defaultLogLevel = LogLevel.INFO;
var ConsoleMethod = {
  [LogLevel.DEBUG]: "log",
  [LogLevel.VERBOSE]: "log",
  [LogLevel.INFO]: "info",
  [LogLevel.WARN]: "warn",
  [LogLevel.ERROR]: "error"
};
var defaultLogHandler = (instance, logType, ...args) => {
  if (logType < instance.logLevel) {
    return;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const method = ConsoleMethod[logType];
  if (method) {
    console[method](`[${now}]  ${instance.name}:`, ...args);
  } else {
    throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
  }
};
var Logger = class {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(name3) {
    this.name = name3;
    this._logLevel = defaultLogLevel;
    this._logHandler = defaultLogHandler;
    this._userLogHandler = null;
    instances.push(this);
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(val) {
    if (!(val in LogLevel)) {
      throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
    }
    this._logLevel = val;
  }
  // Workaround for setter/getter having to be the same type.
  setLogLevel(val) {
    this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(val) {
    if (typeof val !== "function") {
      throw new TypeError("Value assigned to `logHandler` must be a function");
    }
    this._logHandler = val;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(val) {
    this._userLogHandler = val;
  }
  /**
   * The functions below are all based on the `console` interface
   */
  debug(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
    this._logHandler(this, LogLevel.DEBUG, ...args);
  }
  log(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
    this._logHandler(this, LogLevel.VERBOSE, ...args);
  }
  info(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
    this._logHandler(this, LogLevel.INFO, ...args);
  }
  warn(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
    this._logHandler(this, LogLevel.WARN, ...args);
  }
  error(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
    this._logHandler(this, LogLevel.ERROR, ...args);
  }
};

// ../../node_modules/.pnpm/@firebase+app@0.14.4/node_modules/@firebase/app/dist/esm/index.esm.js
var PlatformLoggerServiceImpl = class {
  constructor(container) {
    this.container = container;
  }
  // In initial implementation, this will be called by installations on
  // auth token refresh, and installations will send this string.
  getPlatformInfoString() {
    const providers = this.container.getProviders();
    return providers.map((provider) => {
      if (isVersionServiceProvider(provider)) {
        const service = provider.getImmediate();
        return `${service.library}/${service.version}`;
      } else {
        return null;
      }
    }).filter((logString) => logString).join(" ");
  }
};
function isVersionServiceProvider(provider) {
  const component = provider.getComponent();
  return component?.type === "VERSION";
}
var name$q = "@firebase/app";
var version$1 = "0.14.4";
var logger = new Logger("@firebase/app");
var name$p = "@firebase/app-compat";
var name$o = "@firebase/analytics-compat";
var name$n = "@firebase/analytics";
var name$m = "@firebase/app-check-compat";
var name$l = "@firebase/app-check";
var name$k = "@firebase/auth";
var name$j = "@firebase/auth-compat";
var name$i = "@firebase/database";
var name$h = "@firebase/data-connect";
var name$g = "@firebase/database-compat";
var name$f = "@firebase/functions";
var name$e = "@firebase/functions-compat";
var name$d = "@firebase/installations";
var name$c = "@firebase/installations-compat";
var name$b = "@firebase/messaging";
var name$a = "@firebase/messaging-compat";
var name$9 = "@firebase/performance";
var name$8 = "@firebase/performance-compat";
var name$7 = "@firebase/remote-config";
var name$6 = "@firebase/remote-config-compat";
var name$5 = "@firebase/storage";
var name$4 = "@firebase/storage-compat";
var name$3 = "@firebase/firestore";
var name$2 = "@firebase/ai";
var name$1 = "@firebase/firestore-compat";
var name = "firebase";
var DEFAULT_ENTRY_NAME2 = "[DEFAULT]";
var PLATFORM_LOG_STRING = {
  [name$q]: "fire-core",
  [name$p]: "fire-core-compat",
  [name$n]: "fire-analytics",
  [name$o]: "fire-analytics-compat",
  [name$l]: "fire-app-check",
  [name$m]: "fire-app-check-compat",
  [name$k]: "fire-auth",
  [name$j]: "fire-auth-compat",
  [name$i]: "fire-rtdb",
  [name$h]: "fire-data-connect",
  [name$g]: "fire-rtdb-compat",
  [name$f]: "fire-fn",
  [name$e]: "fire-fn-compat",
  [name$d]: "fire-iid",
  [name$c]: "fire-iid-compat",
  [name$b]: "fire-fcm",
  [name$a]: "fire-fcm-compat",
  [name$9]: "fire-perf",
  [name$8]: "fire-perf-compat",
  [name$7]: "fire-rc",
  [name$6]: "fire-rc-compat",
  [name$5]: "fire-gcs",
  [name$4]: "fire-gcs-compat",
  [name$3]: "fire-fst",
  [name$1]: "fire-fst-compat",
  [name$2]: "fire-vertex",
  "fire-js": "fire-js",
  // Platform identifier for JS SDK.
  [name]: "fire-js-all"
};
var _apps = /* @__PURE__ */ new Map();
var _serverApps = /* @__PURE__ */ new Map();
var _components = /* @__PURE__ */ new Map();
function _addComponent(app, component) {
  try {
    app.container.addComponent(component);
  } catch (e) {
    logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
  }
}
function _registerComponent(component) {
  const componentName = component.name;
  if (_components.has(componentName)) {
    logger.debug(`There were multiple attempts to register component ${componentName}.`);
    return false;
  }
  _components.set(componentName, component);
  for (const app of _apps.values()) {
    _addComponent(app, component);
  }
  for (const serverApp of _serverApps.values()) {
    _addComponent(serverApp, component);
  }
  return true;
}
function _getProvider(app, name3) {
  const heartbeatController = app.container.getProvider("heartbeat").getImmediate({ optional: true });
  if (heartbeatController) {
    void heartbeatController.triggerHeartbeat();
  }
  return app.container.getProvider(name3);
}
function _isFirebaseServerApp(obj) {
  if (obj === null || obj === void 0) {
    return false;
  }
  return obj.settings !== void 0;
}
var ERRORS = {
  [
    "no-app"
    /* AppError.NO_APP */
  ]: "No Firebase App '{$appName}' has been created - call initializeApp() first",
  [
    "bad-app-name"
    /* AppError.BAD_APP_NAME */
  ]: "Illegal App name: '{$appName}'",
  [
    "duplicate-app"
    /* AppError.DUPLICATE_APP */
  ]: "Firebase App named '{$appName}' already exists with different options or config",
  [
    "app-deleted"
    /* AppError.APP_DELETED */
  ]: "Firebase App named '{$appName}' already deleted",
  [
    "server-app-deleted"
    /* AppError.SERVER_APP_DELETED */
  ]: "Firebase Server App has been deleted",
  [
    "no-options"
    /* AppError.NO_OPTIONS */
  ]: "Need to provide options, when not being deployed to hosting via source.",
  [
    "invalid-app-argument"
    /* AppError.INVALID_APP_ARGUMENT */
  ]: "firebase.{$appName}() takes either no argument or a Firebase App instance.",
  [
    "invalid-log-argument"
    /* AppError.INVALID_LOG_ARGUMENT */
  ]: "First argument to `onLog` must be null or a function.",
  [
    "idb-open"
    /* AppError.IDB_OPEN */
  ]: "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-get"
    /* AppError.IDB_GET */
  ]: "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-set"
    /* AppError.IDB_WRITE */
  ]: "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-delete"
    /* AppError.IDB_DELETE */
  ]: "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "finalization-registry-not-supported"
    /* AppError.FINALIZATION_REGISTRY_NOT_SUPPORTED */
  ]: "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
  [
    "invalid-server-app-environment"
    /* AppError.INVALID_SERVER_APP_ENVIRONMENT */
  ]: "FirebaseServerApp is not for use in browser environments."
};
var ERROR_FACTORY = new ErrorFactory("app", "Firebase", ERRORS);
var FirebaseAppImpl = class {
  constructor(options, config, container) {
    this._isDeleted = false;
    this._options = { ...options };
    this._config = { ...config };
    this._name = config.name;
    this._automaticDataCollectionEnabled = config.automaticDataCollectionEnabled;
    this._container = container;
    this.container.addComponent(new Component(
      "app",
      () => this,
      "PUBLIC"
      /* ComponentType.PUBLIC */
    ));
  }
  get automaticDataCollectionEnabled() {
    this.checkDestroyed();
    return this._automaticDataCollectionEnabled;
  }
  set automaticDataCollectionEnabled(val) {
    this.checkDestroyed();
    this._automaticDataCollectionEnabled = val;
  }
  get name() {
    this.checkDestroyed();
    return this._name;
  }
  get options() {
    this.checkDestroyed();
    return this._options;
  }
  get config() {
    this.checkDestroyed();
    return this._config;
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(val) {
    this._isDeleted = val;
  }
  /**
   * This function will throw an Error if the App has already been deleted -
   * use before performing API actions on the App.
   */
  checkDestroyed() {
    if (this.isDeleted) {
      throw ERROR_FACTORY.create("app-deleted", { appName: this._name });
    }
  }
};
function initializeApp(_options, rawConfig = {}) {
  let options = _options;
  if (typeof rawConfig !== "object") {
    const name4 = rawConfig;
    rawConfig = { name: name4 };
  }
  const config = {
    name: DEFAULT_ENTRY_NAME2,
    automaticDataCollectionEnabled: true,
    ...rawConfig
  };
  const name3 = config.name;
  if (typeof name3 !== "string" || !name3) {
    throw ERROR_FACTORY.create("bad-app-name", {
      appName: String(name3)
    });
  }
  options || (options = getDefaultAppConfig());
  if (!options) {
    throw ERROR_FACTORY.create(
      "no-options"
      /* AppError.NO_OPTIONS */
    );
  }
  const existingApp = _apps.get(name3);
  if (existingApp) {
    if (deepEqual(options, existingApp.options) && deepEqual(config, existingApp.config)) {
      return existingApp;
    } else {
      throw ERROR_FACTORY.create("duplicate-app", { appName: name3 });
    }
  }
  const container = new ComponentContainer(name3);
  for (const component of _components.values()) {
    container.addComponent(component);
  }
  const newApp = new FirebaseAppImpl(options, config, container);
  _apps.set(name3, newApp);
  return newApp;
}
function getApp(name3 = DEFAULT_ENTRY_NAME2) {
  const app = _apps.get(name3);
  if (!app && name3 === DEFAULT_ENTRY_NAME2 && getDefaultAppConfig()) {
    return initializeApp();
  }
  if (!app) {
    throw ERROR_FACTORY.create("no-app", { appName: name3 });
  }
  return app;
}
function registerVersion(libraryKeyOrName, version2, variant) {
  let library = PLATFORM_LOG_STRING[libraryKeyOrName] ?? libraryKeyOrName;
  if (variant) {
    library += `-${variant}`;
  }
  const libraryMismatch = library.match(/\s|\//);
  const versionMismatch = version2.match(/\s|\//);
  if (libraryMismatch || versionMismatch) {
    const warning = [
      `Unable to register library "${library}" with version "${version2}":`
    ];
    if (libraryMismatch) {
      warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
    }
    if (libraryMismatch && versionMismatch) {
      warning.push("and");
    }
    if (versionMismatch) {
      warning.push(`version name "${version2}" contains illegal characters (whitespace or "/")`);
    }
    logger.warn(warning.join(" "));
    return;
  }
  _registerComponent(new Component(
    `${library}-version`,
    () => ({ library, version: version2 }),
    "VERSION"
    /* ComponentType.VERSION */
  ));
}
var DB_NAME = "firebase-heartbeat-database";
var DB_VERSION = 1;
var STORE_NAME = "firebase-heartbeat-store";
var dbPromise = null;
function getDbPromise() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade: (db, oldVersion) => {
        switch (oldVersion) {
          case 0:
            try {
              db.createObjectStore(STORE_NAME);
            } catch (e) {
              console.warn(e);
            }
        }
      }
    }).catch((e) => {
      throw ERROR_FACTORY.create("idb-open", {
        originalErrorMessage: e.message
      });
    });
  }
  return dbPromise;
}
async function readHeartbeatsFromIndexedDB(app) {
  try {
    const db = await getDbPromise();
    const tx = db.transaction(STORE_NAME);
    const result = await tx.objectStore(STORE_NAME).get(computeKey(app));
    await tx.done;
    return result;
  } catch (e) {
    if (e instanceof FirebaseError) {
      logger.warn(e.message);
    } else {
      const idbGetError = ERROR_FACTORY.create("idb-get", {
        originalErrorMessage: e?.message
      });
      logger.warn(idbGetError.message);
    }
  }
}
async function writeHeartbeatsToIndexedDB(app, heartbeatObject) {
  try {
    const db = await getDbPromise();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const objectStore = tx.objectStore(STORE_NAME);
    await objectStore.put(heartbeatObject, computeKey(app));
    await tx.done;
  } catch (e) {
    if (e instanceof FirebaseError) {
      logger.warn(e.message);
    } else {
      const idbGetError = ERROR_FACTORY.create("idb-set", {
        originalErrorMessage: e?.message
      });
      logger.warn(idbGetError.message);
    }
  }
}
function computeKey(app) {
  return `${app.name}!${app.options.appId}`;
}
var MAX_HEADER_BYTES = 1024;
var MAX_NUM_STORED_HEARTBEATS = 30;
var HeartbeatServiceImpl = class {
  constructor(container) {
    this.container = container;
    this._heartbeatsCache = null;
    const app = this.container.getProvider("app").getImmediate();
    this._storage = new HeartbeatStorageImpl(app);
    this._heartbeatsCachePromise = this._storage.read().then((result) => {
      this._heartbeatsCache = result;
      return result;
    });
  }
  /**
   * Called to report a heartbeat. The function will generate
   * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
   * to IndexedDB.
   * Note that we only store one heartbeat per day. So if a heartbeat for today is
   * already logged, subsequent calls to this function in the same day will be ignored.
   */
  async triggerHeartbeat() {
    try {
      const platformLogger = this.container.getProvider("platform-logger").getImmediate();
      const agent = platformLogger.getPlatformInfoString();
      const date = getUTCDateString();
      if (this._heartbeatsCache?.heartbeats == null) {
        this._heartbeatsCache = await this._heartbeatsCachePromise;
        if (this._heartbeatsCache?.heartbeats == null) {
          return;
        }
      }
      if (this._heartbeatsCache.lastSentHeartbeatDate === date || this._heartbeatsCache.heartbeats.some((singleDateHeartbeat) => singleDateHeartbeat.date === date)) {
        return;
      } else {
        this._heartbeatsCache.heartbeats.push({ date, agent });
        if (this._heartbeatsCache.heartbeats.length > MAX_NUM_STORED_HEARTBEATS) {
          const earliestHeartbeatIdx = getEarliestHeartbeatIdx(this._heartbeatsCache.heartbeats);
          this._heartbeatsCache.heartbeats.splice(earliestHeartbeatIdx, 1);
        }
      }
      return this._storage.overwrite(this._heartbeatsCache);
    } catch (e) {
      logger.warn(e);
    }
  }
  /**
   * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
   * It also clears all heartbeats from memory as well as in IndexedDB.
   *
   * NOTE: Consuming product SDKs should not send the header if this method
   * returns an empty string.
   */
  async getHeartbeatsHeader() {
    try {
      if (this._heartbeatsCache === null) {
        await this._heartbeatsCachePromise;
      }
      if (this._heartbeatsCache?.heartbeats == null || this._heartbeatsCache.heartbeats.length === 0) {
        return "";
      }
      const date = getUTCDateString();
      const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
      const headerString = base64urlEncodeWithoutPadding(JSON.stringify({ version: 2, heartbeats: heartbeatsToSend }));
      this._heartbeatsCache.lastSentHeartbeatDate = date;
      if (unsentEntries.length > 0) {
        this._heartbeatsCache.heartbeats = unsentEntries;
        await this._storage.overwrite(this._heartbeatsCache);
      } else {
        this._heartbeatsCache.heartbeats = [];
        void this._storage.overwrite(this._heartbeatsCache);
      }
      return headerString;
    } catch (e) {
      logger.warn(e);
      return "";
    }
  }
};
function getUTCDateString() {
  const today = /* @__PURE__ */ new Date();
  return today.toISOString().substring(0, 10);
}
function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
  const heartbeatsToSend = [];
  let unsentEntries = heartbeatsCache.slice();
  for (const singleDateHeartbeat of heartbeatsCache) {
    const heartbeatEntry = heartbeatsToSend.find((hb) => hb.agent === singleDateHeartbeat.agent);
    if (!heartbeatEntry) {
      heartbeatsToSend.push({
        agent: singleDateHeartbeat.agent,
        dates: [singleDateHeartbeat.date]
      });
      if (countBytes(heartbeatsToSend) > maxSize) {
        heartbeatsToSend.pop();
        break;
      }
    } else {
      heartbeatEntry.dates.push(singleDateHeartbeat.date);
      if (countBytes(heartbeatsToSend) > maxSize) {
        heartbeatEntry.dates.pop();
        break;
      }
    }
    unsentEntries = unsentEntries.slice(1);
  }
  return {
    heartbeatsToSend,
    unsentEntries
  };
}
var HeartbeatStorageImpl = class {
  constructor(app) {
    this.app = app;
    this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
  }
  async runIndexedDBEnvironmentCheck() {
    if (!isIndexedDBAvailable()) {
      return false;
    } else {
      return validateIndexedDBOpenable().then(() => true).catch(() => false);
    }
  }
  /**
   * Read all heartbeats.
   */
  async read() {
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return { heartbeats: [] };
    } else {
      const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
      if (idbHeartbeatObject?.heartbeats) {
        return idbHeartbeatObject;
      } else {
        return { heartbeats: [] };
      }
    }
  }
  // overwrite the storage with the provided heartbeats
  async overwrite(heartbeatsObject) {
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return;
    } else {
      const existingHeartbeatsObject = await this.read();
      return writeHeartbeatsToIndexedDB(this.app, {
        lastSentHeartbeatDate: heartbeatsObject.lastSentHeartbeatDate ?? existingHeartbeatsObject.lastSentHeartbeatDate,
        heartbeats: heartbeatsObject.heartbeats
      });
    }
  }
  // add heartbeats
  async add(heartbeatsObject) {
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return;
    } else {
      const existingHeartbeatsObject = await this.read();
      return writeHeartbeatsToIndexedDB(this.app, {
        lastSentHeartbeatDate: heartbeatsObject.lastSentHeartbeatDate ?? existingHeartbeatsObject.lastSentHeartbeatDate,
        heartbeats: [
          ...existingHeartbeatsObject.heartbeats,
          ...heartbeatsObject.heartbeats
        ]
      });
    }
  }
};
function countBytes(heartbeatsCache) {
  return base64urlEncodeWithoutPadding(
    // heartbeatsCache wrapper properties
    JSON.stringify({ version: 2, heartbeats: heartbeatsCache })
  ).length;
}
function getEarliestHeartbeatIdx(heartbeats) {
  if (heartbeats.length === 0) {
    return -1;
  }
  let earliestHeartbeatIdx = 0;
  let earliestHeartbeatDate = heartbeats[0].date;
  for (let i = 1; i < heartbeats.length; i++) {
    if (heartbeats[i].date < earliestHeartbeatDate) {
      earliestHeartbeatDate = heartbeats[i].date;
      earliestHeartbeatIdx = i;
    }
  }
  return earliestHeartbeatIdx;
}
function registerCoreComponents(variant) {
  _registerComponent(new Component(
    "platform-logger",
    (container) => new PlatformLoggerServiceImpl(container),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  _registerComponent(new Component(
    "heartbeat",
    (container) => new HeartbeatServiceImpl(container),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  registerVersion(name$q, version$1, variant);
  registerVersion(name$q, version$1, "esm2020");
  registerVersion("fire-js", "");
}
registerCoreComponents("");

// ../../node_modules/.pnpm/@firebase+ai@2.4.0_@firebase+app-types@0.9.3_@firebase+app@0.14.4/node_modules/@firebase/ai/dist/index.node.mjs
var name2 = "@firebase/ai";
var version = "2.4.0";
var AI_TYPE = "AI";
var DEFAULT_LOCATION = "us-central1";
var DEFAULT_DOMAIN = "firebasevertexai.googleapis.com";
var DEFAULT_API_VERSION = "v1beta";
var PACKAGE_VERSION = version;
var LANGUAGE_TAG = "gl-js";
var DEFAULT_FETCH_TIMEOUT_MS = 180 * 1e3;
var DEFAULT_HYBRID_IN_CLOUD_MODEL = "gemini-2.0-flash-lite";
var POSSIBLE_ROLES = ["user", "model", "function", "system"];
var HarmSeverity = {
  /**
   * Negligible level of harm severity.
   */
  HARM_SEVERITY_NEGLIGIBLE: "HARM_SEVERITY_NEGLIGIBLE",
  /**
   * Low level of harm severity.
   */
  HARM_SEVERITY_LOW: "HARM_SEVERITY_LOW",
  /**
   * Medium level of harm severity.
   */
  HARM_SEVERITY_MEDIUM: "HARM_SEVERITY_MEDIUM",
  /**
   * High level of harm severity.
   */
  HARM_SEVERITY_HIGH: "HARM_SEVERITY_HIGH",
  /**
   * Harm severity is not supported.
   *
   * @remarks
   * The GoogleAI backend does not support `HarmSeverity`, so this value is used as a fallback.
   */
  HARM_SEVERITY_UNSUPPORTED: "HARM_SEVERITY_UNSUPPORTED"
};
var FinishReason = {
  /**
   * Natural stop point of the model or provided stop sequence.
   */
  STOP: "STOP",
  /**
   * The maximum number of tokens as specified in the request was reached.
   */
  MAX_TOKENS: "MAX_TOKENS",
  /**
   * The candidate content was flagged for safety reasons.
   */
  SAFETY: "SAFETY",
  /**
   * The candidate content was flagged for recitation reasons.
   */
  RECITATION: "RECITATION",
  /**
   * Unknown reason.
   */
  OTHER: "OTHER",
  /**
   * The candidate content contained forbidden terms.
   */
  BLOCKLIST: "BLOCKLIST",
  /**
   * The candidate content potentially contained prohibited content.
   */
  PROHIBITED_CONTENT: "PROHIBITED_CONTENT",
  /**
   * The candidate content potentially contained Sensitive Personally Identifiable Information (SPII).
   */
  SPII: "SPII",
  /**
   * The function call generated by the model was invalid.
   */
  MALFORMED_FUNCTION_CALL: "MALFORMED_FUNCTION_CALL"
};
var InferenceMode = {
  "PREFER_ON_DEVICE": "prefer_on_device",
  "ONLY_ON_DEVICE": "only_on_device",
  "ONLY_IN_CLOUD": "only_in_cloud",
  "PREFER_IN_CLOUD": "prefer_in_cloud"
};
var AIErrorCode = {
  /** A generic error occurred. */
  ERROR: "error",
  /** An error occurred in a request. */
  REQUEST_ERROR: "request-error",
  /** An error occurred in a response. */
  RESPONSE_ERROR: "response-error",
  /** An error occurred while performing a fetch. */
  FETCH_ERROR: "fetch-error",
  /** An error occurred because an operation was attempted on a closed session. */
  SESSION_CLOSED: "session-closed",
  /** An error associated with a Content object.  */
  INVALID_CONTENT: "invalid-content",
  /** An error due to the Firebase API not being enabled in the Console. */
  API_NOT_ENABLED: "api-not-enabled",
  /** An error due to invalid Schema input.  */
  INVALID_SCHEMA: "invalid-schema",
  /** An error occurred due to a missing Firebase API key. */
  NO_API_KEY: "no-api-key",
  /** An error occurred due to a missing Firebase app ID. */
  NO_APP_ID: "no-app-id",
  /** An error occurred due to a model name not being specified during initialization. */
  NO_MODEL: "no-model",
  /** An error occurred due to a missing project ID. */
  NO_PROJECT_ID: "no-project-id",
  /** An error occurred while parsing. */
  PARSE_FAILED: "parse-failed",
  /** An error occurred due an attempt to use an unsupported feature. */
  UNSUPPORTED: "unsupported"
};
var BackendType = {
  /**
   * Identifies the backend service for the Vertex AI Gemini API provided through Google Cloud.
   * Use this constant when creating a {@link VertexAIBackend} configuration.
   */
  VERTEX_AI: "VERTEX_AI",
  /**
   * Identifies the backend service for the Gemini Developer API ({@link https://ai.google/ | Google AI}).
   * Use this constant when creating a {@link GoogleAIBackend} configuration.
   */
  GOOGLE_AI: "GOOGLE_AI"
};
var Backend = class {
  /**
   * Protected constructor for use by subclasses.
   * @param type - The backend type.
   */
  constructor(type) {
    this.backendType = type;
  }
};
var GoogleAIBackend = class extends Backend {
  /**
   * Creates a configuration object for the Gemini Developer API backend.
   */
  constructor() {
    super(BackendType.GOOGLE_AI);
  }
};
var VertexAIBackend = class extends Backend {
  /**
   * Creates a configuration object for the Vertex AI backend.
   *
   * @param location - The region identifier, defaulting to `us-central1`;
   * see {@link https://firebase.google.com/docs/vertex-ai/locations#available-locations | Vertex AI locations}
   * for a list of supported locations.
   */
  constructor(location = DEFAULT_LOCATION) {
    super(BackendType.VERTEX_AI);
    if (!location) {
      this.location = DEFAULT_LOCATION;
    } else {
      this.location = location;
    }
  }
};
var AIService = class {
  constructor(app, backend, authProvider, appCheckProvider, chromeAdapterFactory) {
    this.app = app;
    this.backend = backend;
    this.chromeAdapterFactory = chromeAdapterFactory;
    const appCheck = appCheckProvider?.getImmediate({ optional: true });
    const auth = authProvider?.getImmediate({ optional: true });
    this.auth = auth || null;
    this.appCheck = appCheck || null;
    if (backend instanceof VertexAIBackend) {
      this.location = backend.location;
    } else {
      this.location = "";
    }
  }
  _delete() {
    return Promise.resolve();
  }
  set options(optionsToSet) {
    this._options = optionsToSet;
  }
  get options() {
    return this._options;
  }
};
var AIError = class _AIError extends FirebaseError {
  /**
   * Constructs a new instance of the `AIError` class.
   *
   * @param code - The error code from {@link (AIErrorCode:type)}.
   * @param message - A human-readable message describing the error.
   * @param customErrorData - Optional error data.
   */
  constructor(code, message, customErrorData) {
    const service = AI_TYPE;
    const fullCode = `${service}/${code}`;
    const fullMessage = `${service}: ${message} (${fullCode})`;
    super(code, fullMessage);
    this.code = code;
    this.customErrorData = customErrorData;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _AIError);
    }
    Object.setPrototypeOf(this, _AIError.prototype);
    this.toString = () => fullMessage;
  }
};
function encodeInstanceIdentifier(backend) {
  if (backend instanceof GoogleAIBackend) {
    return `${AI_TYPE}/googleai`;
  } else if (backend instanceof VertexAIBackend) {
    return `${AI_TYPE}/vertexai/${backend.location}`;
  } else {
    throw new AIError(AIErrorCode.ERROR, `Invalid backend: ${JSON.stringify(backend.backendType)}`);
  }
}
function decodeInstanceIdentifier(instanceIdentifier) {
  const identifierParts = instanceIdentifier.split("/");
  if (identifierParts[0] !== AI_TYPE) {
    throw new AIError(AIErrorCode.ERROR, `Invalid instance identifier, unknown prefix '${identifierParts[0]}'`);
  }
  const backendType = identifierParts[1];
  switch (backendType) {
    case "vertexai":
      const location = identifierParts[2];
      if (!location) {
        throw new AIError(AIErrorCode.ERROR, `Invalid instance identifier, unknown location '${instanceIdentifier}'`);
      }
      return new VertexAIBackend(location);
    case "googleai":
      return new GoogleAIBackend();
    default:
      throw new AIError(AIErrorCode.ERROR, `Invalid instance identifier string: '${instanceIdentifier}'`);
  }
}
var AIModel = class _AIModel {
  /**
   * Constructs a new instance of the {@link AIModel} class.
   *
   * This constructor should only be called from subclasses that provide
   * a model API.
   *
   * @param ai - an {@link AI} instance.
   * @param modelName - The name of the model being used. It can be in one of the following formats:
   * - `my-model` (short name, will resolve to `publishers/google/models/my-model`)
   * - `models/my-model` (will resolve to `publishers/google/models/my-model`)
   * - `publishers/my-publisher/models/my-model` (fully qualified model name)
   *
   * @throws If the `apiKey` or `projectId` fields are missing in your
   * Firebase config.
   *
   * @internal
   */
  constructor(ai, modelName) {
    if (!ai.app?.options?.apiKey) {
      throw new AIError(AIErrorCode.NO_API_KEY, `The "apiKey" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid API key.`);
    } else if (!ai.app?.options?.projectId) {
      throw new AIError(AIErrorCode.NO_PROJECT_ID, `The "projectId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid project ID.`);
    } else if (!ai.app?.options?.appId) {
      throw new AIError(AIErrorCode.NO_APP_ID, `The "appId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid app ID.`);
    } else {
      this._apiSettings = {
        apiKey: ai.app.options.apiKey,
        project: ai.app.options.projectId,
        appId: ai.app.options.appId,
        automaticDataCollectionEnabled: ai.app.automaticDataCollectionEnabled,
        location: ai.location,
        backend: ai.backend
      };
      if (_isFirebaseServerApp(ai.app) && ai.app.settings.appCheckToken) {
        const token = ai.app.settings.appCheckToken;
        this._apiSettings.getAppCheckToken = () => {
          return Promise.resolve({ token });
        };
      } else if (ai.appCheck) {
        if (ai.options?.useLimitedUseAppCheckTokens) {
          this._apiSettings.getAppCheckToken = () => ai.appCheck.getLimitedUseToken();
        } else {
          this._apiSettings.getAppCheckToken = () => ai.appCheck.getToken();
        }
      }
      if (ai.auth) {
        this._apiSettings.getAuthToken = () => ai.auth.getToken();
      }
      this.model = _AIModel.normalizeModelName(modelName, this._apiSettings.backend.backendType);
    }
  }
  /**
   * Normalizes the given model name to a fully qualified model resource name.
   *
   * @param modelName - The model name to normalize.
   * @returns The fully qualified model resource name.
   *
   * @internal
   */
  static normalizeModelName(modelName, backendType) {
    if (backendType === BackendType.GOOGLE_AI) {
      return _AIModel.normalizeGoogleAIModelName(modelName);
    } else {
      return _AIModel.normalizeVertexAIModelName(modelName);
    }
  }
  /**
   * @internal
   */
  static normalizeGoogleAIModelName(modelName) {
    return `models/${modelName}`;
  }
  /**
   * @internal
   */
  static normalizeVertexAIModelName(modelName) {
    let model;
    if (modelName.includes("/")) {
      if (modelName.startsWith("models/")) {
        model = `publishers/google/${modelName}`;
      } else {
        model = modelName;
      }
    } else {
      model = `publishers/google/models/${modelName}`;
    }
    return model;
  }
};
var logger2 = new Logger("@firebase/vertexai");
var Task;
(function(Task2) {
  Task2["GENERATE_CONTENT"] = "generateContent";
  Task2["STREAM_GENERATE_CONTENT"] = "streamGenerateContent";
  Task2["COUNT_TOKENS"] = "countTokens";
  Task2["PREDICT"] = "predict";
})(Task || (Task = {}));
var RequestUrl = class {
  constructor(model, task, apiSettings, stream, requestOptions) {
    this.model = model;
    this.task = task;
    this.apiSettings = apiSettings;
    this.stream = stream;
    this.requestOptions = requestOptions;
  }
  toString() {
    const url = new URL(this.baseUrl);
    url.pathname = `/${this.apiVersion}/${this.modelPath}:${this.task}`;
    url.search = this.queryParams.toString();
    return url.toString();
  }
  get baseUrl() {
    return this.requestOptions?.baseUrl || `https://${DEFAULT_DOMAIN}`;
  }
  get apiVersion() {
    return DEFAULT_API_VERSION;
  }
  get modelPath() {
    if (this.apiSettings.backend instanceof GoogleAIBackend) {
      return `projects/${this.apiSettings.project}/${this.model}`;
    } else if (this.apiSettings.backend instanceof VertexAIBackend) {
      return `projects/${this.apiSettings.project}/locations/${this.apiSettings.backend.location}/${this.model}`;
    } else {
      throw new AIError(AIErrorCode.ERROR, `Invalid backend: ${JSON.stringify(this.apiSettings.backend)}`);
    }
  }
  get queryParams() {
    const params = new URLSearchParams();
    if (this.stream) {
      params.set("alt", "sse");
    }
    return params;
  }
};
function getClientHeaders() {
  const loggingTags = [];
  loggingTags.push(`${LANGUAGE_TAG}/${PACKAGE_VERSION}`);
  loggingTags.push(`fire/${PACKAGE_VERSION}`);
  return loggingTags.join(" ");
}
async function getHeaders(url) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("x-goog-api-client", getClientHeaders());
  headers.append("x-goog-api-key", url.apiSettings.apiKey);
  if (url.apiSettings.automaticDataCollectionEnabled) {
    headers.append("X-Firebase-Appid", url.apiSettings.appId);
  }
  if (url.apiSettings.getAppCheckToken) {
    const appCheckToken = await url.apiSettings.getAppCheckToken();
    if (appCheckToken) {
      headers.append("X-Firebase-AppCheck", appCheckToken.token);
      if (appCheckToken.error) {
        logger2.warn(`Unable to obtain a valid App Check token: ${appCheckToken.error.message}`);
      }
    }
  }
  if (url.apiSettings.getAuthToken) {
    const authToken = await url.apiSettings.getAuthToken();
    if (authToken) {
      headers.append("Authorization", `Firebase ${authToken.accessToken}`);
    }
  }
  return headers;
}
async function constructRequest(model, task, apiSettings, stream, body, requestOptions) {
  const url = new RequestUrl(model, task, apiSettings, stream, requestOptions);
  return {
    url: url.toString(),
    fetchOptions: {
      method: "POST",
      headers: await getHeaders(url),
      body
    }
  };
}
async function makeRequest(model, task, apiSettings, stream, body, requestOptions) {
  const url = new RequestUrl(model, task, apiSettings, stream, requestOptions);
  let response;
  let fetchTimeoutId;
  try {
    const request = await constructRequest(model, task, apiSettings, stream, body, requestOptions);
    const timeoutMillis = requestOptions?.timeout != null && requestOptions.timeout >= 0 ? requestOptions.timeout : DEFAULT_FETCH_TIMEOUT_MS;
    const abortController = new AbortController();
    fetchTimeoutId = setTimeout(() => abortController.abort(), timeoutMillis);
    request.fetchOptions.signal = abortController.signal;
    response = await fetch(request.url, request.fetchOptions);
    if (!response.ok) {
      let message = "";
      let errorDetails;
      try {
        const json = await response.json();
        message = json.error.message;
        if (json.error.details) {
          message += ` ${JSON.stringify(json.error.details)}`;
          errorDetails = json.error.details;
        }
      } catch (e) {
      }
      if (response.status === 403 && errorDetails && errorDetails.some((detail) => detail.reason === "SERVICE_DISABLED") && errorDetails.some((detail) => detail.links?.[0]?.description.includes("Google developers console API activation"))) {
        throw new AIError(AIErrorCode.API_NOT_ENABLED, `The Firebase AI SDK requires the Firebase AI API ('firebasevertexai.googleapis.com') to be enabled in your Firebase project. Enable this API by visiting the Firebase Console at https://console.firebase.google.com/project/${url.apiSettings.project}/genai/ and clicking "Get started". If you enabled this API recently, wait a few minutes for the action to propagate to our systems and then retry.`, {
          status: response.status,
          statusText: response.statusText,
          errorDetails
        });
      }
      throw new AIError(AIErrorCode.FETCH_ERROR, `Error fetching from ${url}: [${response.status} ${response.statusText}] ${message}`, {
        status: response.status,
        statusText: response.statusText,
        errorDetails
      });
    }
  } catch (e) {
    let err = e;
    if (e.code !== AIErrorCode.FETCH_ERROR && e.code !== AIErrorCode.API_NOT_ENABLED && e instanceof Error) {
      err = new AIError(AIErrorCode.ERROR, `Error fetching from ${url.toString()}: ${e.message}`);
      err.stack = e.stack;
    }
    throw err;
  } finally {
    if (fetchTimeoutId) {
      clearTimeout(fetchTimeoutId);
    }
  }
  return response;
}
function hasValidCandidates(response) {
  if (response.candidates && response.candidates.length > 0) {
    if (response.candidates.length > 1) {
      logger2.warn(`This response had ${response.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`);
    }
    if (hadBadFinishReason(response.candidates[0])) {
      throw new AIError(AIErrorCode.RESPONSE_ERROR, `Response error: ${formatBlockErrorMessage(response)}. Response body stored in error.response`, {
        response
      });
    }
    return true;
  } else {
    return false;
  }
}
function createEnhancedContentResponse(response) {
  if (response.candidates && !response.candidates[0].hasOwnProperty("index")) {
    response.candidates[0].index = 0;
  }
  const responseWithHelpers = addHelpers(response);
  return responseWithHelpers;
}
function addHelpers(response) {
  response.text = () => {
    if (hasValidCandidates(response)) {
      return getText(response, (part) => !part.thought);
    } else if (response.promptFeedback) {
      throw new AIError(AIErrorCode.RESPONSE_ERROR, `Text not available. ${formatBlockErrorMessage(response)}`, {
        response
      });
    }
    return "";
  };
  response.thoughtSummary = () => {
    if (hasValidCandidates(response)) {
      const result = getText(response, (part) => !!part.thought);
      return result === "" ? void 0 : result;
    } else if (response.promptFeedback) {
      throw new AIError(AIErrorCode.RESPONSE_ERROR, `Thought summary not available. ${formatBlockErrorMessage(response)}`, {
        response
      });
    }
    return void 0;
  };
  response.inlineDataParts = () => {
    if (hasValidCandidates(response)) {
      return getInlineDataParts(response);
    } else if (response.promptFeedback) {
      throw new AIError(AIErrorCode.RESPONSE_ERROR, `Data not available. ${formatBlockErrorMessage(response)}`, {
        response
      });
    }
    return void 0;
  };
  response.functionCalls = () => {
    if (hasValidCandidates(response)) {
      return getFunctionCalls(response);
    } else if (response.promptFeedback) {
      throw new AIError(AIErrorCode.RESPONSE_ERROR, `Function call not available. ${formatBlockErrorMessage(response)}`, {
        response
      });
    }
    return void 0;
  };
  return response;
}
function getText(response, partFilter) {
  const textStrings = [];
  if (response.candidates?.[0].content?.parts) {
    for (const part of response.candidates?.[0].content?.parts) {
      if (part.text && partFilter(part)) {
        textStrings.push(part.text);
      }
    }
  }
  if (textStrings.length > 0) {
    return textStrings.join("");
  } else {
    return "";
  }
}
function getFunctionCalls(response) {
  const functionCalls = [];
  if (response.candidates?.[0].content?.parts) {
    for (const part of response.candidates?.[0].content?.parts) {
      if (part.functionCall) {
        functionCalls.push(part.functionCall);
      }
    }
  }
  if (functionCalls.length > 0) {
    return functionCalls;
  } else {
    return void 0;
  }
}
function getInlineDataParts(response) {
  const data = [];
  if (response.candidates?.[0].content?.parts) {
    for (const part of response.candidates?.[0].content?.parts) {
      if (part.inlineData) {
        data.push(part);
      }
    }
  }
  if (data.length > 0) {
    return data;
  } else {
    return void 0;
  }
}
var badFinishReasons = [FinishReason.RECITATION, FinishReason.SAFETY];
function hadBadFinishReason(candidate) {
  return !!candidate.finishReason && badFinishReasons.some((reason) => reason === candidate.finishReason);
}
function formatBlockErrorMessage(response) {
  let message = "";
  if ((!response.candidates || response.candidates.length === 0) && response.promptFeedback) {
    message += "Response was blocked";
    if (response.promptFeedback?.blockReason) {
      message += ` due to ${response.promptFeedback.blockReason}`;
    }
    if (response.promptFeedback?.blockReasonMessage) {
      message += `: ${response.promptFeedback.blockReasonMessage}`;
    }
  } else if (response.candidates?.[0]) {
    const firstCandidate = response.candidates[0];
    if (hadBadFinishReason(firstCandidate)) {
      message += `Candidate was blocked due to ${firstCandidate.finishReason}`;
      if (firstCandidate.finishMessage) {
        message += `: ${firstCandidate.finishMessage}`;
      }
    }
  }
  return message;
}
function mapGenerateContentRequest(generateContentRequest) {
  generateContentRequest.safetySettings?.forEach((safetySetting) => {
    if (safetySetting.method) {
      throw new AIError(AIErrorCode.UNSUPPORTED, "SafetySetting.method is not supported in the the Gemini Developer API. Please remove this property.");
    }
  });
  if (generateContentRequest.generationConfig?.topK) {
    const roundedTopK = Math.round(generateContentRequest.generationConfig.topK);
    if (roundedTopK !== generateContentRequest.generationConfig.topK) {
      logger2.warn("topK in GenerationConfig has been rounded to the nearest integer to match the format for requests to the Gemini Developer API.");
      generateContentRequest.generationConfig.topK = roundedTopK;
    }
  }
  return generateContentRequest;
}
function mapGenerateContentResponse(googleAIResponse) {
  const generateContentResponse = {
    candidates: googleAIResponse.candidates ? mapGenerateContentCandidates(googleAIResponse.candidates) : void 0,
    prompt: googleAIResponse.promptFeedback ? mapPromptFeedback(googleAIResponse.promptFeedback) : void 0,
    usageMetadata: googleAIResponse.usageMetadata
  };
  return generateContentResponse;
}
function mapCountTokensRequest(countTokensRequest, model) {
  const mappedCountTokensRequest = {
    generateContentRequest: {
      model,
      ...countTokensRequest
    }
  };
  return mappedCountTokensRequest;
}
function mapGenerateContentCandidates(candidates) {
  const mappedCandidates = [];
  let mappedSafetyRatings;
  if (mappedCandidates) {
    candidates.forEach((candidate) => {
      let citationMetadata;
      if (candidate.citationMetadata) {
        citationMetadata = {
          citations: candidate.citationMetadata.citationSources
        };
      }
      if (candidate.safetyRatings) {
        mappedSafetyRatings = candidate.safetyRatings.map((safetyRating) => {
          return {
            ...safetyRating,
            severity: safetyRating.severity ?? HarmSeverity.HARM_SEVERITY_UNSUPPORTED,
            probabilityScore: safetyRating.probabilityScore ?? 0,
            severityScore: safetyRating.severityScore ?? 0
          };
        });
      }
      if (candidate.content?.parts?.some((part) => part?.videoMetadata)) {
        throw new AIError(AIErrorCode.UNSUPPORTED, "Part.videoMetadata is not supported in the Gemini Developer API. Please remove this property.");
      }
      const mappedCandidate = {
        index: candidate.index,
        content: candidate.content,
        finishReason: candidate.finishReason,
        finishMessage: candidate.finishMessage,
        safetyRatings: mappedSafetyRatings,
        citationMetadata,
        groundingMetadata: candidate.groundingMetadata,
        urlContextMetadata: candidate.urlContextMetadata
      };
      mappedCandidates.push(mappedCandidate);
    });
  }
  return mappedCandidates;
}
function mapPromptFeedback(promptFeedback) {
  const mappedSafetyRatings = [];
  promptFeedback.safetyRatings.forEach((safetyRating) => {
    mappedSafetyRatings.push({
      category: safetyRating.category,
      probability: safetyRating.probability,
      severity: safetyRating.severity ?? HarmSeverity.HARM_SEVERITY_UNSUPPORTED,
      probabilityScore: safetyRating.probabilityScore ?? 0,
      severityScore: safetyRating.severityScore ?? 0,
      blocked: safetyRating.blocked
    });
  });
  const mappedPromptFeedback = {
    blockReason: promptFeedback.blockReason,
    safetyRatings: mappedSafetyRatings,
    blockReasonMessage: promptFeedback.blockReasonMessage
  };
  return mappedPromptFeedback;
}
var responseLineRE = /^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;
function processStream(response, apiSettings) {
  const inputStream = response.body.pipeThrough(new TextDecoderStream("utf8", { fatal: true }));
  const responseStream = getResponseStream(inputStream);
  const [stream1, stream2] = responseStream.tee();
  return {
    stream: generateResponseSequence(stream1, apiSettings),
    response: getResponsePromise(stream2, apiSettings)
  };
}
async function getResponsePromise(stream, apiSettings) {
  const allResponses = [];
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      let generateContentResponse = aggregateResponses(allResponses);
      if (apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
        generateContentResponse = mapGenerateContentResponse(generateContentResponse);
      }
      return createEnhancedContentResponse(generateContentResponse);
    }
    allResponses.push(value);
  }
}
async function* generateResponseSequence(stream, apiSettings) {
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    let enhancedResponse;
    if (apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
      enhancedResponse = createEnhancedContentResponse(mapGenerateContentResponse(value));
    } else {
      enhancedResponse = createEnhancedContentResponse(value);
    }
    const firstCandidate = enhancedResponse.candidates?.[0];
    if (!firstCandidate?.content?.parts && !firstCandidate?.finishReason && !firstCandidate?.citationMetadata && !firstCandidate?.urlContextMetadata) {
      continue;
    }
    yield enhancedResponse;
  }
}
function getResponseStream(inputStream) {
  const reader = inputStream.getReader();
  const stream = new ReadableStream({
    start(controller) {
      let currentText = "";
      return pump();
      function pump() {
        return reader.read().then(({ value, done }) => {
          if (done) {
            if (currentText.trim()) {
              controller.error(new AIError(AIErrorCode.PARSE_FAILED, "Failed to parse stream"));
              return;
            }
            controller.close();
            return;
          }
          currentText += value;
          let match = currentText.match(responseLineRE);
          let parsedResponse;
          while (match) {
            try {
              parsedResponse = JSON.parse(match[1]);
            } catch (e) {
              controller.error(new AIError(AIErrorCode.PARSE_FAILED, `Error parsing JSON response: "${match[1]}`));
              return;
            }
            controller.enqueue(parsedResponse);
            currentText = currentText.substring(match[0].length);
            match = currentText.match(responseLineRE);
          }
          return pump();
        });
      }
    }
  });
  return stream;
}
function aggregateResponses(responses) {
  const lastResponse = responses[responses.length - 1];
  const aggregatedResponse = {
    promptFeedback: lastResponse?.promptFeedback
  };
  for (const response of responses) {
    if (response.candidates) {
      for (const candidate of response.candidates) {
        const i = candidate.index || 0;
        if (!aggregatedResponse.candidates) {
          aggregatedResponse.candidates = [];
        }
        if (!aggregatedResponse.candidates[i]) {
          aggregatedResponse.candidates[i] = {
            index: candidate.index
          };
        }
        aggregatedResponse.candidates[i].citationMetadata = candidate.citationMetadata;
        aggregatedResponse.candidates[i].finishReason = candidate.finishReason;
        aggregatedResponse.candidates[i].finishMessage = candidate.finishMessage;
        aggregatedResponse.candidates[i].safetyRatings = candidate.safetyRatings;
        aggregatedResponse.candidates[i].groundingMetadata = candidate.groundingMetadata;
        const urlContextMetadata = candidate.urlContextMetadata;
        if (typeof urlContextMetadata === "object" && urlContextMetadata !== null && Object.keys(urlContextMetadata).length > 0) {
          aggregatedResponse.candidates[i].urlContextMetadata = urlContextMetadata;
        }
        if (candidate.content) {
          if (!candidate.content.parts) {
            continue;
          }
          if (!aggregatedResponse.candidates[i].content) {
            aggregatedResponse.candidates[i].content = {
              role: candidate.content.role || "user",
              parts: []
            };
          }
          for (const part of candidate.content.parts) {
            const newPart = { ...part };
            if (part.text === "") {
              continue;
            }
            if (Object.keys(newPart).length > 0) {
              aggregatedResponse.candidates[i].content.parts.push(newPart);
            }
          }
        }
      }
    }
  }
  return aggregatedResponse;
}
var errorsCausingFallback = [
  // most network errors
  AIErrorCode.FETCH_ERROR,
  // fallback code for all other errors in makeRequest
  AIErrorCode.ERROR,
  // error due to API not being enabled in project
  AIErrorCode.API_NOT_ENABLED
];
async function callCloudOrDevice(request, chromeAdapter, onDeviceCall, inCloudCall) {
  if (!chromeAdapter) {
    return inCloudCall();
  }
  switch (chromeAdapter.mode) {
    case InferenceMode.ONLY_ON_DEVICE:
      if (await chromeAdapter.isAvailable(request)) {
        return onDeviceCall();
      }
      throw new AIError(AIErrorCode.UNSUPPORTED, "Inference mode is ONLY_ON_DEVICE, but an on-device model is not available.");
    case InferenceMode.ONLY_IN_CLOUD:
      return inCloudCall();
    case InferenceMode.PREFER_IN_CLOUD:
      try {
        return await inCloudCall();
      } catch (e) {
        if (e instanceof AIError && errorsCausingFallback.includes(e.code)) {
          return onDeviceCall();
        }
        throw e;
      }
    case InferenceMode.PREFER_ON_DEVICE:
      if (await chromeAdapter.isAvailable(request)) {
        return onDeviceCall();
      }
      return inCloudCall();
    default:
      throw new AIError(AIErrorCode.ERROR, `Unexpected infererence mode: ${chromeAdapter.mode}`);
  }
}
async function generateContentStreamOnCloud(apiSettings, model, params, requestOptions) {
  if (apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
    params = mapGenerateContentRequest(params);
  }
  return makeRequest(
    model,
    Task.STREAM_GENERATE_CONTENT,
    apiSettings,
    /* stream */
    true,
    JSON.stringify(params),
    requestOptions
  );
}
async function generateContentStream(apiSettings, model, params, chromeAdapter, requestOptions) {
  const response = await callCloudOrDevice(params, chromeAdapter, () => chromeAdapter.generateContentStream(params), () => generateContentStreamOnCloud(apiSettings, model, params, requestOptions));
  return processStream(response, apiSettings);
}
async function generateContentOnCloud(apiSettings, model, params, requestOptions) {
  if (apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
    params = mapGenerateContentRequest(params);
  }
  return makeRequest(
    model,
    Task.GENERATE_CONTENT,
    apiSettings,
    /* stream */
    false,
    JSON.stringify(params),
    requestOptions
  );
}
async function generateContent(apiSettings, model, params, chromeAdapter, requestOptions) {
  const response = await callCloudOrDevice(params, chromeAdapter, () => chromeAdapter.generateContent(params), () => generateContentOnCloud(apiSettings, model, params, requestOptions));
  const generateContentResponse = await processGenerateContentResponse(response, apiSettings);
  const enhancedResponse = createEnhancedContentResponse(generateContentResponse);
  return {
    response: enhancedResponse
  };
}
async function processGenerateContentResponse(response, apiSettings) {
  const responseJson = await response.json();
  if (apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
    return mapGenerateContentResponse(responseJson);
  } else {
    return responseJson;
  }
}
function formatSystemInstruction(input) {
  if (input == null) {
    return void 0;
  } else if (typeof input === "string") {
    return { role: "system", parts: [{ text: input }] };
  } else if (input.text) {
    return { role: "system", parts: [input] };
  } else if (input.parts) {
    if (!input.role) {
      return { role: "system", parts: input.parts };
    } else {
      return input;
    }
  }
}
function formatNewContent(request) {
  let newParts = [];
  if (typeof request === "string") {
    newParts = [{ text: request }];
  } else {
    for (const partOrString of request) {
      if (typeof partOrString === "string") {
        newParts.push({ text: partOrString });
      } else {
        newParts.push(partOrString);
      }
    }
  }
  return assignRoleToPartsAndValidateSendMessageRequest(newParts);
}
function assignRoleToPartsAndValidateSendMessageRequest(parts) {
  const userContent = { role: "user", parts: [] };
  const functionContent = { role: "function", parts: [] };
  let hasUserContent = false;
  let hasFunctionContent = false;
  for (const part of parts) {
    if ("functionResponse" in part) {
      functionContent.parts.push(part);
      hasFunctionContent = true;
    } else {
      userContent.parts.push(part);
      hasUserContent = true;
    }
  }
  if (hasUserContent && hasFunctionContent) {
    throw new AIError(AIErrorCode.INVALID_CONTENT, "Within a single message, FunctionResponse cannot be mixed with other type of Part in the request for sending chat message.");
  }
  if (!hasUserContent && !hasFunctionContent) {
    throw new AIError(AIErrorCode.INVALID_CONTENT, "No Content is provided for sending chat message.");
  }
  if (hasUserContent) {
    return userContent;
  }
  return functionContent;
}
function formatGenerateContentInput(params) {
  let formattedRequest;
  if (params.contents) {
    formattedRequest = params;
  } else {
    const content = formatNewContent(params);
    formattedRequest = { contents: [content] };
  }
  if (params.systemInstruction) {
    formattedRequest.systemInstruction = formatSystemInstruction(params.systemInstruction);
  }
  return formattedRequest;
}
var VALID_PART_FIELDS = [
  "text",
  "inlineData",
  "functionCall",
  "functionResponse",
  "thought",
  "thoughtSignature"
];
var VALID_PARTS_PER_ROLE = {
  user: ["text", "inlineData"],
  function: ["functionResponse"],
  model: ["text", "functionCall", "thought", "thoughtSignature"],
  // System instructions shouldn't be in history anyway.
  system: ["text"]
};
var VALID_PREVIOUS_CONTENT_ROLES = {
  user: ["model"],
  function: ["model"],
  model: ["user", "function"],
  // System instructions shouldn't be in history.
  system: []
};
function validateChatHistory(history) {
  let prevContent = null;
  for (const currContent of history) {
    const { role, parts } = currContent;
    if (!prevContent && role !== "user") {
      throw new AIError(AIErrorCode.INVALID_CONTENT, `First Content should be with role 'user', got ${role}`);
    }
    if (!POSSIBLE_ROLES.includes(role)) {
      throw new AIError(AIErrorCode.INVALID_CONTENT, `Each item should include role field. Got ${role} but valid roles are: ${JSON.stringify(POSSIBLE_ROLES)}`);
    }
    if (!Array.isArray(parts)) {
      throw new AIError(AIErrorCode.INVALID_CONTENT, `Content should have 'parts' property with an array of Parts`);
    }
    if (parts.length === 0) {
      throw new AIError(AIErrorCode.INVALID_CONTENT, `Each Content should have at least one part`);
    }
    const countFields = {
      text: 0,
      inlineData: 0,
      functionCall: 0,
      functionResponse: 0,
      thought: 0,
      thoughtSignature: 0,
      executableCode: 0,
      codeExecutionResult: 0
    };
    for (const part of parts) {
      for (const key of VALID_PART_FIELDS) {
        if (key in part) {
          countFields[key] += 1;
        }
      }
    }
    const validParts = VALID_PARTS_PER_ROLE[role];
    for (const key of VALID_PART_FIELDS) {
      if (!validParts.includes(key) && countFields[key] > 0) {
        throw new AIError(AIErrorCode.INVALID_CONTENT, `Content with role '${role}' can't contain '${key}' part`);
      }
    }
    if (prevContent) {
      const validPreviousContentRoles = VALID_PREVIOUS_CONTENT_ROLES[role];
      if (!validPreviousContentRoles.includes(prevContent.role)) {
        throw new AIError(AIErrorCode.INVALID_CONTENT, `Content with role '${role}' can't follow '${prevContent.role}'. Valid previous roles: ${JSON.stringify(VALID_PREVIOUS_CONTENT_ROLES)}`);
      }
    }
    prevContent = currContent;
  }
}
var SILENT_ERROR = "SILENT_ERROR";
var ChatSession = class {
  constructor(apiSettings, model, chromeAdapter, params, requestOptions) {
    this.model = model;
    this.chromeAdapter = chromeAdapter;
    this.params = params;
    this.requestOptions = requestOptions;
    this._history = [];
    this._sendPromise = Promise.resolve();
    this._apiSettings = apiSettings;
    if (params?.history) {
      validateChatHistory(params.history);
      this._history = params.history;
    }
  }
  /**
   * Gets the chat history so far. Blocked prompts are not added to history.
   * Neither blocked candidates nor the prompts that generated them are added
   * to history.
   */
  async getHistory() {
    await this._sendPromise;
    return this._history;
  }
  /**
   * Sends a chat message and receives a non-streaming
   * {@link GenerateContentResult}
   */
  async sendMessage(request) {
    await this._sendPromise;
    const newContent = formatNewContent(request);
    const generateContentRequest = {
      safetySettings: this.params?.safetySettings,
      generationConfig: this.params?.generationConfig,
      tools: this.params?.tools,
      toolConfig: this.params?.toolConfig,
      systemInstruction: this.params?.systemInstruction,
      contents: [...this._history, newContent]
    };
    let finalResult = {};
    this._sendPromise = this._sendPromise.then(() => generateContent(this._apiSettings, this.model, generateContentRequest, this.chromeAdapter, this.requestOptions)).then((result) => {
      if (result.response.candidates && result.response.candidates.length > 0) {
        this._history.push(newContent);
        const responseContent = {
          parts: result.response.candidates?.[0].content.parts || [],
          // Response seems to come back without a role set.
          role: result.response.candidates?.[0].content.role || "model"
        };
        this._history.push(responseContent);
      } else {
        const blockErrorMessage = formatBlockErrorMessage(result.response);
        if (blockErrorMessage) {
          logger2.warn(`sendMessage() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`);
        }
      }
      finalResult = result;
    });
    await this._sendPromise;
    return finalResult;
  }
  /**
   * Sends a chat message and receives the response as a
   * {@link GenerateContentStreamResult} containing an iterable stream
   * and a response promise.
   */
  async sendMessageStream(request) {
    await this._sendPromise;
    const newContent = formatNewContent(request);
    const generateContentRequest = {
      safetySettings: this.params?.safetySettings,
      generationConfig: this.params?.generationConfig,
      tools: this.params?.tools,
      toolConfig: this.params?.toolConfig,
      systemInstruction: this.params?.systemInstruction,
      contents: [...this._history, newContent]
    };
    const streamPromise = generateContentStream(this._apiSettings, this.model, generateContentRequest, this.chromeAdapter, this.requestOptions);
    this._sendPromise = this._sendPromise.then(() => streamPromise).catch((_ignored) => {
      throw new Error(SILENT_ERROR);
    }).then((streamResult) => streamResult.response).then((response) => {
      if (response.candidates && response.candidates.length > 0) {
        this._history.push(newContent);
        const responseContent = { ...response.candidates[0].content };
        if (!responseContent.role) {
          responseContent.role = "model";
        }
        this._history.push(responseContent);
      } else {
        const blockErrorMessage = formatBlockErrorMessage(response);
        if (blockErrorMessage) {
          logger2.warn(`sendMessageStream() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`);
        }
      }
    }).catch((e) => {
      if (e.message !== SILENT_ERROR) {
        logger2.error(e);
      }
    });
    return streamPromise;
  }
};
async function countTokensOnCloud(apiSettings, model, params, requestOptions) {
  let body = "";
  if (apiSettings.backend.backendType === BackendType.GOOGLE_AI) {
    const mappedParams = mapCountTokensRequest(params, model);
    body = JSON.stringify(mappedParams);
  } else {
    body = JSON.stringify(params);
  }
  const response = await makeRequest(model, Task.COUNT_TOKENS, apiSettings, false, body, requestOptions);
  return response.json();
}
async function countTokens(apiSettings, model, params, chromeAdapter, requestOptions) {
  if (chromeAdapter?.mode === InferenceMode.ONLY_ON_DEVICE) {
    throw new AIError(AIErrorCode.UNSUPPORTED, "countTokens() is not supported for on-device models.");
  }
  return countTokensOnCloud(apiSettings, model, params, requestOptions);
}
var GenerativeModel = class extends AIModel {
  constructor(ai, modelParams, requestOptions, chromeAdapter) {
    super(ai, modelParams.model);
    this.chromeAdapter = chromeAdapter;
    this.generationConfig = modelParams.generationConfig || {};
    this.safetySettings = modelParams.safetySettings || [];
    this.tools = modelParams.tools;
    this.toolConfig = modelParams.toolConfig;
    this.systemInstruction = formatSystemInstruction(modelParams.systemInstruction);
    this.requestOptions = requestOptions || {};
  }
  /**
   * Makes a single non-streaming call to the model
   * and returns an object containing a single {@link GenerateContentResponse}.
   */
  async generateContent(request) {
    const formattedParams = formatGenerateContentInput(request);
    return generateContent(this._apiSettings, this.model, {
      generationConfig: this.generationConfig,
      safetySettings: this.safetySettings,
      tools: this.tools,
      toolConfig: this.toolConfig,
      systemInstruction: this.systemInstruction,
      ...formattedParams
    }, this.chromeAdapter, this.requestOptions);
  }
  /**
   * Makes a single streaming call to the model
   * and returns an object containing an iterable stream that iterates
   * over all chunks in the streaming response as well as
   * a promise that returns the final aggregated response.
   */
  async generateContentStream(request) {
    const formattedParams = formatGenerateContentInput(request);
    return generateContentStream(this._apiSettings, this.model, {
      generationConfig: this.generationConfig,
      safetySettings: this.safetySettings,
      tools: this.tools,
      toolConfig: this.toolConfig,
      systemInstruction: this.systemInstruction,
      ...formattedParams
    }, this.chromeAdapter, this.requestOptions);
  }
  /**
   * Gets a new {@link ChatSession} instance which can be used for
   * multi-turn chats.
   */
  startChat(startChatParams) {
    return new ChatSession(this._apiSettings, this.model, this.chromeAdapter, {
      tools: this.tools,
      toolConfig: this.toolConfig,
      systemInstruction: this.systemInstruction,
      generationConfig: this.generationConfig,
      safetySettings: this.safetySettings,
      /**
       * Overrides params inherited from GenerativeModel with those explicitly set in the
       * StartChatParams. For example, if startChatParams.generationConfig is set, it'll override
       * this.generationConfig.
       */
      ...startChatParams
    }, this.requestOptions);
  }
  /**
   * Counts the tokens in the provided request.
   */
  async countTokens(request) {
    const formattedParams = formatGenerateContentInput(request);
    return countTokens(this._apiSettings, this.model, formattedParams, this.chromeAdapter);
  }
};
var AUDIO_PROCESSOR_NAME = "audio-processor";
var audioProcessorWorkletString = `
  class AudioProcessor extends AudioWorkletProcessor {
    constructor(options) {
      super();
      this.targetSampleRate = options.processorOptions.targetSampleRate;
      // 'sampleRate' is a global variable available inside the AudioWorkletGlobalScope,
      // representing the native sample rate of the AudioContext.
      this.inputSampleRate = sampleRate;
    }

    /**
     * This method is called by the browser's audio engine for each block of audio data.
     * Input is a single input, with a single channel (input[0][0]).
     */
    process(inputs) {
      const input = inputs[0];
      if (input && input.length > 0 && input[0].length > 0) {
        const pcmData = input[0]; // Float32Array of raw audio samples.
        
        // Simple linear interpolation for resampling.
        const resampled = new Float32Array(Math.round(pcmData.length * this.targetSampleRate / this.inputSampleRate));
        const ratio = pcmData.length / resampled.length;
        for (let i = 0; i < resampled.length; i++) {
          resampled[i] = pcmData[Math.floor(i * ratio)];
        }

        // Convert Float32 (-1, 1) samples to Int16 (-32768, 32767)
        const resampledInt16 = new Int16Array(resampled.length);
        for (let i = 0; i < resampled.length; i++) {
          const sample = Math.max(-1, Math.min(1, resampled[i]));
          if (sample < 0) {
            resampledInt16[i] = sample * 32768;
          } else {
            resampledInt16[i] = sample * 32767;
          }
        }
        
        this.port.postMessage(resampledInt16);
      }
      // Return true to keep the processor alive and processing the next audio block.
      return true;
    }
  }

  // Register the processor with a name that can be used to instantiate it from the main thread.
  registerProcessor('${AUDIO_PROCESSOR_NAME}', AudioProcessor);
`;
function getAI(app = getApp(), options) {
  app = getModularInstance(app);
  const AIProvider2 = _getProvider(app, AI_TYPE);
  const backend = options?.backend ?? new GoogleAIBackend();
  const finalOptions = {
    useLimitedUseAppCheckTokens: options?.useLimitedUseAppCheckTokens ?? false
  };
  const identifier = encodeInstanceIdentifier(backend);
  const aiInstance = AIProvider2.getImmediate({
    identifier
  });
  aiInstance.options = finalOptions;
  return aiInstance;
}
function getGenerativeModel(ai, modelParams, requestOptions) {
  const hybridParams = modelParams;
  let inCloudParams;
  if (hybridParams.mode) {
    inCloudParams = hybridParams.inCloudParams || {
      model: DEFAULT_HYBRID_IN_CLOUD_MODEL
    };
  } else {
    inCloudParams = modelParams;
  }
  if (!inCloudParams.model) {
    throw new AIError(AIErrorCode.NO_MODEL, `Must provide a model name. Example: getGenerativeModel({ model: 'my-model-name' })`);
  }
  const chromeAdapter = ai.chromeAdapterFactory?.(hybridParams.mode, typeof window === "undefined" ? void 0 : window, hybridParams.onDeviceParams);
  return new GenerativeModel(ai, inCloudParams, requestOptions, chromeAdapter);
}
function registerAI() {
  _registerComponent(new Component(
    AI_TYPE,
    (container, { instanceIdentifier }) => {
      if (!instanceIdentifier) {
        throw new AIError(AIErrorCode.ERROR, "AIService instance identifier is undefined.");
      }
      const backend = decodeInstanceIdentifier(instanceIdentifier);
      const app = container.getProvider("app").getImmediate();
      const auth = container.getProvider("auth-internal");
      const appCheckProvider = container.getProvider("app-check-internal");
      return new AIService(app, backend, auth, appCheckProvider);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setMultipleInstances(true));
  registerVersion(name2, version, "node");
  registerVersion(name2, version, "esm2020");
}
registerAI();

// src/services/firebase-ai-logic-service.ts
var GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
var DEFAULT_MODEL = "gemini-2.5-flash";
async function getFirebaseApp() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const db = await import("./src-V4DH5BZF.mjs");
    return db.app || null;
  } catch (error) {
    console.error("Failed to import Firebase app:", error);
    return null;
  }
}
async function initializeAI() {
  if (!GEMINI_API_KEY) {
    console.warn("\u26A0\uFE0F GEMINI_API_KEY not configured. AI features will be disabled.");
    return null;
  }
  if (typeof window === "undefined") {
    console.warn("Firebase AI Logic is only available in browser");
    return null;
  }
  try {
    const firebaseApp = await getFirebaseApp();
    if (!firebaseApp) {
      console.warn("Firebase app not available");
      return null;
    }
    const ai = getAI(firebaseApp, {
      backend: new GoogleAIBackend()
    });
    console.log("\u2705 Firebase AI Logic initialized successfully");
    return ai;
  } catch (error) {
    console.error("\u274C Failed to initialize Firebase AI Logic:", error);
    return null;
  }
}
async function getModel(modelName = DEFAULT_MODEL) {
  const ai = await initializeAI();
  if (!ai) {
    throw new Error("AI Logic not initialized. Check GEMINI_API_KEY configuration.");
  }
  return getGenerativeModel(ai, { model: modelName });
}
async function generateContent2(prompt, modelName) {
  try {
    const model = await getModel(modelName);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error(`Failed to generate content: ${error}`);
  }
}
async function* generateContentStream2(prompt, modelName) {
  try {
    const model = await getModel(modelName);
    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error) {
    console.error("Error generating streaming content:", error);
    throw new Error(`Failed to generate streaming content: ${error}`);
  }
}
async function generatePOVRecommendations(customerScenario, industry, challenges) {
  const prompt = `
You are a Palo Alto Networks Cortex Cloud Detection and Response expert.

Customer Scenario: ${customerScenario}
${industry ? `Industry: ${industry}` : ""}
${challenges?.length ? `Key Challenges: ${challenges.join(", ")}` : ""}

Generate a comprehensive POV (Proof of Value) recommendation including:
1. Recommended detection scenarios
2. Cloud security use cases
3. MITRE ATT&CK mappings
4. Success metrics
5. Timeline and milestones

Format the response in markdown with clear sections.
`;
  return generateContent2(prompt);
}
async function generateDetectionScenario(attackTechnique, cloudProvider) {
  const prompt = `
Generate a Cloud Detection and Response scenario for:

Attack Technique: ${attackTechnique}
Cloud Provider: ${cloudProvider}

Include:
1. Scenario description
2. Detection logic
3. Response playbook
4. Required data sources
5. MITRE ATT&CK mapping
6. Alert configuration

Format in structured markdown.
`;
  return generateContent2(prompt);
}
async function enhanceKnowledgeBaseContent(content, targetAudience = "security engineers") {
  const prompt = `
Analyze this technical content and provide structured metadata:

Content: ${content}

Target Audience: ${targetAudience}

Provide a JSON response with:
- summary: Brief 2-3 sentence summary
- keywords: Array of 5-10 relevant keywords
- suggestedTags: Array of 3-5 tags for categorization
- complexity: One of [beginner, intermediate, advanced, expert]
- relatedTopics: Array of 3-5 related topics

Return ONLY valid JSON, no additional text.
`;
  const response = await generateContent2(prompt);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Invalid AI response format");
  }
}
async function generateCommandSuggestions(context, previousCommands) {
  const prompt = `
Given this context and command history, suggest 5 relevant commands:

Context: ${context}
Previous Commands: ${previousCommands.slice(-5).join(", ")}

Respond with ONLY a JSON array of command strings, no explanation.
Example: ["command1", "command2", "command3", "command4", "command5"]
`;
  const response = await generateContent2(prompt);
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No array found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Failed to parse command suggestions:", error);
    return [];
  }
}
async function healthCheck() {
  try {
    if (!GEMINI_API_KEY) {
      return {
        status: "unavailable",
        message: "GEMINI_API_KEY not configured"
      };
    }
    const testResponse = await generateContent2('Respond with "OK" if you can process this message.');
    if (testResponse) {
      return {
        status: "healthy",
        message: "AI Logic service is operational"
      };
    } else {
      return {
        status: "degraded",
        message: "AI Logic responded but with unexpected output"
      };
    }
  } catch (error) {
    return {
      status: "unavailable",
      message: `AI Logic service error: ${error}`
    };
  }
}

// src/services/dc-ai-client.ts
var dcAIClient = {
  /**
   * POV Planning and Optimization
   * Analyzes POV data and provides strategic optimization recommendations
   */
  async optimizePOVPlan(povData, context) {
    const enhancedData = {
      ...povData,
      workflow: "pov_planning",
      context,
      analysisType: "strategic_optimization"
    };
    const prompt = `As a Palo Alto Networks Domain Consultant AI assistant, analyze this POV plan and provide strategic optimization recommendations:

Customer Profile: ${JSON.stringify(context.customerProfile)}
Engagement Context: ${JSON.stringify(context.engagementData)}
Current POV Data: ${JSON.stringify(povData)}

Provide DC-specific insights on:
1. **Scenario Selection Optimization**: Which security scenarios align best with customer's industry, maturity, and concerns
2. **Timeline Acceleration**: Opportunities to streamline without compromising quality
3. **Stakeholder Engagement**: Recommended touchpoints and demonstration strategies
4. **Risk Mitigation**: Potential blockers and mitigation strategies
5. **Success Metrics**: KPIs that resonate with this customer profile
6. **Resource Allocation**: Optimal consultant time distribution

Format as actionable recommendations with priority levels.`;
    return await aiInsightsClient.chat(prompt, enhancedData);
  },
  /**
   * TRR Validation Intelligence
   * Analyzes TRRs and provides validation acceleration insights
   */
  async accelerateTRRValidation(trrData, context) {
    const prompt = `As a Domain Consultant AI, analyze these TRRs and provide validation acceleration insights:

TRR Portfolio: ${JSON.stringify(trrData)}
Customer Context: ${JSON.stringify(context.customerProfile)}
Engagement Progress: ${JSON.stringify(context.workInProgress)}

Provide DC workflow optimization:
1. **Validation Priority Matrix**: Which TRRs should be validated first based on customer impact
2. **Automation Opportunities**: TRRs that can be bulk validated or scripted
3. **Customer Demo Integration**: TRRs that can be validated during live demonstrations
4. **Risk-Based Sequencing**: Optimal validation order to mitigate engagement risks
5. **Resource Efficiency**: Ways to validate multiple TRRs simultaneously
6. **Evidence Collection**: Most effective ways to gather validation evidence

Focus on practical DC workflows and time savings.`;
    return await aiInsightsClient.analyzeTRR({ ...trrData, context, workflow: "validation_acceleration" });
  },
  /**
   * Scenario Selection and Customer Fit
   * Recommends optimal security scenarios for customer profile
   */
  async recommendScenarios(customerProfile, context) {
    const prompt = `As a Palo Alto Networks DC AI, recommend optimal security scenarios for this customer:

Customer Profile:
- Industry: ${customerProfile.industry}
- Organization Size: ${customerProfile.size}
- Security Maturity: ${customerProfile.maturityLevel}
- Primary Concerns: ${customerProfile.primaryConcerns?.join(", ")}
- Tech Stack: ${customerProfile.techStack?.join(", ")}

Engagement Context: ${JSON.stringify(context.engagementData)}

Provide scenario recommendations with:
1. **Primary Scenarios** (3-4 high-impact scenarios that directly address customer concerns)
2. **Supporting Scenarios** (2-3 scenarios that demonstrate platform breadth)
3. **Demo Flow Optimization** (recommended order and transitions between scenarios)
4. **Customer Resonance Factors** (why each scenario will resonate with this customer)
5. **Customization Opportunities** (how to tailor scenarios to customer environment)
6. **Business Case Alignment** (how scenarios support customer's business objectives)

Focus on scenarios that create "aha moments" and accelerate buying decisions.`;
    return await aiInsightsClient.generateDetection({
      type: "scenario_recommendation",
      customerProfile,
      context,
      analysisType: "customer_fit_optimization"
    });
  },
  /**
   * Engagement Summary and Next Steps
   * Creates comprehensive engagement summary with recommendations
   */
  async generateEngagementSummary(engagementData, context) {
    const prompt = `As a Domain Consultant AI, create an executive engagement summary:

Engagement Data: ${JSON.stringify(engagementData)}
Customer Context: ${JSON.stringify(context.customerProfile)}
Work Progress: ${JSON.stringify(context.workInProgress)}

Generate a comprehensive DC engagement summary including:
1. **Executive Summary**: High-level engagement status and outcomes
2. **Key Accomplishments**: Measurable progress and wins
3. **Customer Insights**: What we learned about customer needs and environment
4. **Technical Validation Status**: TRR completion and POV results
5. **Next Steps**: Prioritized action items with owners and timelines
6. **Risk Assessment**: Potential blockers and mitigation strategies
7. **Business Case Reinforcement**: ROI indicators and value demonstrated
8. **Stakeholder Engagement**: Recommended follow-up activities

Format for executive consumption with clear next steps and success metrics.`;
    const response = await aiInsightsClient.chat(prompt, { ...engagementData, context, workflow: "engagement_summary" });
    return {
      workflowType: context.workflowType,
      currentStatus: "Analysis Complete",
      keyAccomplishments: ["POV scenarios executed", "TRRs validated", "Technical requirements confirmed"],
      upcomingMilestones: ["Executive presentation", "Technical deep dive", "Proposal submission"],
      recommendations: [
        {
          type: "next_action",
          priority: "high",
          title: "Schedule Executive Briefing",
          description: "Present POV results to C-level stakeholders",
          actionable: true,
          estimatedImpact: "High - accelerates decision timeline",
          suggestedActions: ["Prepare executive summary", "Schedule 30-min briefing", "Prepare business case slides"]
        }
      ],
      estimatedCompletion: "Within 2 weeks",
      riskFactors: ["Budget approval cycles", "Technical integration complexity"]
    };
  },
  /**
   * Real-time Workflow Assistance
   * Provides immediate guidance for current workflow step
   */
  async getWorkflowGuidance(currentTask, context) {
    const prompt = `As a DC AI assistant, provide real-time guidance for this workflow step:

Current Task: ${currentTask}
Workflow Context: ${JSON.stringify(context)}

Provide immediate, actionable guidance:
1. **Step-by-Step Actions**: Specific tasks to complete this workflow step
2. **Best Practices**: DC-proven approaches for this task
3. **Common Pitfalls**: What to avoid based on DC experience
4. **Time Optimization**: Ways to complete this step more efficiently
5. **Quality Checkpoints**: How to ensure high-quality outcomes
6. **Next Step Prep**: What to prepare for the subsequent workflow step

Focus on practical, immediately actionable advice that accelerates DC success.`;
    return await aiInsightsClient.chat(prompt, { task: currentTask, context, workflow: "real_time_guidance" });
  },
  /**
   * Customer-Specific Intelligence
   * Analyzes customer-solution fit
   */
  async analyzeCustomerFit(customerData, proposedSolution) {
    const prompt = `Analyze customer-solution fit for this DC engagement:

Customer Data: ${JSON.stringify(customerData)}
Proposed Solution: ${JSON.stringify(proposedSolution)}

Provide customer fit analysis:
1. **Alignment Score**: Overall fit rating with reasoning
2. **Strength Areas**: Where solution strongly addresses customer needs
3. **Gap Analysis**: Potential misalignments or concerns
4. **Customization Opportunities**: How to better tailor the approach
5. **Competitive Advantages**: Why Palo Alto Networks is the right choice
6. **Value Proposition**: Quantifiable benefits for this customer
7. **Implementation Roadmap**: Suggested deployment phases
8. **Success Metrics**: How to measure and communicate value

Focus on actionable insights that improve win probability.`;
    return await aiInsightsClient.analyzePOV({
      customerData,
      proposedSolution,
      analysisType: "customer_fit",
      workflow: "customer_analysis"
    });
  },
  /**
   * Intelligent Form Pre-population
   * Suggests form data based on context
   */
  async suggestFormData(formType, context, existingData) {
    const prompt = `As a DC AI, suggest intelligent pre-population for this form:

Form Type: ${formType}
Customer Context: ${JSON.stringify(context.customerProfile)}
Existing Data: ${JSON.stringify(existingData)}
Engagement Context: ${JSON.stringify(context.engagementData)}

Provide form suggestions:
1. **Field Recommendations**: Suggested values for form fields based on customer profile
2. **Smart Defaults**: Intelligent defaults that align with DC best practices
3. **Validation Rules**: Recommended validation based on customer type
4. **Optional Optimizations**: Additional fields that would add value
5. **Pre-filled Templates**: Complete form templates for similar customers

Focus on accelerating form completion while maintaining accuracy.`;
    return await aiInsightsClient.chat(prompt, {
      formType,
      context,
      existingData,
      workflow: "form_acceleration"
    });
  }
};

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
var ChatSession3 = class {
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
  ChatSession3 as ChatSession,
  EmbeddingService,
  GeminiAIService,
  OpenAIProvider,
  RAGOrchestrator,
  VertexAIProvider,
  aiInsightsClient,
  createGeminiCloudFunction,
  dcAIClient,
  enhanceKnowledgeBaseContent,
  generateCommandSuggestions,
  generateContent2 as generateContent,
  generateContentStream2 as generateContentStream,
  generateDetectionScenario,
  generatePOVRecommendations,
  getGeminiService,
  getModel,
  healthCheck,
  initializeAI,
  initializeGeminiService,
  initializeGeminiWithFirebase
};
/*! Bundled license information:

@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/logger/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/util/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
@firebase/component/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/node-esm/index.node.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/index.node.mjs:
@firebase/ai/dist/index.node.mjs:
@firebase/ai/dist/index.node.mjs:
@firebase/ai/dist/index.node.mjs:
@firebase/ai/dist/index.node.mjs:
@firebase/ai/dist/index.node.mjs:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/index.node.mjs:
@firebase/ai/dist/index.node.mjs:
@firebase/ai/dist/index.node.mjs:
@firebase/ai/dist/index.node.mjs:
@firebase/ai/dist/index.node.mjs:
@firebase/ai/dist/index.node.mjs:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/index.node.mjs:
@firebase/ai/dist/index.node.mjs:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/index.node.mjs:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
