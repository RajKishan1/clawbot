'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { getErrorMessage } from '@/lib/api';
import { ErrorAlert } from '@/components/ui';

/** Models grouped by provider. Backend uses OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY in backend .env */
const MODEL_OPTIONS: { value: string; label: string; provider: 'openai' | 'anthropic' | 'gemini' }[] = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'openai' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', provider: 'anthropic' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'gemini' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'gemini' },
];

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
};

const inputClassName =
  'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500';

export default function CreateAgentForm() {
  const router = useRouter();
  const api = useApi();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [modelKey, setModelKey] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProvider = MODEL_OPTIONS.find((m) => m.value === modelKey)?.provider;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !modelKey) return;
    setError(null);
    setLoading(true);
    try {
      const agent = (await api.agents.create({
        name: name.trim(),
        description: description.trim() || undefined,
        systemPrompt: systemPrompt.trim() || undefined,
        modelKey,
        modelParams: { temperature, maxTokens },
      })) as { id: string };
      if (agent?.id) {
        router.push(`/agents/${agent.id}`);
      } else {
        setError('Invalid response from server');
      }
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to create agent'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <ErrorAlert message={error} onDismiss={() => setError(null)} />
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={255}
          placeholder="My agent"
          className={inputClassName}
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          placeholder="Short description of this agent"
          className={`${inputClassName} resize-y`}
        />
      </div>
      <div>
        <label htmlFor="modelKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          AI model
        </label>
        <select
          id="modelKey"
          value={modelKey}
          onChange={(e) => setModelKey(e.target.value)}
          className={inputClassName}
        >
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {selectedProvider && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Requires {PROVIDER_LABELS[selectedProvider]} API key in app <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">.env</code>.
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Temperature <span className="text-slate-400">(0–2)</span>
          </label>
          <input
            id="temperature"
            type="number"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="maxTokens" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Max tokens
          </label>
          <input
            id="maxTokens"
            type="number"
            min={1}
            max={128000}
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value) || 1024)}
            className={inputClassName}
          />
        </div>
      </div>
      <div>
        <label htmlFor="systemPrompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          System prompt <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="systemPrompt"
          rows={4}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          maxLength={10000}
          placeholder="You are a helpful assistant…"
          className={`${inputClassName} resize-y`}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create agent'}
        </button>
        <Link
          href="/agents"
          className="rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
