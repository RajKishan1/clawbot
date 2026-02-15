import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from '@kinde-oss/kinde-auth-nextjs/middleware';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.KINDE_SITE_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') ?? '';
  const allowOrigin =
    origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.ngrok-free.dev') || origin.endsWith('.ngrok.io'))
      ? origin
      : ALLOWED_ORIGINS[0] ?? 'http://localhost:3000';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

const authMiddleware = withAuth(async function middleware() {}, {
  loginPage: '/login',
  publicPaths: ['/', '/login', '/signup', '/api/auth', '/api/webhooks', '/api/health'],
});

function runAuthMiddleware(req: NextRequest): Promise<NextResponse> {
  const result = typeof authMiddleware === 'function' ? authMiddleware(req) : authMiddleware;
  return Promise.resolve(result);
}

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith('/api')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
    }
    const response = await runAuthMiddleware(request);
    const cors = getCorsHeaders(request);
    response.headers.set('Access-Control-Allow-Origin', cors['Access-Control-Allow-Origin']);
    response.headers.set('Access-Control-Allow-Methods', cors['Access-Control-Allow-Methods']);
    response.headers.set('Access-Control-Allow-Headers', cors['Access-Control-Allow-Headers']);
    return response;
  }
  return runAuthMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
