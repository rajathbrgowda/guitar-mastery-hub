-- Migration 009: Fix invalid YouTube video IDs in curriculum_skill_entries
-- All six original IDs returned 404 via YouTube oEmbed. Replaced with verified IDs.
-- Existing daily_practice_plans deleted so they regenerate with corrected IDs.
-- Verified: 2026-03-15 via https://www.youtube.com/oembed?url=...&format=json

-- ─────────────────────────────────────────────────────────────
-- UPDATE VIDEO IDs
-- ─────────────────────────────────────────────────────────────

-- 1. warmup_chord_changes (all curricula)
--    Old: cHRFCNNrPKs (404)  →  New: qXK_If0QzDM (One Minute Changes — JustinGuitar BC-115)
UPDATE curriculum_skill_entries
SET video_youtube_id = 'qXK_If0QzDM',
    video_title      = 'One Minute Changes — JustinGuitar BC-115'
WHERE skill_id       = (SELECT id FROM skills WHERE key = 'warmup_chord_changes')
  AND video_youtube_id = 'cHRFCNNrPKs';

-- 2. chord_em (best_of_all + justinguitar)
--    Old: oGcNaJbTt4Y (404)  →  New: Hfm4-yOI6oA (Em Chord — JustinGuitar Stage 2)
UPDATE curriculum_skill_entries
SET video_youtube_id = 'Hfm4-yOI6oA',
    video_title      = 'Em Chord — JustinGuitar Stage 2'
WHERE skill_id       = (SELECT id FROM skills WHERE key = 'chord_em')
  AND video_youtube_id = 'oGcNaJbTt4Y';

-- 3. chord_am (best_of_all + justinguitar)
--    Old: MDgZnKHKHZU (404)  →  New: kV_EABwevy4 (Am Chord — JustinGuitar Stage 2)
UPDATE curriculum_skill_entries
SET video_youtube_id = 'kV_EABwevy4',
    video_title      = 'Am Chord — JustinGuitar Stage 2'
WHERE skill_id       = (SELECT id FROM skills WHERE key = 'chord_am')
  AND video_youtube_id = 'MDgZnKHKHZU';

-- 4. song_horse_no_name — justinguitar only
--    Old: U9QzAr6JiE8 (404)  →  New: lPVK7eI2dKY (A Horse With No Name — JustinGuitar)
UPDATE curriculum_skill_entries
SET video_youtube_id = 'lPVK7eI2dKY',
    video_title      = 'A Horse With No Name — Easy Guitar Lesson (JustinGuitar)'
WHERE skill_id       = (SELECT id FROM skills WHERE key = 'song_horse_no_name')
  AND curriculum_id  = (SELECT id FROM curriculum_sources WHERE key = 'justinguitar')
  AND video_youtube_id = 'U9QzAr6JiE8';

-- 5. song_horse_no_name — best_of_all + marty_music
--    Old: U9QzAr6JiE8 (404)  →  New: t2OCGN6AspY (Horse With No Name — Marty Music)
UPDATE curriculum_skill_entries
SET video_youtube_id = 't2OCGN6AspY',
    video_title      = 'Horse With No Name — How To Play (Marty Music)'
WHERE skill_id       = (SELECT id FROM skills WHERE key = 'song_horse_no_name')
  AND curriculum_id IN (
    SELECT id FROM curriculum_sources WHERE key IN ('best_of_all', 'marty_music')
  )
  AND video_youtube_id = 'U9QzAr6JiE8';

-- 6. chord_f_barre (best_of_all + justinguitar)
--    Old: FCBtkg3Cop0 (404)  →  New: ecPzu9sTKbo (F Chord — 3 Ways to Play It, JustinGuitar)
UPDATE curriculum_skill_entries
SET video_youtube_id = 'ecPzu9sTKbo',
    video_title      = 'F Chord — 3 Ways to Play It (JustinGuitar)'
WHERE skill_id       = (SELECT id FROM skills WHERE key = 'chord_f_barre')
  AND video_youtube_id = 'FCBtkg3Cop0';

-- 7. song_blackbird (best_of_all + marty_music)
--    Old: tbM1LHzFhBQ (404)  →  New: 5TnySn2KqD4 (Blackbird — Beatles, Marty Music)
UPDATE curriculum_skill_entries
SET video_youtube_id = '5TnySn2KqD4',
    video_title      = 'Blackbird — Beatles (Marty Music Tutorial)'
WHERE skill_id       = (SELECT id FROM skills WHERE key = 'song_blackbird')
  AND video_youtube_id = 'tbM1LHzFhBQ';

-- ─────────────────────────────────────────────────────────────
-- DELETE stale practice plans
-- daily_practice_plan_items.video_youtube_id is denormalised from
-- curriculum_skill_entries at plan-generation time. Deleting forces
-- fresh regeneration on the next GET /api/practice/plan/today request.
-- ─────────────────────────────────────────────────────────────
DELETE FROM daily_practice_plans;
