// Gemini AI Service (migrated from henryreed.ai)
export {
  GeminiAIService,
  initializeGeminiService,
  getGeminiService,
  initializeGeminiWithFirebase,
  createGeminiCloudFunction,
} from './gemini-ai-service';

export type {
  GeminiRequest,
  GeminiResponse,
  AIInsight,
  GeminiConfig,
} from './gemini-ai-service';

// AI Provider abstractions
export { AIProvider } from './providers/base';
export { VertexAIProvider } from './providers/vertex';
export { OpenAIProvider } from './providers/openai';

// Chat interfaces
export { ChatClient } from './chat/client';
export { ChatSession } from './chat/session';

// RAG (Retrieval-Augmented Generation)
export { RAGOrchestrator } from './rag/orchestrator';
export { EmbeddingService } from './embeddings/service';

// Types
export type {
  AIProviderConfig,
  ChatMessage,
  ChatResponse,
  EmbeddingVector,
  RAGConfig
} from './types/ai';