-- Migration 018: fix resource type values to match shared ResourceType
-- Root cause: migration 003 seeded resources with type='course' and type='link',
-- but shared/types/resources.ts only defines 'video'|'tab'|'article'|'exercise'|'tool'.
-- This caused resources to vanish under type-filter tabs and broke icon rendering.

-- Step 1: remap legacy types to valid ResourceType values
UPDATE public.resources SET type = 'video'   WHERE type = 'course';
UPDATE public.resources SET type = 'article' WHERE type = 'link';

-- Step 2: add CHECK constraint so this drift can never happen again
ALTER TABLE public.resources
  ADD CONSTRAINT resources_type_check
  CHECK (type IN ('video', 'tab', 'article', 'exercise', 'tool'));

-- Step 3: change the column default away from the now-invalid 'link'
ALTER TABLE public.resources
  ALTER COLUMN type SET DEFAULT 'article';
