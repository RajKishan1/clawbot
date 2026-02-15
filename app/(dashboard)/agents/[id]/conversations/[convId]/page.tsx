import Link from 'next/link';
import ConversationView from '@/components/ConversationView';

type Props = { params: Promise<{ id: string; convId: string }> };

export default async function ConversationPage({ params }: Props) {
  const { id: agentId, convId } = await params;
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href={`/agents/${agentId}`}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        >
          ← Back to agent
        </Link>
      </div>
      <ConversationView agentId={agentId} conversationId={convId} />
    </div>
  );
}
