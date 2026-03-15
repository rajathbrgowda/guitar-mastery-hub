-- Migration 015: mastery state tracking on skill_progress
-- Adds last_practiced_at and mastery_state to enable the Mastery Map feature.

ALTER TABLE public.skill_progress
  ADD COLUMN IF NOT EXISTS last_practiced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mastery_state TEXT DEFAULT 'not_started'
    CHECK (mastery_state IN ('not_started', 'learning', 'mastered', 'rusty'));

-- Backfill mastery_state for existing rows
UPDATE public.skill_progress
  SET mastery_state = CASE
    WHEN completed = TRUE THEN 'mastered'
    WHEN completed = FALSE THEN 'learning'
    ELSE 'not_started'
  END
  WHERE mastery_state = 'not_started' OR mastery_state IS NULL;

-- Backfill last_practiced_at from completed_at for completed skills
UPDATE public.skill_progress
  SET last_practiced_at = completed_at
  WHERE completed = TRUE AND completed_at IS NOT NULL AND last_practiced_at IS NULL;

-- Index for rusty-check queries
CREATE INDEX IF NOT EXISTS idx_skill_progress_mastery
  ON public.skill_progress (user_id, curriculum_key, mastery_state)
  WHERE mastery_state IN ('mastered', 'rusty');
