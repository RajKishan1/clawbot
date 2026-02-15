/**
 * In-memory rate limiter (per-IP). For production at scale, use Redis (e.g. @upstash/ratelimit).
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const API_LIMIT = 120;       // requests per window per IP
const WEBHOOK_LIMIT = 60;    // webhook requests per window per IP

function getWindowKey(ip: string, prefix: string): string {
  const now = Date.now();
  const windowStart = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  return `${prefix}:${ip}:${windowStart}`;
}

function check(ip: string, prefix: string, limit: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  const key = getWindowKey(ip, prefix);
  let entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
  }
  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  const ok = entry.count <= limit;
  return { ok, remaining };
}

/** Get client IP from request (supports x-forwarded-for behind proxy). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

export function checkApiRateLimit(request: Request): { ok: boolean; remaining: number } {
  const ip = getClientIp(request);
  return check(ip, 'api', API_LIMIT);
}

export function checkWebhookRateLimit(request: Request): { ok: boolean; remaining: number } {
  const ip = getClientIp(request);
  return check(ip, 'webhook', WEBHOOK_LIMIT);
}

/** Returns a 429 Response if over limit; otherwise null (caller proceeds). */
export function apiRateLimitResponse(request: Request): Response | null {
  pruneStore();
  const { ok, remaining } = checkApiRateLimit(request);
  if (ok) return null;
  return new Response(
    JSON.stringify({ message: 'Too many requests', code: 'RATE_LIMITED' }),
    { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
  );
}

/** Returns a 429 Response if over limit; otherwise null. */
export function webhookRateLimitResponse(request: Request): Response | null {
  pruneStore();
  const { ok } = checkWebhookRateLimit(request);
  if (ok) return null;
  return new Response(
    JSON.stringify({ error: 'Too many requests' }),
    { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
  );
}

/** Optional: prune old entries to avoid unbounded growth (call periodically or on each check). */
export function pruneStore(): void {
  const now = Date.now();
  Array.from(store.entries()).forEach(([key, entry]) => {
    if (now >= entry.resetAt) store.delete(key);
  });
}
