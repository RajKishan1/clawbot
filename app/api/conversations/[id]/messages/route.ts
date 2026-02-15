import { NextRequest, NextResponse } from 'next/server';
import * as conversationService from '@/lib/server/conversation.service';
import { handleApiError } from '@/lib/server/api-handler';
import { apiRateLimitResponse } from '@/lib/server/rate-limit';
import { z } from 'zod';

const idParamSchema = z.object({ id: z.string().uuid() });

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const rateLimitRes = apiRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;
  try {
    const { id: conversationId } = idParamSchema.parse(await context.params);
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const before = searchParams.get('before') ?? undefined;
    const result = await conversationService.listMessages(conversationId, { limit, before });
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
