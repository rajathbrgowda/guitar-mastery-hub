-- Migration 007: Curriculum support
-- Adds multi-curriculum architecture: canonical skills, per-curriculum content,
-- daily practice plans with per-item completion tracking.

-- ─────────────────────────────────────────────────────────────
-- 1. CURRICULUM SOURCES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS curriculum_sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key           TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  author        TEXT,
  description   TEXT,
  style         TEXT,          -- 'structured' | 'song-first' | 'technique'
  website_url   TEXT,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one curriculum can be default
CREATE UNIQUE INDEX curriculum_sources_single_default
  ON curriculum_sources (is_default)
  WHERE is_default = TRUE;

-- ─────────────────────────────────────────────────────────────
-- 2. CANONICAL SKILLS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key               TEXT UNIQUE NOT NULL,
  category          TEXT NOT NULL CHECK (category IN ('chord','scale','technique','theory','song','warmup')),
  title             TEXT NOT NULL,
  description       TEXT,
  difficulty        INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 10),
  chord_diagram_key TEXT,       -- identifier for ChordDiagram component (e.g. 'Em', 'F')
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 3. CURRICULUM → SKILL MAPPING WITH PER-CURRICULUM CONTENT
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS curriculum_skill_entries (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id      UUID NOT NULL REFERENCES curriculum_sources(id) ON DELETE CASCADE,
  skill_id           UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  phase_number       INTEGER NOT NULL CHECK (phase_number BETWEEN 1 AND 10),
  phase_title        TEXT NOT NULL,
  sort_order         INTEGER NOT NULL DEFAULT 0,
  video_youtube_id   TEXT,      -- YouTube video ID (embed as /embed/{id})
  video_title        TEXT,
  practice_tip       TEXT,
  common_mistake     TEXT,
  practice_exercise  TEXT,      -- specific drill instruction
  UNIQUE (curriculum_id, skill_id)
);

CREATE INDEX curriculum_skill_entries_curriculum_phase
  ON curriculum_skill_entries (curriculum_id, phase_number, sort_order);

-- ─────────────────────────────────────────────────────────────
-- 4. DAILY PRACTICE PLANS (server-generated, one per user per day)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_practice_plans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date           DATE NOT NULL,
  curriculum_key      TEXT NOT NULL DEFAULT 'best_of_all',
  total_duration_min  INTEGER NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','in_progress','completed','skipped')),
  generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  UNIQUE (user_id, plan_date)
);

CREATE INDEX daily_practice_plans_user_date
  ON daily_practice_plans (user_id, plan_date DESC);

-- ─────────────────────────────────────────────────────────────
-- 5. PRACTICE PLAN ITEMS (individual exercises in a plan)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_practice_plan_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id              UUID NOT NULL REFERENCES daily_practice_plans(id) ON DELETE CASCADE,
  skill_id             UUID REFERENCES skills(id) ON DELETE SET NULL,
  skill_title          TEXT NOT NULL,   -- denormalised for display even if skill deleted
  skill_category       TEXT NOT NULL DEFAULT 'technique',
  duration_min         INTEGER NOT NULL CHECK (duration_min >= 1),
  sort_order           INTEGER NOT NULL,
  video_youtube_id     TEXT,
  practice_tip         TEXT,
  completed            BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at         TIMESTAMPTZ,
  actual_duration_min  INTEGER,         -- how long user actually spent
  UNIQUE (plan_id, sort_order)
);

CREATE INDEX daily_practice_plan_items_plan
  ON daily_practice_plan_items (plan_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- 6. ALTER EXISTING TABLES
-- ─────────────────────────────────────────────────────────────

-- Users: remember chosen curriculum
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS selected_curriculum_key TEXT NOT NULL DEFAULT 'best_of_all';

-- skill_progress: track which curriculum the progress belongs to
-- (allows independent progress when user switches curriculum)
ALTER TABLE skill_progress
  ADD COLUMN IF NOT EXISTS curriculum_key TEXT NOT NULL DEFAULT 'best_of_all';

-- Update unique constraint to include curriculum_key
-- (drop old unique if exists, add new one)
DO $$
BEGIN
  -- Drop legacy unique constraint if present
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'skill_progress_user_id_phase_index_skill_index_key'
  ) THEN
    ALTER TABLE skill_progress
      DROP CONSTRAINT skill_progress_user_id_phase_index_skill_index_key;
  END IF;
END $$;

ALTER TABLE skill_progress
  DROP CONSTRAINT IF EXISTS skill_progress_user_curriculum_phase_skill_key;

ALTER TABLE skill_progress
  ADD CONSTRAINT skill_progress_user_curriculum_phase_skill_key
  UNIQUE (user_id, curriculum_key, phase_index, skill_index);

-- ─────────────────────────────────────────────────────────────
-- 7. ROW-LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

-- curriculum_sources: public read (no PII)
ALTER TABLE curriculum_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "curriculum_sources_public_read"
  ON curriculum_sources FOR SELECT USING (true);

-- skills: public read
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills_public_read"
  ON skills FOR SELECT USING (true);

-- curriculum_skill_entries: public read
ALTER TABLE curriculum_skill_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "curriculum_skill_entries_public_read"
  ON curriculum_skill_entries FOR SELECT USING (true);

-- daily_practice_plans: owner only
ALTER TABLE daily_practice_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_practice_plans_owner_select"
  ON daily_practice_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_practice_plans_owner_insert"
  ON daily_practice_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_practice_plans_owner_update"
  ON daily_practice_plans FOR UPDATE USING (auth.uid() = user_id);

-- daily_practice_plan_items: owner via plan join
ALTER TABLE daily_practice_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_practice_plan_items_owner_select"
  ON daily_practice_plan_items FOR SELECT
  USING (plan_id IN (
    SELECT id FROM daily_practice_plans WHERE user_id = auth.uid()
  ));
CREATE POLICY "daily_practice_plan_items_owner_insert"
  ON daily_practice_plan_items FOR INSERT
  WITH CHECK (plan_id IN (
    SELECT id FROM daily_practice_plans WHERE user_id = auth.uid()
  ));
CREATE POLICY "daily_practice_plan_items_owner_update"
  ON daily_practice_plan_items FOR UPDATE
  USING (plan_id IN (
    SELECT id FROM daily_practice_plans WHERE user_id = auth.uid()
  ));
