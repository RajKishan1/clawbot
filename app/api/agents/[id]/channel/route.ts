import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/auth';
import * as channelService from '@/lib/server/channel.service';
import { handleApiError } from '@/lib/server/api-handler';
import { apiRateLimitResponse } from '@/lib/server/rate-limit';
import { z } from 'zod';
import { prisma } from '@/lib/server/db';

const idParamSchema = z.object({ id: z.string().uuid() });
const connectBodySchema = z.object({ botToken: z.string().min(1) });

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rateLimitRes = apiRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;

  try {
    const user = await getSessionUser();
    const { id } = idParamSchema.parse(params);

    const agent = await prisma.agent.findUnique({ where: { id } });

    if (!agent || agent.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const channel = await channelService.getChannelForAgent(id);
    return NextResponse.json({ channel });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rateLimitRes = apiRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;

  try {
    await getSessionUser();
    const { id } = idParamSchema.parse(params);
    const body = connectBodySchema.parse(await request.json());

    const result = await channelService.connectTelegram(id, body.botToken);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rateLimitRes = apiRateLimitResponse(request);
  if (rateLimitRes) return rateLimitRes;

  try {
    await getSessionUser();
    const { id } = idParamSchema.parse(params);

    await channelService.disconnectTelegram(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleApiError(e);
  }
}
