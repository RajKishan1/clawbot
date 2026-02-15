'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { getErrorMessage } from '@/lib/api';
import type { Agent } from '@/lib/api';
import { Loading, ErrorAlert, EmptyState } from '@/components/ui';
import AgentCard from '@/components/AgentCard';

export default function AgentList() {
  const api = useApi();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.agents
      .list()
      .then((res) => setAgents((res as { agents: Agent[] }).agents))
      .catch((e) => setError(getErrorMessage(e, 'Failed to load agents')))
      .finally(() => setLoading(false));
    // Run once on mount; DashboardGuard ensures user is authenticated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <Loading message="Loading agents…" />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        message="No agents yet."
        actionLabel="Create agent"
        actionHref="/agents/new"
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <li key={agent.id}>
          <AgentCard agent={agent} />
        </li>
      ))}
    </ul>
  );
}
