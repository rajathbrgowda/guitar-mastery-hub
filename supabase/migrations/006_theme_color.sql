-- Migration 006: add theme_color column to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'helix'
    CHECK (theme_color IN ('helix', 'ocean', 'forest', 'violet', 'rose'));
