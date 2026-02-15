import Link from 'next/link';
import AgentList from '@/components/AgentList';

export default function AgentsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Agents
        </h1>
        <Link
          href="/agents/new"
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          New agent
        </Link>
      </div>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Create and manage your AI agents.
      </p>
      <AgentList />
    </div>
  );
}
