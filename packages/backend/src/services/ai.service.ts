/**
 * AI Service
 * Integration with Gemini AI for chat, analysis, and content generation
 */

import { config } from '../config/env.config';
import { BadRequestError, InternalServerError } from '../middleware/error.middleware';
import { Firestore } from '@google-cloud/firestore';

// Import Gemini AI service from @cortex/ai package
import { GeminiAIService } from '@cortex/ai';

/**
 * Chat options interface
 */
interface ChatOptions {
  message: string;
  context?: string;
  conversationId?: string;
  userId: string;
}

/**
 * Analysis options interface
 */
interface AnalysisOptions {
  content: string;
  analysisType: string;
  userId: string;
}

/**
 * Generation options interface
 */
interface GenerationOptions {
  prompt: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
  userId: string;
}

/**
 * Summarization options interface
 */
interface SummarizationOptions {
  text: string;
  maxLength?: number;
  userId: string;
}

/**
 * AI Service class
 */
export class AIService {
  private gemini: GeminiAIService;
  private firestore?: Firestore;

  constructor() {
    // Initialize Gemini AI service
    if (config.ENABLE_AI_FEATURES && config.GEMINI_API_KEY) {
      this.gemini = new GeminiAIService(config.GEMINI_API_KEY, {
        model: config.GEMINI_MODEL,
        temperature: config.GEMINI_TEMPERATURE,
        maxTokens: config.GEMINI_MAX_TOKENS,
      });
    }

    // Initialize Firestore for conversation storage
    if (config.DATABASE_TYPE === 'firestore') {
      this.firestore = new Firestore({
        projectId: config.FIRESTORE_PROJECT_ID || config.GCP_PROJECT_ID,
        databaseId: config.FIRESTORE_DATABASE_ID,
      });
    }
  }

  /**
   * Check if AI features are enabled
   */
  private checkEnabled(): void {
    if (!config.ENABLE_AI_FEATURES) {
      throw new BadRequestError('AI features are disabled');
    }

    if (!config.GEMINI_API_KEY) {
      throw new InternalServerError('AI service not configured');
    }
  }

  /**
   * Chat with AI
   */
  async chat(options: ChatOptions): Promise<any> {
    this.checkEnabled();

    const { message, context, conversationId, userId } = options;

    if (!message) {
      throw new BadRequestError('Message is required');
    }

    try {
      // Load conversation history if conversationId provided
      let conversationHistory: any[] = [];
      if (conversationId) {
        conversationHistory = await this.getConversationHistory(userId, conversationId);
      }

      // Build prompt with context
      let fullPrompt = message;
      if (context) {
        fullPrompt = `Context: ${context}\n\nUser: ${message}`;
      }

      // Add conversation history
      if (conversationHistory.length > 0) {
        const historyText = conversationHistory
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');
        fullPrompt = `${historyText}\n\nUser: ${message}`;
      }

      // Generate response
      const response = await this.gemini.generateText(fullPrompt);

      // Save to conversation history
      const newConversationId = conversationId || `conv_${Date.now()}`;
      await this.saveConversationMessage(userId, newConversationId, {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      });
      await this.saveConversationMessage(userId, newConversationId, {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      });

      return {
        message: response,
        conversationId: newConversationId,
      };
    } catch (error: any) {
      console.error('AI chat error:', error);
      throw new InternalServerError('Failed to generate AI response');
    }
  }

  /**
   * Analyze content
   */
  async analyze(options: AnalysisOptions): Promise<any> {
    this.checkEnabled();

    const { content, analysisType, userId } = options;

    if (!content) {
      throw new BadRequestError('Content is required');
    }

    try {
      let prompt = '';

      switch (analysisType) {
        case 'sentiment':
          prompt = `Analyze the sentiment of the following text and provide a detailed analysis:\n\n${content}`;
          break;
        case 'summary':
          prompt = `Provide a concise summary of the following text:\n\n${content}`;
          break;
        case 'keywords':
          prompt = `Extract the main keywords and topics from the following text:\n\n${content}`;
          break;
        case 'entities':
          prompt = `Identify and extract named entities (people, organizations, locations) from the following text:\n\n${content}`;
          break;
        default:
          prompt = `Analyze the following text:\n\n${content}`;
      }

      const analysis = await this.gemini.generateText(prompt);

      // Save analysis to database
      await this.saveAnalysis(userId, {
        type: analysisType,
        content,
        result: analysis,
        timestamp: new Date().toISOString(),
      });

      return {
        analysis,
        type: analysisType,
      };
    } catch (error: any) {
      console.error('AI analysis error:', error);
      throw new InternalServerError('Failed to analyze content');
    }
  }

