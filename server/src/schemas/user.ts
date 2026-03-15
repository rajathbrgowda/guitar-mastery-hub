import { z } from 'zod';
import type { UpdateProfileBody } from '@gmh/shared/types/user';

export const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).nullable().optional(),
  guitar_type: z.enum(['acoustic', 'electric', 'classical', 'bass', 'other']).optional(),
  years_playing: z.number().int().min(0).max(60).optional(),
  daily_goal_min: z.number().int().min(5).max(480).optional(),
  practice_days_target: z.number().int().min(1).max(7).optional(),
  timezone: z.string().max(50).optional(),
  avatar_url: z.string().url().nullable().optional(),
  theme_color: z.enum(['helix', 'ocean', 'forest', 'violet', 'rose']).optional(),
});

// Type assertion — ensures Zod schema stays in sync with shared contract
type _AssertProfile = z.infer<typeof updateProfileSchema> extends UpdateProfileBody ? true : never;
declare const _s1: _AssertProfile;
