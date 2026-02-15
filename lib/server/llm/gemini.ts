import type { LLMAdapter, LLMMessage, LLMCompleteOptions } from './types';

export function createGeminiAdapter(apiKey?: string): LLMAdapter {
  const key = apiKey ?? process.env.GEMINI_API_KEY;
  return {
    async complete(messages: LLMMessage[], options?: LLMCompleteOptions): Promise<string> {
      if (!key) throw new Error('Gemini API key not configured');
      const model = options?.model ?? 'gemini-1.5-flash';
      const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      const systemInstruction = messages.find((m) => m.role === 'system')?.content;
      const body = {
        contents,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 1024,
        },
      };
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error: ${res.status} ${err}`);
      }
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    },
  };
}
