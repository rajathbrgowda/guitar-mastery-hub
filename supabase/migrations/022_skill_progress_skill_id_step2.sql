-- Migration 022: DI-003 step 2 — backfill skill_progress.skill_id
--
-- Mapping:
--   skill_progress.phase_index  → curriculum_skill_entries.phase_number - 1
--   skill_progress.skill_index  → curriculum_skill_entries.sort_order
--
-- Verified against live data 2026-03-15:
--   phase_index=0, skill_index=0 → phase_number=1, sort_order=0 (warmup_chord_changes)
--   phase_index=0, skill_index=1 → phase_number=1, sort_order=1 (chord_em)
--
-- Rows that cannot be matched (orphaned progress) are left with skill_id=NULL.
-- These will be cleaned in step 3.

UPDATE skill_progress sp
SET    skill_id = cse.skill_id
FROM   curriculum_skill_entries cse
JOIN   curriculum_sources cs ON cs.id = cse.curriculum_id
WHERE  cs.key              = sp.curriculum_key
  AND  cse.phase_number    = sp.phase_index + 1
  AND  cse.sort_order      = sp.skill_index
  AND  sp.skill_id         IS NULL;

-- Verify: log count of unmatched rows (should be 0 or near-0 for healthy data)
-- Run manually to confirm before step 3:
--   SELECT COUNT(*) FROM skill_progress WHERE skill_id IS NULL;
