import { z } from 'zod';
import type { UpdateCompletionBody, ResourcesResponse } from '@gmh/shared/types/resources';

export const updateCompletionSchema = z.object({
  completion: z.number().int().min(0).max(100),
});

// Type assertion — ensures Zod schema stays in sync with shared contract
type _AssertCompletion =
  z.infer<typeof updateCompletionSchema> extends UpdateCompletionBody ? true : never;
declare const _s1: _AssertCompletion;

const resourceTypeSchema = z.enum(['video', 'tab', 'article', 'exercise', 'tool']);
const resourceStatusSchema = z.enum(['not_started', 'in_progress', 'completed']);

export const resourceWithCompletionSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().nullable(),
  type: resourceTypeSchema,
  phase_index: z.number(),
  is_featured: z.boolean(),
  description: z.string().nullable(),
  completion: z.number(),
  status: resourceStatusSchema,
  is_recommended: z.boolean(),
});

export const resourcesResponseSchema = z.object({
  recommended: z.array(resourceWithCompletionSchema),
  all: z.array(resourceWithCompletionSchema),
});

// Type assertion — ensures Zod schema stays in sync with shared contract
type _AssertResourcesResponse =
  z.infer<typeof resourcesResponseSchema> extends ResourcesResponse ? true : never;
declare const _s2: _AssertResourcesResponse;
