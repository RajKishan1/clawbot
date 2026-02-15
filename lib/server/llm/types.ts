/**
 * LLM adapter types. Server-only; keys from env.
 */

export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LLMCompleteOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export interface LLMAdapter {
  complete(messages: LLMMessage[], options?: LLMCompleteOptions): Promise<string>;
}

export type LLMProvider = 'openai' | 'anthropic' | 'gemini';
