-- Migration 033: Intermediate depth expansion
-- 1. Add canonical skill: chord_extensions_7th
-- 2. Expand Best of All Phase 4 from 8 → 10 entries:
--    sort_order 8: Nothing Else Matters (Intro)
--    sort_order 9: 7th Chord Extensions
-- All inserts are idempotent via ON CONFLICT / WHERE NOT EXISTS.

-- ── New canonical skill ──────────────────────────────────────────────────────

INSERT INTO skills (key, title, category) VALUES
  ('chord_extensions_7th', '7th Chord Extensions', 'chord')
ON CONFLICT (key) DO NOTHING;

-- ── Best of All Phase 4 expansion ────────────────────────────────────────────

DO $$
DECLARE
  v_best UUID;
  v_nem  UUID;
  v_7th  UUID;
BEGIN
  SELECT id INTO v_best FROM curriculum_sources WHERE key = 'best_of_all';
  SELECT id INTO v_nem  FROM skills WHERE key = 'song_nothing_else_matters';
  SELECT id INTO v_7th  FROM skills WHERE key = 'chord_extensions_7th';

  -- sort_order 8: Nothing Else Matters Intro — iconic intermediate fingerpicking song
  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_nem, 4, 'Phase 4: Expanding', 8,
    'ecPzu9sTKbo', 'Nothing Else Matters Intro - Metallica Guitar Tutorial',
    'The intro uses open strings ringing throughout each chord. Let those strings ring — they are part of the sound.',
    'Muting the open strings. Every open string in the intro is intentional — they create the signature ambience.',
    'Learn the Em7 arpeggio (low E + open B + open G) at 60 BPM. Play it 20 times without mistakes, then add the chord changes.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_nem
  );

  -- sort_order 9: 7th Chord Extensions
  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_7th, 4, 'Phase 4: Expanding', 9,
    NULL, '7th Chord Extensions',
    'Major 7th (Cmaj7), dominant 7th (G7), and minor 7th (Am7) each have a distinct colour. Learn the open voicings first — they are easier than barre versions.',
    'Treating 7th chords as harder versions of triads. They are actually often simpler — you just lift or add one finger.',
    'Cmaj7 → Am7 → Dm7 → G7: the jazz-tinged i-vi-ii-V. Strum each 4 times at 60 BPM. Focus on the colour change between chords.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_7th
  );

END $$;
