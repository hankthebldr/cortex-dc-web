export interface ChatSchema {
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

export const CHAT_COLLECTION = 'chats';

// TODO: Add Firestore schema validation rules
export const ChatValidationRules = {
  required: ['userId', 'sessionId', 'messages'],
  maxMessages: 1000,
  maxTitleLength: 100,
};
