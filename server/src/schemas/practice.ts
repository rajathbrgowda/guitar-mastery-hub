import { z } from 'zod';
import type { PracticeSession, NewSession } from '@gmh/shared/types/practice';

export const sectionSchema = z.object({
  name: z.string().min(1),
  duration_min: z.number().int().positive(),
});

export const logSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  duration_min: z.number().int().positive(),
  sections: z.array(sectionSchema).optional(),
  notes: z.string().max(1000).optional(),
});

// Type assertions — ensures Zod schemas stay in sync with shared contract
type _AssertNewSession =
  z.infer<typeof logSessionSchema> extends Omit<NewSession, 'sections'> & {
    sections?: NewSession['sections'];
  }
    ? true
    : never;
type _AssertSection =
  z.infer<typeof sectionSchema> extends NonNullable<PracticeSession['sections']>[number]
    ? true
    : never;
// Suppress unused variable warnings for type-only assertions
declare const _s1: _AssertNewSession;
declare const _s2: _AssertSection;
