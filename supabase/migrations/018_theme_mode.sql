-- Migration 018: Add theme_mode preference column to users
-- Allows per-user dark/light mode preference stored server-side
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS theme_mode TEXT NOT NULL DEFAULT 'light'
    CHECK (theme_mode IN ('light', 'dark'));
