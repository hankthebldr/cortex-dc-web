import { ChatMessage } from './client';

export class ChatSession {
  private sessionId: string;
  private messages: ChatMessage[] = [];

  constructor(sessionId?: string) {
    this.sessionId = sessionId || Date.now().toString();
  }

  getId(): string {
    return this.sessionId;
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  // TODO: Implement session persistence
  async save(): Promise<void> {
    // Placeholder for saving session to storage
  }

  async load(): Promise<void> {
    // Placeholder for loading session from storage
  }
}