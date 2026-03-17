-- Migration 034: Backfill verified YouTube IDs for Phase 3-5 skills
-- IDs verified manually against YouTube oEmbed / direct URL checks:
--   UeBSQONhBJA  = String Bending (Andy Guitar)
--   H7MXYnVeFU4  = Vibrato Technique (Paul Davids)
--   0Qp26KcDrGw  = CAGED System (Marty Music)
--   7bpHxOdFtYc  = Travis Picking (Marty Music)
--   BU_wgm3M_tw  = 12-Bar Blues (Marty Music)
--   DWzQY44VQc4  = Wish You Were Here (Marty Music)
--   aGRurwdxuuE  = 7th Chord Extensions (Move Forward Guitar)
-- All updates are idempotent: WHERE video_youtube_id IS NULL

-- string_bending — all curricula
UPDATE curriculum_skill_entries cse
SET video_youtube_id = 'UeBSQONhBJA',
    video_title      = 'String Bending Guitar Lesson'
FROM skills sk
WHERE cse.skill_id = sk.id
  AND sk.key = 'string_bending'
  AND cse.video_youtube_id IS NULL;

-- vibrato_technique — all curricula
UPDATE curriculum_skill_entries cse
SET video_youtube_id = 'H7MXYnVeFU4',
    video_title      = 'Vibrato Guitar Technique'
FROM skills sk
WHERE cse.skill_id = sk.id
  AND sk.key = 'vibrato_technique'
  AND cse.video_youtube_id IS NULL;

-- caged_system — all curricula
UPDATE curriculum_skill_entries cse
SET video_youtube_id = '0Qp26KcDrGw',
    video_title      = 'CAGED System Guitar Lesson'
FROM skills sk
WHERE cse.skill_id = sk.id
  AND sk.key = 'caged_system'
  AND cse.video_youtube_id IS NULL;

-- fingerstyle_travis — all curricula
UPDATE curriculum_skill_entries cse
SET video_youtube_id = '7bpHxOdFtYc',
    video_title      = 'Travis Picking Guitar Lesson'
FROM skills sk
WHERE cse.skill_id = sk.id
  AND sk.key = 'fingerstyle_travis'
  AND cse.video_youtube_id IS NULL;

-- chord_progressions_12bar — all curricula
UPDATE curriculum_skill_entries cse
SET video_youtube_id = 'BU_wgm3M_tw',
    video_title      = '12-Bar Blues Guitar Lesson'
FROM skills sk
WHERE cse.skill_id = sk.id
  AND sk.key = 'chord_progressions_12bar'
  AND cse.video_youtube_id IS NULL;

-- song_wish_you_were — all curricula
UPDATE curriculum_skill_entries cse
SET video_youtube_id = 'DWzQY44VQc4',
    video_title      = 'Wish You Were Here - Pink Floyd Guitar Tutorial'
FROM skills sk
WHERE cse.skill_id = sk.id
  AND sk.key = 'song_wish_you_were'
  AND cse.video_youtube_id IS NULL;

-- chord_extensions_7th — best_of_all Phase 4 (added in migration 033)
UPDATE curriculum_skill_entries cse
SET video_youtube_id = 'aGRurwdxuuE',
    video_title      = '7th Chord Extensions Guitar Lesson'
FROM skills sk
WHERE cse.skill_id = sk.id
  AND sk.key = 'chord_extensions_7th'
  AND cse.video_youtube_id IS NULL;
