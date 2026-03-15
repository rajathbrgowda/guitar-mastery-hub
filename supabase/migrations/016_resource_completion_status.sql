-- Migration 016: add status column to resource_completions
-- status: 'not_started' | 'in_progress' | 'completed'
-- replaces pure percentage-based tracking with explicit lifecycle state

ALTER TABLE resource_completions
  ADD COLUMN IF NOT EXISTS status TEXT
    CHECK (status IN ('not_started', 'in_progress', 'completed'))
    DEFAULT 'not_started';

-- Backfill: infer status from existing completion percentage
UPDATE resource_completions SET status = CASE
  WHEN completion = 0 THEN 'not_started'
  WHEN completion >= 100 THEN 'completed'
  ELSE 'in_progress'
END
WHERE status = 'not_started' OR status IS NULL;

CREATE INDEX IF NOT EXISTS idx_resource_completions_status
  ON resource_completions (user_id, status);
