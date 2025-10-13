/**
 * AI Services - Migrated from henryreed.ai
 */

// AI Insights Client (lightweight client with Cloud Functions fallback)
export { aiInsightsClient } from './ai-insights-client';
export type { AIInsightsAction } from './ai-insights-client';

// Firebase AI Logic Service (Gemini integration)
export {
  initializeAI,
  getModel,
  generateContent,
  generateContentStream,
  ChatSession,
  generatePOVRecommendations,
  generateDetectionScenario,
  enhanceKnowledgeBaseContent,
  generateCommandSuggestions,
  healthCheck,
} from './firebase-ai-logic-service';

// DC AI Client (Domain Consultant workflows)
export { dcAIClient } from './dc-ai-client';
export type {
  DCWorkflowContext,
  DCRecommendation,
  DCWorkflowSummary,
} from './dc-ai-client';
