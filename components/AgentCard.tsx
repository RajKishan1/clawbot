import Link from 'next/link';
import type { Agent } from '@/lib/api';

type AgentCardProps = {
  agent: Agent;
  /** Optional: render custom content instead of default link (e.g. buttons). Link is still applied to the card if href is used. */
  children?: React.ReactNode;
};

function formatModelLabel(modelKey: string): string {
  const labels: Record<string, string> = {
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4o': 'GPT-4o',
    'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
  };
  return labels[modelKey] ?? modelKey;
}

export default function AgentCard({ agent, children }: AgentCardProps) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="block rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 hover:shadow transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
            {agent.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {formatModelLabel(agent.modelKey)}
          </p>
          {(agent.description ?? agent.systemPrompt) && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 line-clamp-2">
              {agent.description ?? agent.systemPrompt}
            </p>
          )}
        </div>
        {children != null && (
          <div
            className="shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {children}
          </div>
        )}
      </div>
    </Link>
  );
}
