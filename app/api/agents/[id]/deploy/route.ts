import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/auth';
import * as agentService from '@/lib/server/agent.service';
import { handleApiError } from '@/lib/server/api-handler';
import { apiRateLimitResponse } from '@/lib/server/rate-limit';
import { z } from 'zod';

const idParamSchema = z.object({ id: z.string().uuid() });

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const rateLimitRes = apiRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;
  try {
    const user = await getSessionUser();
    const { id } = idParamSchema.parse(await context.params);
    const result = await agentService.deploy(user.id, id);
    return NextResponse.json(result, { status: 202 });
  } catch (e) {
    return handleApiError(e);
  }
}
