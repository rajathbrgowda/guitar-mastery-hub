-- Migration 031: BPM (beats per minute) tracking for technique skills
-- Allows users to log their speed on technique exercises over time.

CREATE TABLE IF NOT EXISTS bpm_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_key  TEXT NOT NULL,
  bpm        INTEGER NOT NULL CHECK (bpm > 0 AND bpm < 400),
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bpm_logs_user_skill
  ON bpm_logs (user_id, skill_key, logged_at DESC);

-- RLS
ALTER TABLE bpm_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bpm_logs' AND policyname = 'bpm_logs_select_own') THEN
    CREATE POLICY bpm_logs_select_own ON bpm_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bpm_logs' AND policyname = 'bpm_logs_insert_own') THEN
    CREATE POLICY bpm_logs_insert_own ON bpm_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bpm_logs' AND policyname = 'bpm_logs_delete_own') THEN
    CREATE POLICY bpm_logs_delete_own ON bpm_logs FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
