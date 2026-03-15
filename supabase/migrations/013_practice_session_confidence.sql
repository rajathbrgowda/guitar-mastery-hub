-- Migration 013: Add session-level confidence to practice_sessions
-- Stores how the overall session felt (not per-skill, which lives in daily_practice_plan_items).
-- 1 = Hard (tough session, struggled)
-- 2 = Okay  (average, getting there)
-- 3 = Easy  (felt great, ready to advance)
-- NULL = not rated (optional field)

ALTER TABLE public.practice_sessions
  ADD COLUMN IF NOT EXISTS confidence SMALLINT
    CHECK (confidence BETWEEN 1 AND 3);

COMMENT ON COLUMN public.practice_sessions.confidence IS
  '1=Hard, 2=Okay, 3=Easy — optional session-level self-rating logged with the session';
