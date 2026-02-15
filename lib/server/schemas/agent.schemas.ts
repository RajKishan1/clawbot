import { z } from 'zod';

export const createAgentBodySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  systemPrompt: z.string().max(10000).optional(),
  modelKey: z.string().min(1).max(100),
  modelParams: z.record(z.string(), z.unknown()).optional(),
});

export const updateAgentBodySchema = createAgentBodySchema.partial();

export type CreateAgentBody = z.infer<typeof createAgentBodySchema>;
export type UpdateAgentBody = z.infer<typeof updateAgentBodySchema>;

export const listAgentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListAgentsQuery = z.infer<typeof listAgentsQuerySchema>;

export type Agent = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  systemPrompt: string | null;
  modelKey: string;
  modelParams: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AgentListResponse = {
  agents: Agent[];
  total: number;
  page: number;
  limit: number;
};
