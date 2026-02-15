import Link from 'next/link';
import EditAgentForm from '@/components/EditAgentForm';

type Props = { params: Promise<{ id: string }> };

export default async function EditAgentPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href={`/agents/${id}`}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        >
          ← Agent
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Edit agent
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Update name, model, or system prompt.
      </p>
      <EditAgentForm agentId={id} />
    </div>
  );
}
