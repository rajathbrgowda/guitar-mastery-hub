import { z } from 'zod';
import type { UpdateCompletionBody } from '@gmh/shared/types/resources';

export const updateCompletionSchema = z.object({
  completion: z.number().int().min(0).max(100),
});

// Type assertion — ensures Zod schema stays in sync with shared contract
type _AssertCompletion =
  z.infer<typeof updateCompletionSchema> extends UpdateCompletionBody ? true : never;
declare const _s1: _AssertCompletion;
