import { z } from 'zod';
import type {
  DailyPracticePlan,
  PracticePlanItem,
  CompletePlanItemBody,
} from '@gmh/shared/types/practice-plan';

export const completePlanItemSchema = z.object({
  actual_duration_min: z.number().int().min(1).max(480).optional(),
  confidence_rating: z.number().int().min(1).max(3).optional(),
});

export const skipPlanSchema = z.object({
  reason: z.string().max(200).optional(),
});

// Type assertions
type _AssertComplete =
  z.infer<typeof completePlanItemSchema> extends CompletePlanItemBody ? true : never;
declare const _s1: _AssertComplete;

type _AssertPlan = DailyPracticePlan extends {
  id: string;
  user_id: string;
  status: string;
  items: PracticePlanItem[];
}
  ? true
  : never;
declare const _s2: _AssertPlan;
