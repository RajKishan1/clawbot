/**
 * Single-agent GET/PATCH/DELETE. Requires auth; ownership enforced (user can only access their agents).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/auth';
import * as agentService from '@/lib/server/agent.service';
import { updateAgentBodySchema } from '@/lib/server/schemas/agent.schemas';
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
    const user = await getSessionUser();
    const { id } = idParamSchema.parse(await context.params);
    const agent = await agentService.getById(user.id, id);
    return NextResponse.json(agent);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const rateLimitRes = apiRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;
  try {
    const user = await getSessionUser();
    const { id } = idParamSchema.parse(await context.params);
    const body = updateAgentBodySchema.parse(await request.json());
    const agent = await agentService.update(user.id, id, body);
    return NextResponse.json(agent);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const rateLimitRes = apiRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;
  try {
    const user = await getSessionUser();
    const { id } = idParamSchema.parse(await context.params);
    await agentService.remove(user.id, id);
    return new NextResponse(undefined, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
