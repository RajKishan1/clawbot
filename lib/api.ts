/**
 * API base URL. Empty = same-origin (Next.js /api routes). Set NEXT_PUBLIC_API_URL for external backend.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/** Extract a user-facing error message from an API or unknown error. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return fallback;
}

type RequestConfig = RequestInit & { token?: string | null };

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { token, ...init } = config;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const url = API_URL ? `${API_URL}${path}` : path;
  const res = await fetch(url, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = { user: User; token: string; expiresIn?: string };

export const auth = {
  signIn: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/signin', { method: 'POST', body: JSON.stringify(body) }),
  signUp: (body: { email: string; password: string; name?: string }) =>
    request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  signOut: (token: string) =>
    request<void>('/api/auth/signout', { method: 'POST', token }),
  me: (token: string) => request<User>('/api/auth/me', { token }),
};

export type Agent = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  systemPrompt: string | null;
  modelKey: string;
  modelParams: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentListResponse = { agents: Agent[]; total: number; page: number; limit: number };

export type CreateAgentBody = {
  name: string;
  description?: string;
  systemPrompt?: string;
  modelKey: string;
  modelParams?: Record<string, unknown>;
};

export const agents = {
  list: (token: string, params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const query = q.toString();
    return request<AgentListResponse>(`/api/agents${query ? `?${query}` : ''}`, { token });
  },
  create: (token: string, body: CreateAgentBody) =>
    request<Agent>('/api/agents', { method: 'POST', body: JSON.stringify(body), token }),
  get: (token: string, id: string) => request<Agent>(`/api/agents/${id}`, { token }),
  update: (token: string, id: string, body: Partial<CreateAgentBody>) =>
    request<Agent>(`/api/agents/${id}`, { method: 'PATCH', body: JSON.stringify(body), token }),
  delete: (token: string, id: string) =>
    request<void>(`/api/agents/${id}`, { method: 'DELETE', token }),
  deploy: (token: string, id: string) =>
    request<{ status: string }>(`/api/agents/${id}/deploy`, { method: 'POST', token }),
};

export type ChannelInfo = { id: string; platform: string; status: string } | null;

export const channels = {
  get: (token: string, agentId: string) =>
    request<{ channel: ChannelInfo }>(`/api/agents/${agentId}/channel`, { token }),
  connect: (token: string, agentId: string, body: { botToken: string }) =>
    request<{ webhookUrl: string }>(`/api/agents/${agentId}/channel`, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }),
  disconnect: (token: string, agentId: string) =>
    request<void>(`/api/agents/${agentId}/channel`, { method: 'DELETE', token }),
};

export type ConversationSummary = {
  id: string;
  agentId: string;
  channelId: string | null;
  telegramChatId: string;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
};

export type MessageRow = {
  id: string;
  role: string;
  content: string;
  source: string;
  createdAt: string;
};

export const conversations = {
  list: (token: string, agentId: string, params?: { limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit != null) q.set('limit', String(params.limit));
    if (params?.offset != null) q.set('offset', String(params.offset));
    const query = q.toString();
    return request<{ conversations: ConversationSummary[]; total: number }>(
      `/api/agents/${agentId}/conversations${query ? `?${query}` : ''}`,
      { token }
    );
  },
  messages: (token: string, conversationId: string, params?: { limit?: number; before?: string }) => {
    const q = new URLSearchParams();
    if (params?.limit != null) q.set('limit', String(params.limit));
    if (params?.before) q.set('before', params.before);
    const query = q.toString();
    return request<{ messages: MessageRow[]; hasMore: boolean }>(
      `/api/conversations/${conversationId}/messages${query ? `?${query}` : ''}`,
      { token }
    );
  },
};
