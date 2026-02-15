'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { getErrorMessage } from '@/lib/api';
import type { Agent } from '@/lib/api';
import { Loading, ErrorAlert } from '@/components/ui';

const MODEL_OPTIONS = [
  { value: 'gpt-4o-mini', label: 'OpenAI GPT-4o Mini' },
  { value: 'gpt-4o', label: 'OpenAI GPT-4o' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
];

const inputClassName =
  'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500';

type Props = { agentId: string };

export default function EditAgentForm({ agentId }: Props) {
  const router = useRouter();
  const api = useApi();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [modelKey, setModelKey] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.agents
      .get(agentId)
      .then((a) => {
        const ag = a as Agent;
        if (!cancelled) {
          setAgent(ag);
          setName(ag.name);
          setDescription(ag.description ?? '');
          setSystemPrompt(ag.systemPrompt ?? '');
          setModelKey(ag.modelKey);
          const params = (ag.modelParams ?? {}) as { temperature?: number; maxTokens?: number };
          setTemperature(typeof params.temperature === 'number' ? params.temperature : 0.7);
          setMaxTokens(typeof params.maxTokens === 'number' ? params.maxTokens : 1024);
        }
      })
      .catch((e) => { if (!cancelled) setError(getErrorMessage(e, 'Failed to load agent')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [agentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agent || !name.trim() || !modelKey) return;
    setError(null);
    setSaving(true);
    try {
      await api.agents.update(agentId, {
        name: name.trim(),
        description: description.trim() || undefined,
        systemPrompt: systemPrompt.trim() || undefined,
        modelKey,
        modelParams: { temperature, maxTokens },
      });
      router.push(`/agents/${agentId}`);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to update agent'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading message="Loading agent…" />;
  if (error && !agent) return <ErrorAlert message={error} />;
  if (!agent) return null;

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
          Model
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
          className={`${inputClassName} resize-y`}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <Link
          href={`/agents/${agentId}`}
          className="rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
