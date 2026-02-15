'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth as apiAuth, type User } from '@/lib/api';

const TOKEN_KEY = 'clawbot_token';

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const t = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null;
    if (!t) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }
    try {
      const u = await apiAuth.me(t);
      setUser(u);
      setToken(t);
    } catch {
      sessionStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const res = await apiAuth.signIn({ email, password });
        sessionStorage.setItem(TOKEN_KEY, res.token);
        setToken(res.token);
        setUser(res.user);
        router.push('/dashboard');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Sign in failed');
        throw e;
      }
    },
    [router]
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      setError(null);
      try {
        const res = await apiAuth.signUp({ email, password, name });
        sessionStorage.setItem(TOKEN_KEY, res.token);
        setToken(res.token);
        setUser(res.user);
        router.push('/dashboard');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Sign up failed');
        throw e;
      }
    },
    [router]
  );

  const signOut = useCallback(async () => {
    if (token) {
      try {
        await apiAuth.signOut(token);
      } catch {
        /* ignore */
      }
    }
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [token, router]);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
