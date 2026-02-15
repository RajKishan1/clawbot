'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

// Brief delay before redirecting when client reports not authenticated, to avoid
// redirect loop right after OAuth (session may not be in client state yet).
const REDIRECT_DELAY_MS = 1500;

export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useKindeBrowserClient();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      setShouldRedirect(false);
      return;
    }
    const t = setTimeout(() => setShouldRedirect(true), REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (shouldRedirect) router.replace('/login');
  }, [shouldRedirect, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated && shouldRedirect) {
    return null;
  }

  return <>{children}</>;
}
