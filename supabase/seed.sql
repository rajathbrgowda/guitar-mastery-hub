-- ============================================================
-- seed.sql — Development sample data
-- Run AFTER all migrations. Safe to re-run (uses ON CONFLICT DO NOTHING).
-- DO NOT run in production.
-- ============================================================

-- ── Resources (already seeded via 003 migration, here for reference) ──────────
-- Resources are seeded in 003_create_resources.sql automatically.
-- To re-seed resources only:
INSERT INTO public.resources (phase_index, title, url, description, type, is_featured, sort_order)
VALUES
  (0, 'JustinGuitar Beginner Course', 'https://www.justinguitar.com/categories/beginner-guitar-lessons-grade-1', 'The best free beginner guitar course online', 'course', true, 1),
  (0, 'How to hold a pick', 'https://www.justinguitar.com/guitar-lessons/how-to-hold-a-guitar-pick-b-101', 'Fundamentals of pick grip', 'video', false, 2),
  (0, 'JustinGuitar App', 'https://www.justinguitar.com/app', 'Structured lessons on mobile', 'tool', false, 3),
  (1, 'JustinGuitar Grade 2', 'https://www.justinguitar.com/categories/beginner-guitar-lessons-grade-2', 'First chord transitions, strumming patterns', 'course', true, 1),
  (1, 'Open Chords Practice', 'https://www.justinguitar.com/guitar-lessons/open-chord-practice-bc-181', 'Em Am E A D G C practice routine', 'video', false, 2),
  (1, 'Fender Tune (Tuner)', 'https://www.fender.com/tune', 'Free chromatic tuner app', 'tool', false, 3),
  (2, 'JustinGuitar Grade 3', 'https://www.justinguitar.com/categories/intermediate-guitar-lessons-grade-3', 'Barre chords, fingerpicking, pentatonic', 'course', true, 1),
  (2, 'F Chord Masterclass', 'https://www.justinguitar.com/guitar-lessons/the-f-chord', 'Conquering the F barre chord', 'video', false, 2),
  (2, 'Metronome Online', 'https://www.metronome-online.com', 'Free browser metronome', 'tool', false, 3),
  (3, 'JustinGuitar Intermediate Method', 'https://www.justinguitar.com/categories/intermediate-guitar-lessons', 'Scales, modes, improvisation', 'course', true, 1),
  (3, 'Minor Pentatonic Scale', 'https://www.justinguitar.com/guitar-lessons/the-minor-pentatonic-scale-bg-1402', 'Box 1 and connecting patterns', 'video', false, 2),
  (4, 'Music Theory for Guitarists', 'https://www.justinguitar.com/categories/music-theory', 'Understanding what you''re playing', 'course', true, 1),
  (4, 'Transcription practice', NULL, 'Pick songs you love and learn them by ear', 'article', false, 2)
ON CONFLICT DO NOTHING;

-- ── Sample practice sessions (for a dev/test user — replace the UUID) ─────────
-- Replace '00000000-0000-0000-0000-000000000001' with a real user UUID from auth.users
-- To get your user UUID: Supabase → Authentication → Users → copy your user id

/*
INSERT INTO public.practice_sessions (user_id, date, duration_min, sections, notes)
VALUES
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 6, 30,
    '[{"name":"Warm up","duration_min":5},{"name":"Chords","duration_min":15},{"name":"Song practice","duration_min":10}]',
    'First session, getting back into it'),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 5, 45,
    '[{"name":"Warm up","duration_min":5},{"name":"Scales","duration_min":20},{"name":"Song practice","duration_min":20}]',
    'Pentatonic box 1 feeling more natural'),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 3, 20,
    '[{"name":"Chords","duration_min":10},{"name":"Song practice","duration_min":10}]',
    'Short session, busy day'),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, 60,
    '[{"name":"Warm up","duration_min":10},{"name":"Barre chords","duration_min":20},{"name":"Song practice","duration_min":30}]',
    'F chord finally clicking'),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, 35,
    '[{"name":"Scales","duration_min":15},{"name":"Improvisation","duration_min":20}]',
    'Tried improvising over backing track'),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE,     25,
    '[{"name":"Warm up","duration_min":5},{"name":"Song practice","duration_min":20}]',
    'Working on strumming pattern');
*/
