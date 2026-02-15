'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { getErrorMessage } from '@/lib/api';
import type { Agent, ChannelInfo, ConversationSummary } from '@/lib/api';
import { Loading, ErrorAlert } from '@/components/ui';

const MODEL_LABELS: Record<string, string> = {
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-4o': 'GPT-4o',
  'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
  'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
  'gemini-1.5-flash': 'Gemini 1.5 Flash',
  'gemini-1.5-pro': 'Gemini 1.5 Pro',
};

type Props = { agentId: string };

const inputClassName =
  'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500';

export default function AgentDetail({ agentId }: Props) {
  const router = useRouter();
  const api = useApi();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsTotal, setConversationsTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api.agents
      .get(agentId)
      .then((a) => { if (!cancelled) setAgent(a as Agent); })
      .catch((e) => { if (!cancelled) setError(getErrorMessage(e, 'Failed to load agent')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [agentId]);

  useEffect(() => {
    if (!agent) return;
    let cancelled = false;
    api.channels
      .get(agentId)
      .then((res) => { if (!cancelled) setChannel((res as { channel: ChannelInfo }).channel); })
      .catch(() => { if (!cancelled) setChannel(null); });
    return () => { cancelled = true; };
  }, [agentId, agent, api.channels]);

  useEffect(() => {
    if (!agent) return;
    let cancelled = false;
    api.conversations
      .list(agentId, { limit: 10 })
      .then((res) => {
        if (cancelled) return;
        const r = res as { conversations: ConversationSummary[]; total: number };
        setConversations(r.conversations);
        setConversationsTotal(r.total);
      })
      .catch(() => { if (!cancelled) setConversations([]); setConversationsTotal(0); });
    return () => { cancelled = true; };
  }, [agentId, agent, api.conversations]);

  async function handleDelete() {
    if (!agent || !confirm(`Delete "${agent.name}"?`)) return;
    setDeleting(true);
    try {
      await api.agents.delete(agentId);
      router.push('/agents');
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to delete agent'));
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeploy() {
    if (!agent) return;
    setDeploying(true);
    setError(null);
    try {
      await api.agents.deploy(agentId);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to deploy agent'));
    } finally {
      setDeploying(false);
    }
  }

  async function handleConnectTelegram(e: React.FormEvent) {
    e.preventDefault();
    if (!botToken.trim()) return;
    setConnecting(true);
    setError(null);
    try {
      await api.channels.connect(agentId, { botToken: botToken.trim() });
      const res = await api.channels.get(agentId) as { channel: ChannelInfo };
      setChannel(res.channel);
      setBotToken('');
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to connect Telegram'));
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnectTelegram() {
    if (!confirm('Disconnect Telegram from this agent?')) return;
    setDisconnecting(true);
    setError(null);
    try {
      await api.channels.disconnect(agentId);
      setChannel(null);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to disconnect'));
    } finally {
      setDisconnecting(false);
    }
  }

  if (loading) return <Loading message="Loading agent…" />;
  if (error && !agent) return <ErrorAlert message={error} />;
  if (!agent) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <ErrorAlert message={error} onDismiss={() => setError(null)} />
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {agent.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {MODEL_LABELS[agent.modelKey] ?? agent.modelKey}
          </p>
          {agent.description && (
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm">
              {agent.description}
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/agents/${agentId}/edit`}
            className="rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDeploy}
            disabled={deploying}
            className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {deploying ? 'Deploying…' : 'Deploy'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 px-3 py-1.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Telegram</h2>
        {channel ? (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">Connected. Messages to your bot are answered by this agent.</p>
            <button
              type="button"
              onClick={handleDisconnectTelegram}
              disabled={disconnecting}
              className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              {disconnecting ? 'Disconnecting…' : 'Disconnect Telegram'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleConnectTelegram} className="space-y-2">
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Bot token (from @BotFather)"
              className={inputClassName}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={connecting || !botToken.trim()}
              className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {connecting ? 'Connecting…' : 'Connect Telegram'}
            </button>
          </form>
        )}
      </div>
      {agent.systemPrompt && (
        <div>
          <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">System prompt</h2>
          <pre className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
            {agent.systemPrompt}
          </pre>
        </div>
      )}
      <div>
        <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Recent conversations</h2>
        {conversations.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No conversations yet. Messages to your Telegram bot will appear here.</p>
        ) : (
          <ul className="rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/agents/${agentId}/conversations/${c.id}`}
                  className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm"
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">Chat {c.telegramChatId}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">
                    {c.messageCount} message{c.messageCount !== 1 ? 's' : ''}
                    {c.lastMessageAt && ` · ${new Date(c.lastMessageAt).toLocaleString()}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {conversationsTotal > conversations.length && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Showing {conversations.length} of {conversationsTotal}
          </p>
        )}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Created {new Date(agent.createdAt).toLocaleString()} · Updated {new Date(agent.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}
