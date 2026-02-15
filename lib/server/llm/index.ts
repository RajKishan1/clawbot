/**
 * LLM adapter factory. Server-only. Keys from env: OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY.
 */

import type { LLMAdapter, LLMProvider } from './types';
import { createOpenAIAdapter } from './openai';
import { createAnthropicAdapter } from './anthropic';
import { createGeminiAdapter } from './gemini';

const MODEL_TO_PROVIDER: Record<string, LLMProvider> = {
  'gpt-4o-mini': 'openai',
  'gpt-4o': 'openai',
  'gpt-4-turbo': 'openai',
  'claude-3-5-haiku-20241022': 'anthropic',
  'claude-3-5-sonnet-20241022': 'anthropic',
  'claude-3-opus-20240229': 'anthropic',
  'gemini-1.5-flash': 'gemini',
  'gemini-1.5-pro': 'gemini',
};

export type { LLMAdapter, LLMMessage, LLMCompleteOptions, LLMProvider } from './types';

export function getLLMAdapter(modelKey: string): LLMAdapter {
  const provider = MODEL_TO_PROVIDER[modelKey] ?? 'openai';
  switch (provider) {
    case 'openai':
      return createOpenAIAdapter();
    case 'anthropic':
      return createAnthropicAdapter();
    case 'gemini':
      return createGeminiAdapter();
    default:
      return createOpenAIAdapter();
  }
}
