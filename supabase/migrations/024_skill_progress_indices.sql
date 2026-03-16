-- Migration 024: performance indices for skill_progress + curriculum queries
--
-- Adds indices that improve roadmap query performance as the user base grows.
-- All use IF NOT EXISTS so safe to re-run.

-- Fast lookup: all skills a user has completed in a given curriculum
CREATE INDEX IF NOT EXISTS idx_skill_progress_user_curriculum
  ON skill_progress (user_id, curriculum_key);

-- Fast lookup for roadmap "focus skill" query (lowest confidence in current phase)
-- Uses partial index — only rows with a confidence rating
CREATE INDEX IF NOT EXISTS idx_skill_progress_skill_confidence
  ON skill_progress (skill_id, confidence)
  WHERE confidence IS NOT NULL AND completed = FALSE;

-- Curriculum sources key lookup (used in every roadmap query)
CREATE INDEX IF NOT EXISTS idx_curriculum_sources_key
  ON curriculum_sources (key)
  WHERE is_active = TRUE;

-- Curriculum skill entries: fast phase listing per curriculum
CREATE INDEX IF NOT EXISTS idx_cse_curriculum_phase
  ON curriculum_skill_entries (curriculum_id, phase_number, sort_order);
