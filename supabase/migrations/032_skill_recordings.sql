-- Migration 032: Skill recordings — self-recording for before/after comparison
-- Files stored in Supabase Storage bucket 'skill-recordings', metadata here.

CREATE TABLE IF NOT EXISTS skill_recordings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_key      TEXT NOT NULL,
  curriculum_key TEXT NOT NULL DEFAULT 'best_of_all',
  storage_path   TEXT NOT NULL,
  duration_sec   INTEGER,
  notes          TEXT,
  content_type   TEXT NOT NULL DEFAULT 'audio/webm',
  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_recordings_user_skill
  ON skill_recordings (user_id, skill_key, recorded_at DESC);

-- RLS
ALTER TABLE skill_recordings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'skill_recordings' AND policyname = 'skill_recordings_select_own') THEN
    CREATE POLICY skill_recordings_select_own ON skill_recordings FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'skill_recordings' AND policyname = 'skill_recordings_insert_own') THEN
    CREATE POLICY skill_recordings_insert_own ON skill_recordings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'skill_recordings' AND policyname = 'skill_recordings_delete_own') THEN
    CREATE POLICY skill_recordings_delete_own ON skill_recordings FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
