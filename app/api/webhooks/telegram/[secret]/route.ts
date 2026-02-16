/**
 * Telegram webhook: validate request, resolve channel by secret, run agent, send reply.
 * URL is registered via setWebhook when user connects: NEXT_PUBLIC_APP_URL + /api/webhooks/telegram/{secret}
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/server/db';
import { extractMessageFromUpdate, type TelegramUpdate, sendTelegramMessage } from '@/lib/server/telegram';
import { webhookRateLimitResponse } from '@/lib/server/rate-limit';
import { runAgent } from '@/lib/server/agent-runtime';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ secret: string }> }
) {
  console.log('[webhooks/telegram] Webhook received');
  const rateLimitRes = webhookRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;
  try {
    const { secret } = await context.params;
    console.log('[webhooks/telegram] Secret:', secret?.substring(0, 8) + '...');
    if (!secret) {
      console.error('[webhooks/telegram] No secret provided');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const channel = await withRetry(() =>
      prisma.channel.findFirst({
        where: { webhookSecret: secret, status: 'active', platform: 'telegram' },
      })
    );
    if (!channel) {
      console.error('[webhooks/telegram] Channel not found for secret');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.log('[webhooks/telegram] Channel found:', channel.agentId);

    const telegramSecret = request.headers.get('x-telegram-bot-api-secret-token');
    if (telegramSecret && telegramSecret !== channel.webhookSecret) {
      console.error('[webhooks/telegram] Secret token mismatch');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as TelegramUpdate;
    console.log('[webhooks/telegram] Update received:', JSON.stringify(body).substring(0, 200));
    const parsed = extractMessageFromUpdate(body);
    if (!parsed) {
      console.log('[webhooks/telegram] No text message in update, ignoring');
      return NextResponse.json({ ok: true });
    }

    const { chatId, text } = parsed;
    console.log('[webhooks/telegram] Processing message:', { chatId, text: text.substring(0, 50) });

    // Run agent to process message and generate reply
    // runAgent handles conversation/message creation internally
    try {
      console.log('[webhooks/telegram] Running agent...');
      const reply = await runAgent({
        agentId: channel.agentId,
        conversationKey: chatId,
        userMessage: text,
        source: 'telegram',
        channelId: channel.id,
      });
      console.log('[webhooks/telegram] Agent reply generated:', reply.substring(0, 100));

      // Send reply back to Telegram
      console.log('[webhooks/telegram] Sending reply to Telegram...');
      await sendTelegramMessage(channel.telegramBotToken, chatId, reply);
      console.log('[webhooks/telegram] Reply sent successfully');
    } catch (error) {
      // Log error but still return 200 to Telegram to avoid retries
      console.error('[webhooks/telegram] Agent execution failed:', error);
      if (error instanceof Error) {
        console.error('[webhooks/telegram] Error stack:', error.stack);
      }
      // Optionally send error message to user
      try {
        await sendTelegramMessage(
          channel.telegramBotToken,
          chatId,
          'Sorry, I encountered an error processing your message. Please try again later.'
        );
        console.log('[webhooks/telegram] Error message sent to user');
      } catch (sendError) {
        console.error('[webhooks/telegram] Failed to send error message:', sendError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[webhooks/telegram] Outer catch:', e);
    if (e instanceof Error) {
      console.error('[webhooks/telegram] Error stack:', e.stack);
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
