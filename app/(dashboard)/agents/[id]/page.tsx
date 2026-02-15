import Link from 'next/link';
import AgentDetail from '@/components/AgentDetail';

type Props = { params: Promise<{ id: string }> };

export default async function AgentDetailPage({ params }: Props) {
  const { id } = await params;
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
      <AgentDetail agentId={id} />
    </div>
  );
}
