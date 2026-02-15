'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { getErrorMessage } from '@/lib/api';
import type { MessageRow } from '@/lib/api';
import { Loading, ErrorAlert } from '@/components/ui';

type Props = { agentId: string; conversationId: string };

export default function ConversationView({ agentId, conversationId }: Props) {
  const api = useApi();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.conversations
      .messages(conversationId, { limit: 50 })
      .then((res) => {
        if (!cancelled) setMessages((res as { messages: MessageRow[] }).messages);
      })
      .catch((e) => { if (!cancelled) setError(getErrorMessage(e, 'Failed to load messages')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [conversationId, api.conversations]);

  if (loading) return <Loading message="Loading conversation…" />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Conversation
      </h1>
      <ul className="space-y-3">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-lg border p-3 text-sm ${
              m.role === 'user'
                ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 ml-0'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mr-0'
            }`}
          >
            <span className="font-medium text-slate-500 dark:text-slate-400 capitalize">{m.role}</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs ml-2">({m.source})</span>
            <p className="mt-1 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{m.content}</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {new Date(m.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
      {messages.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400">No messages in this conversation.</p>
      )}
    </div>
  );
}
