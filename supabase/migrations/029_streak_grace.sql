-- Migration 029: Add streak grace-day columns to users
-- Enables a forgiving streak: 1 missed day per calendar week does not break the streak.
-- Grace resets every Monday.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'streak_grace_week_used') THEN
    ALTER TABLE users ADD COLUMN streak_grace_week_used INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'streak_grace_week_start') THEN
    ALTER TABLE users ADD COLUMN streak_grace_week_start DATE;
  END IF;
END $$;
