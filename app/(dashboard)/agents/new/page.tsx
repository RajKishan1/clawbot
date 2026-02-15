import Link from 'next/link';
import CreateAgentForm from '@/components/CreateAgentForm';

export default function NewAgentPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/agents"
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        >
          ← Agents
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        New agent
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Create an AI agent and configure its model and system prompt. Add the required API key for your chosen model in the backend <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-sm">.env</code> (see backend <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-sm">.env.example</code>).
      </p>
      <CreateAgentForm />
    </div>
  );
}
