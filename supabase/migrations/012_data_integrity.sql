-- Migration 012: Data integrity — curriculum isolation
-- Fix skill_progress unique constraint to include curriculum_key (idempotent re-run of 007 fix)
-- Add FK on daily_practice_plans.curriculum_key → curriculum_sources.key

-- ─────────────────────────────────────────────────────────────
-- 1. Backfill any skill_progress rows that still have a NULL curriculum_key
-- ─────────────────────────────────────────────────────────────
UPDATE skill_progress SET curriculum_key = 'best_of_all' WHERE curriculum_key IS NULL;

-- ─────────────────────────────────────────────────────────────
-- 2. Ensure the correct 4-column unique constraint exists on skill_progress
--    Migration 007 already created skill_progress_user_curriculum_phase_skill_key,
--    but drop-and-recreate is idempotent and guarantees the exact constraint name
--    used by the onConflict upsert in progress.ts.
-- ─────────────────────────────────────────────────────────────

-- Drop any legacy 3-column variant (created by migration 001 before 007 ran)
ALTER TABLE skill_progress DROP CONSTRAINT IF EXISTS skill_progress_user_id_phase_index_skill_index_key;
ALTER TABLE skill_progress DROP CONSTRAINT IF EXISTS unique_user_phase_skill;
ALTER TABLE skill_progress DROP CONSTRAINT IF EXISTS skill_progress_unique;

-- Drop and re-add the 4-column constraint so the name is canonical
ALTER TABLE skill_progress DROP CONSTRAINT IF EXISTS skill_progress_user_curriculum_phase_skill_key;
ALTER TABLE skill_progress
  ADD CONSTRAINT skill_progress_user_curriculum_phase_skill_key
  UNIQUE (user_id, curriculum_key, phase_index, skill_index);

-- ─────────────────────────────────────────────────────────────
-- 3. Add UNIQUE constraint on curriculum_sources.key if not present
--    (needed as FK target; migration 007 already has UNIQUE on key column
--     via the inline UNIQUE NOT NULL declaration, but we add the named
--     constraint so the FK below can reference it explicitly)
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'curriculum_sources_key_unique'
      AND conrelid = 'curriculum_sources'::regclass
  ) THEN
    ALTER TABLE curriculum_sources
      ADD CONSTRAINT curriculum_sources_key_unique UNIQUE (key);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. Add FK from daily_practice_plans.curriculum_key → curriculum_sources.key
--    ON DELETE RESTRICT prevents accidental removal of a curriculum that
--    has active plans.
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_dpp_curriculum_key'
      AND conrelid = 'daily_practice_plans'::regclass
  ) THEN
    ALTER TABLE daily_practice_plans
      ADD CONSTRAINT fk_dpp_curriculum_key
      FOREIGN KEY (curriculum_key)
      REFERENCES curriculum_sources(key)
      ON DELETE RESTRICT;
  END IF;
END $$;
