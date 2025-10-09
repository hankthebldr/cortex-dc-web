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