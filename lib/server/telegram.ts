/**
 * Telegram Bot API helpers. Server-only.
 */

const TELEGRAM_API = 'https://api.telegram.org/bot';

export async function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<void> {
  const url = `${TELEGRAM_API}${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram sendMessage failed: ${res.status} ${err}`);
  }
}

/** Set webhook URL and optional secret_token (Telegram sends it in X-Telegram-Bot-Api-Secret-Token for verification). */
export async function setTelegramWebhook(
  botToken: string,
  webhookUrl: string,
  secretToken?: string
): Promise<void> {
  const url = `${TELEGRAM_API}${botToken}/setWebhook`;
  const body: { url: string; secret_token?: string } = { url: webhookUrl };
  if (secretToken) body.secret_token = secretToken;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram setWebhook failed: ${res.status} ${err}`);
  }
}

export async function clearTelegramWebhook(botToken: string): Promise<void> {
  await setTelegramWebhook(botToken, '');
}

export type TelegramUpdate = {
  update_id: number;
  message?: {
    chat: { id: number };
    text?: string;
  };
  callback_query?: unknown;
};

export function extractMessageFromUpdate(update: TelegramUpdate): { chatId: string; text: string } | null {
  if (update.message?.text) {
    return { chatId: String(update.message.chat.id), text: update.message.text };
  }
  return null;
}
