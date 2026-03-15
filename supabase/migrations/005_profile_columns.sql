-- ============================================================
-- 005: Add profile columns to public.users
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS guitar_type          TEXT    NOT NULL DEFAULT 'acoustic'
                                                CHECK (guitar_type IN ('acoustic','electric','classical','bass','other')),
  ADD COLUMN IF NOT EXISTS years_playing        INTEGER NOT NULL DEFAULT 0 CHECK (years_playing >= 0),
  ADD COLUMN IF NOT EXISTS daily_goal_min       INTEGER NOT NULL DEFAULT 20 CHECK (daily_goal_min > 0),
  ADD COLUMN IF NOT EXISTS practice_days_target INTEGER NOT NULL DEFAULT 5 CHECK (practice_days_target BETWEEN 1 AND 7),
  ADD COLUMN IF NOT EXISTS timezone             TEXT    NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS avatar_url           TEXT;
