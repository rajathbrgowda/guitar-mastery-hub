-- Migration 014: add confidence column to skill_progress
-- Stores per-skill mastery confidence: 1=hard, 2=okay, 3=easy, NULL=not yet rated
ALTER TABLE skill_progress
  ADD COLUMN IF NOT EXISTS confidence INTEGER CHECK (confidence BETWEEN 1 AND 3);

-- Index for roadmap queries that filter by confidence
CREATE INDEX IF NOT EXISTS idx_skill_progress_confidence
  ON skill_progress (user_id, curriculum_key, confidence)
  WHERE confidence IS NOT NULL;
