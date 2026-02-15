import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Dashboard
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Overview of your agents and activity.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/agents"
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        >
          <span className="font-medium text-slate-900 dark:text-slate-100">Agents</span>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View and manage agents
          </p>
        </Link>
        <Link
          href="/agents/new"
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        >
          <span className="font-medium text-slate-900 dark:text-slate-100">New agent</span>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create an agent
          </p>
        </Link>
      </div>
    </div>
  );
}
