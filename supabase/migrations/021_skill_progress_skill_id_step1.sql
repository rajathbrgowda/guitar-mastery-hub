-- Migration 021: DI-003 step 1 — add skill_id FK (nullable) to skill_progress
--
-- CONTEXT (DI-003): skill_progress currently uses positional indices
-- (phase_index, skill_index) to identify skills. If a curriculum ever
-- reorders its skills, existing progress rows silently point to the wrong
-- skill. This three-step migration replaces the positional key with a
-- proper skill_id FK.
--
-- STEP 1: Add the nullable column. No data change yet. Safe to run on
-- production immediately — nothing breaks since skill_id is optional here.

ALTER TABLE skill_progress
  ADD COLUMN IF NOT EXISTS skill_id UUID
    REFERENCES skills(id) ON DELETE CASCADE;

-- Partial index (useful for queries during backfill phase)
CREATE INDEX IF NOT EXISTS idx_skill_progress_skill_id_null
  ON skill_progress (user_id, curriculum_key)
  WHERE skill_id IS NULL;
