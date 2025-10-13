/**
 * Gemini AI Types - Shared type definitions
 * Migrated from henryreed.ai
 */

/**
 * Gemini artifact (file attachment or data)
 */
export interface GeminiArtifact {
  id: string;
  mimeType: string;
  data: string;
  description?: string;
}

/**
 * Gemini response from AI model
 */
export interface GeminiResponse {
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
export interface AIInsight {
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
export interface GeminiFunctionRequest {
  action: 'analyze_pov' | 'analyze_trr' | 'generate_detection' | 'optimize_scenario' | 'chat';
  data: any;
  userId: string;
  sessionId?: string;
}

/**
 * Cloud Function response structure
 */
export interface GeminiFunctionResponse {
  success: boolean;
  data?: AIInsight | GeminiResponse;
  error?: string;
  usage?: {
    tokensUsed: number;
    cost: number;
  };
}
