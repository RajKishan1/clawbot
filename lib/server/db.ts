import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Connection pool / logging configuration for serverless Postgres (Neon)
// Use Prisma's typed LogLevel array to avoid TS incompatibilities.
const logLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'];

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: logLevels });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle connection cleanup on process termination
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

/**
 * Retry a Prisma query if it fails with a connection error.
 * Useful for serverless Postgres (Neon) where connections can be closed.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 100
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isConnectionError =
        errorMessage.includes('Closed') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('P1001');

      if (isConnectionError && attempt < maxRetries) {
        // Wait before retrying, with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
