-- Migration 010: Add onboarding_completed flag to users
-- New users are redirected to /onboarding until this is set to TRUE.
-- Existing users are grandfathered in as already completed.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Grandfather all existing users — they've already set up their account
UPDATE users SET onboarding_completed = TRUE;
