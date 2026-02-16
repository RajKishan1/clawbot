/**
 * Agent runtime: load agent config + conversation history, call LLM, persist messages.
 * Server-only. Used by Telegram webhook and (later) any programmatic chat.
 */

import { prisma } from './db';
import { getLLMAdapter } from './llm';
import type { LLMMessage } from './llm';
import { NotFoundError } from './errors';

const MAX_HISTORY_MESSAGES = 20;

export type RunAgentOptions = {
  agentId: string;
  conversationKey: string;
  userMessage: string;
  source?: string;
  channelId?: string | null;
};

/**
 * Resolves or creates conversation for (agentId, conversationKey).
 * Appends user message, runs LLM with system prompt + history, persists assistant reply, returns reply text.
 */
export async function runAgent(options: RunAgentOptions): Promise<string> {
  const { agentId, conversationKey, userMessage, source = 'telegram', channelId } = options;

  console.log('[agent-runtime] Starting runAgent:', { agentId, conversationKey, userMessage: userMessage.substring(0, 50) });
  
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) {
    console.error('[agent-runtime] Agent not found:', agentId);
    throw new NotFoundError('Agent');
  }
  console.log('[agent-runtime] Agent loaded:', { name: agent.name, modelKey: agent.modelKey });

  let conversation = await prisma.conversation.findUnique({
    where: { agentId_telegramChatId: { agentId, telegramChatId: conversationKey } },
    include: { messages: { orderBy: { createdAt: 'asc' }, take: MAX_HISTORY_MESSAGES } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        agentId,
        telegramChatId: conversationKey,
        channelId: channelId ?? undefined,
      },
      include: { messages: true },
    });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: 'user', content: userMessage, source },
  });
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  const history = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
    take: MAX_HISTORY_MESSAGES + 1,
  });

  const llmMessages: LLMMessage[] = [];
  if (agent.systemPrompt?.trim()) {
    llmMessages.push({ role: 'system', content: agent.systemPrompt });
  }
  for (const m of history) {
    if (m.role === 'user' || m.role === 'assistant') {
      llmMessages.push({ role: m.role as 'user' | 'assistant', content: m.content });
    }
  }

  const adapter = getLLMAdapter(agent.modelKey);
  const modelParams = (agent.modelParams as { temperature?: number; maxTokens?: number } | null) ?? {};
  console.log('[agent-runtime] Calling LLM:', { model: agent.modelKey, messageCount: llmMessages.length });
  const reply = await adapter.complete(llmMessages, {
    model: agent.modelKey,
    temperature: modelParams.temperature ?? 0.7,
    maxTokens: modelParams.maxTokens ?? 1024,
  });
  console.log('[agent-runtime] LLM reply received:', reply.substring(0, 100));

  await prisma.message.create({
    data: { conversationId: conversation.id, role: 'assistant', content: reply, source },
  });
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return reply;
}
