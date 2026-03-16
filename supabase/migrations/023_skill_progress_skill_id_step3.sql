-- Migration 023: DI-003 step 3 — NOT NULL + new unique constraint on skill_id
--
-- PRE-CONDITION: Run 022 first and verify:
--   SELECT COUNT(*) FROM skill_progress WHERE skill_id IS NULL;
-- should return 0 (or a tiny number of orphaned rows acceptable to discard).
--
-- This migration:
--   1. Deletes any orphaned rows (skill_id still NULL after backfill)
--   2. Sets skill_id NOT NULL
--   3. Adds UNIQUE (user_id, curriculum_key, skill_id) — the new canonical key
--   4. Drops the partial index created in step 1 (no longer needed)
--   5. Adds performance index on skill_id

-- 1. Remove orphaned rows (progress that could not be matched to a skill)
DELETE FROM skill_progress WHERE skill_id IS NULL;

-- 2. Make skill_id mandatory
ALTER TABLE skill_progress
  ALTER COLUMN skill_id SET NOT NULL;

-- 3. New unique constraint (replaces the positional index as canonical key)
--    Keep the old (user_id, curriculum_key, phase_index, skill_index) unique
--    constraint for now — backend progress.ts still uses it for upserts.
--    It will be dropped once progress.ts is updated to upsert by skill_id.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'skill_progress_user_curriculum_skill_key'
      AND conrelid = 'skill_progress'::regclass
  ) THEN
    ALTER TABLE skill_progress
      ADD CONSTRAINT skill_progress_user_curriculum_skill_key
      UNIQUE (user_id, curriculum_key, skill_id);
  END IF;
END $$;

-- 4. Drop the temporary partial index from step 1
DROP INDEX IF EXISTS idx_skill_progress_skill_id_null;

-- 5. Permanent performance index
CREATE INDEX IF NOT EXISTS idx_skill_progress_skill_id
  ON skill_progress (user_id, curriculum_key, skill_id);
