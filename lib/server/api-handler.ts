import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';

/** Maps errors to HTTP responses. AppError (e.g. UnauthorizedError) uses statusCode, so 401 for unauthenticated. */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { message: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  if (error instanceof ZodError) {
    const msg = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return NextResponse.json({ message: msg, code: 'VALIDATION_ERROR' }, { status: 400 });
  }
  console.error(error);
  return NextResponse.json(
    { message: error instanceof Error ? error.message : 'Internal server error' },
    { status: 500 }
  );
}
