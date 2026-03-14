-- ============================================================
-- 003: Resources (static catalogue, readable by all users)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.resources (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_index INTEGER     NOT NULL,
  title       TEXT        NOT NULL,
  url         TEXT,
  description TEXT,
  type        TEXT        NOT NULL DEFAULT 'link',
  -- type: 'video' | 'course' | 'tool' | 'article' | 'link'
  is_featured BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_phase
  ON public.resources(phase_index, sort_order);

-- RLS — read-only for all authenticated users (no user-owned rows)
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read resources"
  ON public.resources FOR SELECT
  TO authenticated
  USING (true);

-- ── Seed: starter resources per phase ─────────────────────

INSERT INTO public.resources (phase_index, title, url, description, type, is_featured, sort_order) VALUES
-- Phase 0 — Absolute Beginner
(0, 'JustinGuitar Beginner Course', 'https://www.justinguitar.com/categories/beginner-guitar-lessons-grade-1', 'The best free beginner guitar course online', 'course', true, 1),
(0, 'How to hold a pick', 'https://www.justinguitar.com/guitar-lessons/how-to-hold-a-guitar-pick-b-101', 'Fundamentals of pick grip', 'video', false, 2),
(0, 'JustinGuitar App', 'https://www.justinguitar.com/app', 'Structured lessons on mobile', 'tool', false, 3),

-- Phase 1 — Foundation
(1, 'JustinGuitar Grade 2', 'https://www.justinguitar.com/categories/beginner-guitar-lessons-grade-2', 'First chord transitions, strumming patterns', 'course', true, 1),
(1, 'Open Chords Practice', 'https://www.justinguitar.com/guitar-lessons/open-chord-practice-bc-181', 'Em Am E A D G C practice routine', 'video', false, 2),
(1, 'Fender Tune (Tuner)', 'https://www.fender.com/tune', 'Free chromatic tuner app', 'tool', false, 3),

-- Phase 2 — Intermediate
(2, 'JustinGuitar Grade 3', 'https://www.justinguitar.com/categories/intermediate-guitar-lessons-grade-3', 'Barre chords, fingerpicking, pentatonic', 'course', true, 1),
(2, 'F Chord Masterclass', 'https://www.justinguitar.com/guitar-lessons/the-f-chord', 'Conquering the F barre chord', 'video', false, 2),
(2, 'Metronome Online', 'https://www.metronome-online.com', 'Free browser metronome', 'tool', false, 3),

-- Phase 3 — Advanced
(3, 'JustinGuitar Intermediate Method', 'https://www.justinguitar.com/categories/intermediate-guitar-lessons', 'Scales, modes, improvisation', 'course', true, 1),
(3, 'Minor Pentatonic Scale', 'https://www.justinguitar.com/guitar-lessons/the-minor-pentatonic-scale-bg-1402', 'Box 1 and connecting patterns', 'video', false, 2),

-- Phase 4 — Mastery
(4, 'Music Theory for Guitarists', 'https://www.justinguitar.com/categories/music-theory', 'Understanding what you''re playing', 'course', true, 1),
(4, 'Transcription practice', NULL, 'Pick songs you love and learn them by ear', 'article', false, 2);
