-- ============================================================
-- 004: Resource completions (per-user progress on resources)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.resource_completions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resource_id UUID        NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  completion  INTEGER     NOT NULL DEFAULT 0 CHECK (completion BETWEEN 0 AND 100),
  -- 0 = not started, 1–99 = in progress, 100 = complete
  started_at  TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_resource_completions_user
  ON public.resource_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_resource_completions_resource
  ON public.resource_completions(resource_id);

-- Auto-set timestamps based on completion value
CREATE OR REPLACE FUNCTION public.handle_resource_completion_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.completion > 0 AND OLD.completion = 0 THEN
    NEW.started_at = NOW();
  END IF;
  IF NEW.completion = 100 AND OLD.completion < 100 THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_resource_completion_update ON public.resource_completions;
CREATE TRIGGER on_resource_completion_update
  BEFORE UPDATE ON public.resource_completions
  FOR EACH ROW EXECUTE FUNCTION public.handle_resource_completion_update();

-- RLS
ALTER TABLE public.resource_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own completions"
  ON public.resource_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.resource_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON public.resource_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON public.resource_completions FOR DELETE
  USING (auth.uid() = user_id);
