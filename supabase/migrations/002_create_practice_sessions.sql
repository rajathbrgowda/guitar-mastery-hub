-- ============================================================
-- 002: Practice sessions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date         DATE        NOT NULL,
  duration_min INTEGER     NOT NULL CHECK (duration_min > 0),
  sections     JSONB,
  -- sections shape: [{ "name": "Warm up", "duration_min": 5 }, ...]
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_user_date
  ON public.practice_sessions(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_practice_date
  ON public.practice_sessions(date DESC);

-- RLS
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON public.practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.practice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.practice_sessions FOR DELETE
  USING (auth.uid() = user_id);
