import { z } from 'zod';
import type { ToggleSkillBody, SetPhaseBody } from '@gmh/shared/types/progress';

export const toggleSkillSchema = z.object({
  phase_index: z.number().int().min(0),
  skill_index: z.number().int().min(0),
  completed: z.boolean(),
});

export const setPhaseSchema = z.object({
  current_phase: z.number().int().min(0).max(4),
});

// Type assertions — ensures Zod schemas stay in sync with shared contract
type _AssertToggle = z.infer<typeof toggleSkillSchema> extends ToggleSkillBody ? true : never;
type _AssertPhase = z.infer<typeof setPhaseSchema> extends SetPhaseBody ? true : never;
declare const _s1: _AssertToggle;
declare const _s2: _AssertPhase;
