import { z } from 'zod';
import type { CurriculumSource, CurriculumDetail } from '@gmh/shared/types/curriculum';

export const curriculumKeySchema = z.object({
  key: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_]+$/, 'Key must be lowercase alphanumeric with underscores'),
});

export const switchCurriculumSchema = z.object({
  curriculum_key: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_]+$/),
});

// Type assertion: backend response shape matches shared contract
type _AssertSource = z.infer<typeof curriculumKeySchema> extends { key: string } ? true : never;
declare const _s1: _AssertSource;

type _AssertCurriculumSource = CurriculumSource extends {
  id: string;
  key: string;
  name: string;
}
  ? true
  : never;
declare const _s2: _AssertCurriculumSource;

type _AssertCurriculumDetail = CurriculumDetail extends CurriculumSource ? true : never;
declare const _s3: _AssertCurriculumDetail;
