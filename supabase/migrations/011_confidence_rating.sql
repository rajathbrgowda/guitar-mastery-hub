-- Migration 011: Add confidence_rating to daily_practice_plan_items
-- 1 = hard (needs more work)
-- 2 = okay (getting there)
-- 3 = easy (consolidation / near mastery)
-- NULL = item was not rated (skipped or completed before this feature)

ALTER TABLE daily_practice_plan_items
  ADD COLUMN IF NOT EXISTS confidence_rating INTEGER
    CHECK (confidence_rating BETWEEN 1 AND 3);

-- Index used by plan algorithm v2 to query confidence history per skill
CREATE INDEX IF NOT EXISTS idx_dppi_skill_confidence
  ON daily_practice_plan_items (skill_id, confidence_rating)
  WHERE confidence_rating IS NOT NULL;
