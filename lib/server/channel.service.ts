import { prisma } from './db';
import { setTelegramWebhook, clearTelegramWebhook } from './telegram';
import { NotFoundError, ForbiddenError, ValidationError } from './errors';
import { getSessionUser } from './auth';
import crypto from 'crypto';

const TELEGRAM_GET_ME = 'https://api.telegram.org/bot';

async function validateBotToken(botToken: string): Promise<{ id: number; username?: string }> {
  const res = await fetch(`${TELEGRAM_GET_ME}${botToken}/getMe`);
  if (!res.ok) {
    throw new ValidationError('Invalid Telegram bot token');
  }
  const data = (await res.json()) as { ok: boolean; result?: { id: number; username?: string } };
  if (!data.ok || !data.result) throw new ValidationError('Invalid Telegram bot token');
  return data.result;
}

function generateWebhookSecret(): string {
  return crypto.randomBytes(24).toString('hex');
}

export async function connectTelegram(agentId: string, botToken: string): Promise<{ webhookUrl: string }> {
  const user = await getSessionUser();
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) throw new NotFoundError('Agent');
  if (agent.userId !== user.id) throw new ForbiddenError('Not allowed to access this agent');

  await validateBotToken(botToken);
  const webhookSecret = generateWebhookSecret();

  // Webhook URL must be reachable by Telegram. For local dev use ngrok and set NEXT_PUBLIC_APP_URL.
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    process.env.KINDE_SITE_URL ||
    'http://localhost:3000';
  const webhookUrl = `${baseUrl.replace(/\/$/, '')}/api/webhooks/telegram/${webhookSecret}`;

  await setTelegramWebhook(botToken, webhookUrl, webhookSecret);

  await prisma.channel.upsert({
    where: { agentId_platform: { agentId, platform: 'telegram' } },
    create: {
      agentId,
      platform: 'telegram',
      telegramBotToken: botToken,
      webhookSecret,
      status: 'active',
    },
    update: {
      telegramBotToken: botToken,
      webhookSecret,
      status: 'active',
    },
  });

  return { webhookUrl };
}

export async function getChannelForAgent(agentId: string): Promise<{ id: string; platform: string; status: string } | null> {
  const channel = await prisma.channel.findUnique({
    where: { agentId_platform: { agentId, platform: 'telegram' } },
    select: { id: true, platform: true, status: true },
  });
  return channel;
}

export async function disconnectTelegram(agentId: string): Promise<void> {
  const user = await getSessionUser();
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) throw new NotFoundError('Agent');
  if (agent.userId !== user.id) throw new ForbiddenError('Not allowed to access this agent');

  const channel = await prisma.channel.findUnique({
    where: { agentId_platform: { agentId, platform: 'telegram' } },
  });
  if (channel) {
    try {
      await clearTelegramWebhook(channel.telegramBotToken);
    } catch {
      // best-effort; still delete channel
    }
    await prisma.channel.delete({ where: { id: channel.id } });
  }
}
