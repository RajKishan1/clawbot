import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/auth';
import { handleApiError } from '@/lib/server/api-handler';
import { apiRateLimitResponse } from '@/lib/server/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitRes = apiRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;
  try {
    await getSessionUser();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
