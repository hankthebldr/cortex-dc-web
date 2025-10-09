import { AIProvider } from './base';

export class OpenAIProvider extends AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4') {
    super();
    this.apiKey = apiKey;
    this.model = model;
  }

  // Placeholder implementation
  async generateCompletion(prompt: string): Promise<string> {
    // TODO: Implement OpenAI API integration
    return `OpenAI response for: ${prompt}`;
  }
}