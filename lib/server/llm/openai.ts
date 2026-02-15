import type { LLMAdapter, LLMMessage, LLMCompleteOptions } from './types';

export function createOpenAIAdapter(apiKey?: string): LLMAdapter {
  const key = apiKey ?? process.env.OPENAI_API_KEY;
  return {
    async complete(messages: LLMMessage[], options?: LLMCompleteOptions): Promise<string> {
      if (!key) throw new Error('OpenAI API key not configured');
      const body = {
        model: options?.model ?? 'gpt-4o-mini',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
      };
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI API error: ${res.status} ${err}`);
      }
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? '';
    },
  };
}
