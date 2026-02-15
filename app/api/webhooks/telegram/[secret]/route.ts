/**
 * Telegram webhook: validate request, resolve channel by secret, store incoming message, return 200.
 * No agent runtime in this slice — message is persisted only.
 * URL is registered via setWebhook when user connects: NEXT_PUBLIC_APP_URL + /api/webhooks/telegram/{secret}
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { extractMessageFromUpdate, type TelegramUpdate } from '@/lib/server/telegram';
import { webhookRateLimitResponse } from '@/lib/server/rate-limit';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ secret: string }> }
) {
  const rateLimitRes = webhookRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;
  try {
    const { secret } = await context.params;
    if (!secret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const channel = await prisma.channel.findFirst({
      where: { webhookSecret: secret, status: 'active', platform: 'telegram' },
    });
    if (!channel) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const telegramSecret = request.headers.get('x-telegram-bot-api-secret-token');
    if (telegramSecret && telegramSecret !== channel.webhookSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as TelegramUpdate;
    const parsed = extractMessageFromUpdate(body);
    if (!parsed) {
      return NextResponse.json({ ok: true });
    }

    const { chatId, text } = parsed;

    let conversation = await prisma.conversation.findUnique({
      where: {
        agentId_telegramChatId: { agentId: channel.agentId, telegramChatId: chatId },
      },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          agentId: channel.agentId,
          channelId: channel.id,
          telegramChatId: chatId,
        },
      });
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: text,
        source: 'telegram',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[webhooks/telegram]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
