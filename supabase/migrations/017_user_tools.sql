-- Migration 017: user_tools table
-- Stores which tools each user has marked as "I use this"

CREATE TABLE IF NOT EXISTS public.user_tools (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tool_key    TEXT          NOT NULL,
  is_using    BOOLEAN       NOT NULL DEFAULT TRUE,
  notes       TEXT,
  added_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, tool_key)
);

CREATE INDEX IF NOT EXISTS idx_user_tools_user ON public.user_tools (user_id);

ALTER TABLE public.user_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_tools: user owns rows"
  ON public.user_tools
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
