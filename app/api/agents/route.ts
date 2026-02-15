/**
 * Agent CRUD. All handlers require authentication and operate only on the current user's agents.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/auth';
import * as agentService from '@/lib/server/agent.service';
import { listAgentsQuerySchema, createAgentBodySchema } from '@/lib/server/schemas/agent.schemas';
import { handleApiError } from '@/lib/server/api-handler';
import { apiRateLimitResponse } from '@/lib/server/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitRes = apiRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;
  try {
    const user = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const query = listAgentsQuerySchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });
    const result = await agentService.list(user.id, query);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: NextRequest) {
  const rateLimitRes = apiRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;
  try {
    const user = await getSessionUser();
    const body = createAgentBodySchema.parse(await request.json());
    const agent = await agentService.create(user.id, body);
    return NextResponse.json(agent, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