  /**
   * Generate content
   */
  async generate(options: GenerationOptions): Promise<any> {
    this.checkEnabled();

    const { prompt, options: genOptions, userId } = options;

    if (!prompt) {
      throw new BadRequestError('Prompt is required');
    }

    try {
      const response = await this.gemini.generateText(prompt, genOptions);

      // Save generation to database
      await this.saveGeneration(userId, {
        prompt,
        result: response,
        options: genOptions,
        timestamp: new Date().toISOString(),
      });

      return {
        generated: response,
      };
    } catch (error: any) {
      console.error('AI generation error:', error);
      throw new InternalServerError('Failed to generate content');
    }
  }

  /**
   * Summarize text
   */
  async summarize(options: SummarizationOptions): Promise<any> {
    this.checkEnabled();

    const { text, maxLength, userId } = options;

    if (!text) {
      throw new BadRequestError('Text is required');
    }

    try {
      let prompt = `Summarize the following text`;
      if (maxLength) {
        prompt += ` in approximately ${maxLength} words`;
      }
      prompt += `:\n\n${text}`;

      const summary = await this.gemini.generateText(prompt);

      return {
        summary,
        originalLength: text.length,
        summaryLength: summary.length,
      };
    } catch (error: any) {
      console.error('AI summarization error:', error);
      throw new InternalServerError('Failed to summarize text');
    }
  }

  /**
   * Get conversation history
   */
  private async getConversationHistory(userId: string, conversationId: string): Promise<any[]> {
    if (!this.firestore) return [];

    const snapshot = await this.firestore
      .collection('conversations')
      .doc(userId)
      .collection('messages')
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'asc')
      .get();

    return snapshot.docs.map(doc => doc.data());
  }

  /**
   * Save conversation message
   */
  private async saveConversationMessage(
    userId: string,
    conversationId: string,
    message: any
  ): Promise<void> {
    if (!this.firestore) return;

    await this.firestore
      .collection('conversations')
      .doc(userId)
      .collection('messages')
      .add({
        conversationId,
        ...message,
      });
  }

  /**
   * Get user conversations
   */
  async getConversations(userId: string, options: { limit?: number; offset?: number }): Promise<any[]> {
    if (!this.firestore) return [];

    const { limit = 20, offset = 0 } = options;

    const snapshot = await this.firestore
      .collection('conversations')
      .doc(userId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    // Group by conversationId
    const conversationsMap = new Map();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!conversationsMap.has(data.conversationId)) {
        conversationsMap.set(data.conversationId, {
          id: data.conversationId,
          lastMessage: data.content,
          lastTimestamp: data.timestamp,
          messageCount: 1,
        });
      } else {
        const conv = conversationsMap.get(data.conversationId);
        conv.messageCount++;
      }
    });

    return Array.from(conversationsMap.values());
  }

  /**
   * Get a specific conversation
   */
  async getConversation(userId: string, conversationId: string): Promise<any> {
    const messages = await this.getConversationHistory(userId, conversationId);

    return {
      id: conversationId,
      messages,
      messageCount: messages.length,
    };
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    if (!this.firestore) return;

    const snapshot = await this.firestore
      .collection('conversations')
      .doc(userId)
      .collection('messages')
      .where('conversationId', '==', conversationId)
      .get();

    const batch = this.firestore.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  /**
   * Save analysis to database
   */
  private async saveAnalysis(userId: string, analysis: any): Promise<void> {
    if (!this.firestore) return;

    await this.firestore.collection('ai_analyses').add({
      userId,
      ...analysis,
    });
  }

  /**
   * Save generation to database
   */
  private async saveGeneration(userId: string, generation: any): Promise<void> {
    if (!this.firestore) return;

    await this.firestore.collection('ai_generations').add({
      userId,
      ...generation,
    });
  }
}
