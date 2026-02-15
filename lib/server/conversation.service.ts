import { prisma } from './db';
import { getSessionUser } from './auth';
import { NotFoundError, ForbiddenError } from './errors';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export type ConversationSummary = {
  id: string;
  agentId: string;
  channelId: string | null;
  telegramChatId: string;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
};

export async function listConversationsForAgent(
  agentId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ conversations: ConversationSummary[]; total: number }> {
  const user = await getSessionUser();
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) throw new NotFoundError('Agent');
  if (agent.userId !== user.id) throw new ForbiddenError('Not allowed to access this agent');

  const limit = Math.min(options?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = options?.offset ?? 0;

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: { agentId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.conversation.count({ where: { agentId } }),
  ]);

  const summaries: ConversationSummary[] = conversations.map((c) => ({
    id: c.id,
    agentId: c.agentId,
    channelId: c.channelId,
    telegramChatId: c.telegramChatId,
    messageCount: c._count.messages,
    lastMessageAt: c.messages[0]?.createdAt.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));

  return { conversations: summaries, total };
}

export type MessageRow = {
  id: string;
  role: string;
  content: string;
  source: string;
  createdAt: string;
};

export async function listMessages(
  conversationId: string,
  options?: { limit?: number; before?: string }
): Promise<{ messages: MessageRow[]; hasMore: boolean }> {
  const user = await getSessionUser();
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { agent: true },
  });
  if (!conv) throw new NotFoundError('Conversation');
  if (conv.agent.userId !== user.id) throw new ForbiddenError('Not allowed to access this conversation');

  const limit = Math.min(options?.limit ?? 50, MAX_LIMIT);
  const cursor = options?.before ? { id: options.before } : undefined;

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor, skip: 1 } : {}),
  });

  const hasMore = messages.length > limit;
  const slice = hasMore ? messages.slice(0, limit) : messages;
  const ordered = slice.reverse();

  return {
    messages: ordered.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      source: m.source,
      createdAt: m.createdAt.toISOString(),
    })),
    hasMore,
  };
}
