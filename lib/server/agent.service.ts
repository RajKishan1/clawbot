import { prisma } from './db';
import { NotFoundError, ForbiddenError } from './errors';
import type { CreateAgentBody, UpdateAgentBody, ListAgentsQuery, Agent, AgentListResponse } from './schemas/agent.schemas';

function toAgent(row: {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  systemPrompt: string | null;
  modelKey: string;
  modelParams: unknown;
  createdAt: Date;
  updatedAt: Date;
}): Agent {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    systemPrompt: row.systemPrompt,
    modelKey: row.modelKey,
    modelParams: row.modelParams as Agent['modelParams'],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function ensureOwnership(userId: string, agentId: string): Promise<void> {
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) throw new NotFoundError('Agent');
  if (agent.userId !== userId) throw new ForbiddenError('Not allowed to access this agent');
}

export async function list(userId: string, query: ListAgentsQuery): Promise<AgentListResponse> {
  const { page, limit } = query;
  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.agent.count({ where: { userId } }),
  ]);
  return {
    agents: agents.map(toAgent),
    total,
    page,
    limit,
  };
}

export async function create(userId: string, body: CreateAgentBody): Promise<Agent> {
  const agent = await prisma.agent.create({
    data: {
      userId,
      name: body.name,
      description: body.description ?? null,
      systemPrompt: body.systemPrompt ?? null,
      modelKey: body.modelKey,
      modelParams: (body.modelParams ?? undefined) as object | undefined,
    },
  });
  return toAgent(agent);
}

export async function getById(userId: string, agentId: string): Promise<Agent> {
  await ensureOwnership(userId, agentId);
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) throw new NotFoundError('Agent');
  return toAgent(agent);
}

export async function update(userId: string, agentId: string, body: UpdateAgentBody): Promise<Agent> {
  await ensureOwnership(userId, agentId);
  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.systemPrompt !== undefined && { systemPrompt: body.systemPrompt }),
      ...(body.modelKey !== undefined && { modelKey: body.modelKey }),
      ...(body.modelParams !== undefined && { modelParams: body.modelParams as object }),
    },
  });
  return toAgent(agent);
}

export async function remove(userId: string, agentId: string): Promise<void> {
  await ensureOwnership(userId, agentId);
  await prisma.agent.delete({ where: { id: agentId } });
}

export async function deploy(userId: string, agentId: string): Promise<{ status: string }> {
  await ensureOwnership(userId, agentId);
  return { status: 'deploy_pending' };
}
