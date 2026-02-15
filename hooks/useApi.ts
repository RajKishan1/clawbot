'use client';

import { useMemo } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import * as api from '@/lib/api';

/**
 * Returns an API client that uses the Kinde access token. Use in components
 * that need to call the backend; token is obtained from Kinde on each request.
 */
export function useApi() {
  const { getAccessTokenRaw } = useKindeBrowserClient();

  return useMemo(() => {
    const withToken = (fn: (t: string, ...args: unknown[]) => Promise<unknown>) =>
      async (...args: unknown[]) => {
        const token = await getAccessTokenRaw();
        return fn(token ?? '', ...args);
      };

    return {
      auth: {
        signOut: withToken(api.auth.signOut as (t: string) => Promise<unknown>),
        me: withToken(api.auth.me as (t: string) => Promise<unknown>),
      },
      agents: {
        list: withToken(api.agents.list as (t: string, ...a: unknown[]) => Promise<unknown>),
        create: withToken(api.agents.create as (t: string, ...a: unknown[]) => Promise<unknown>),
        get: withToken(api.agents.get as (t: string, ...a: unknown[]) => Promise<unknown>),
        update: withToken(api.agents.update as (t: string, ...a: unknown[]) => Promise<unknown>),
        delete: withToken(api.agents.delete as (t: string, ...a: unknown[]) => Promise<unknown>),
        deploy: withToken(api.agents.deploy as (t: string, ...a: unknown[]) => Promise<unknown>),
      },
      channels: {
        get: withToken(api.channels.get as (t: string, ...a: unknown[]) => Promise<unknown>),
        connect: withToken(api.channels.connect as (t: string, ...a: unknown[]) => Promise<unknown>),
        disconnect: withToken(api.channels.disconnect as (t: string, ...a: unknown[]) => Promise<unknown>),
      },
      conversations: {
        list: withToken(api.conversations.list as (t: string, ...a: unknown[]) => Promise<unknown>),
        messages: withToken(api.conversations.messages as (t: string, ...a: unknown[]) => Promise<unknown>),
      },
      getToken: getAccessTokenRaw,
    };
  }, [getAccessTokenRaw]);
}
