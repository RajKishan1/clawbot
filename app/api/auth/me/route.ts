import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/auth';
import { prisma } from '@/lib/server/db';
import { handleApiError } from '@/lib/server/api-handler';
import { apiRateLimitResponse } from '@/lib/server/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitRes = apiRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;
  try {
    const sessionUser = await getSessionUser();
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new Error('User not found');
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
