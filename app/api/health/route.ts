/**
 * Health check: env validation + DB connection.
 * GET /api/health → 200 { status: 'ok' } or 503 with error detail.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';

const REQUIRED_ENV = ['DATABASE_URL'] as const;

export async function GET() {
  // 1. Env validation
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    return NextResponse.json(
      { status: 'error', message: 'Missing env', missing },
      { status: 503 }
    );
  }

  // 2. DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Database connection failed';
    return NextResponse.json(
      { status: 'error', message: 'Database unavailable', detail: message },
      { status: 503 }
    );
  }

  return NextResponse.json({ status: 'ok' });
}
