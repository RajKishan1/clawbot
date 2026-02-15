import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { prisma } from './db';
import { UnauthorizedError } from './errors';

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};

/**
 * Returns the current user from Kinde session, resolved to our DB User (by kindeId).
 * Session is maintained by Kinde (cookies). Use in API routes that require auth.
 * Throws UnauthorizedError if not authenticated (caller should return 401).
 */
export async function getSessionUser(): Promise<SessionUser> {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  const authenticated = await isAuthenticated();

  if (!authenticated || !kindeUser?.id) {
    throw new UnauthorizedError('Not authenticated');
  }

  const kindeId = kindeUser.id;
  const email = kindeUser.email ?? '';
  const name = kindeUser.given_name || kindeUser.family_name
    ? [kindeUser.given_name, kindeUser.family_name].filter(Boolean).join(' ')
    : kindeUser.given_name ?? kindeUser.family_name ?? null;

  let user = await prisma.user.findUnique({
    where: { kindeId },
    select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        kindeId,
        email: email || `kinde-${kindeId}@placeholder.local`,
        name: name ?? null,
      },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
  };
}
