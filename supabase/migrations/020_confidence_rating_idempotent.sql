-- Migration 020: confidence_rating on daily_practice_plan_items (idempotent)
-- The column was added by a prior hotfix. This migration makes it canonical
-- in the migration history so the schema is fully reproducible from scratch.
-- Safe to run on a DB where the column already exists.

ALTER TABLE daily_practice_plan_items
  ADD COLUMN IF NOT EXISTS confidence_rating SMALLINT
    CHECK (confidence_rating BETWEEN 1 AND 3);

-- Index for analytics queries grouping by confidence
CREATE INDEX IF NOT EXISTS idx_dppi_confidence
  ON daily_practice_plan_items (skill_id, confidence_rating)
  WHERE confidence_rating IS NOT NULL;
