import type { LLMAdapter, LLMMessage, LLMCompleteOptions } from './types';

export function createAnthropicAdapter(apiKey?: string): LLMAdapter {
  const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
  return {
    async complete(messages: LLMMessage[], options?: LLMCompleteOptions): Promise<string> {
      if (!key) throw new Error('Anthropic API key not configured');
      const system = messages.find((m) => m.role === 'system');
      const rest = messages.filter((m) => m.role !== 'system');
      const body = {
        model: options?.model ?? 'claude-3-5-haiku-20241022',
        max_tokens: options?.maxTokens ?? 1024,
        system: system?.content,
        messages: rest.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        temperature: options?.temperature ?? 0.7,
      };
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic API error: ${res.status} ${err}`);
      }
      const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
      const block = data.content?.find((c) => c.type === 'text');
      return block?.text ?? '';
    },
  };
}
