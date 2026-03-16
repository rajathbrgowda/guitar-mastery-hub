-- Migration 025: Add 24 new canonical skills for full curriculum coverage
-- Safe to re-run — uses INSERT ... ON CONFLICT DO NOTHING

INSERT INTO skills (key, title, category) VALUES
  -- chords
  ('chord_dm',              'Dm Chord',                         'chord'),
  ('chord_a7',              'A7 Chord',                         'chord'),
  -- techniques
  ('first_song_aed',        'Play Your First Song (A, D, E)',   'technique'),
  ('palm_muting',           'Palm Muting',                      'technique'),
  ('hammer_ons_pull_offs',  'Hammer-ons & Pull-offs',           'technique'),
  ('string_bending',        'String Bending',                   'technique'),
  ('legato_technique',      'Legato Technique',                 'technique'),
  ('minor_pentatonic_lead', 'Lead Guitar Phrases (Pentatonic)', 'technique'),
  ('fingerstyle_travis',    'Travis Picking',                   'technique'),
  ('rhythm_advanced',       'Advanced Rhythm & Timing',         'technique'),
  -- scales / theory
  ('scale_minor_modes',     'Natural Minor Scale',              'scale'),
  ('chord_progressions_12bar','12-Bar Blues Progression',       'theory'),
  ('ear_training_basics',   'Ear Training Basics',              'theory'),
  -- songs
  ('song_stand_by_me',      'Stand By Me',                      'song'),
  ('song_la_bamba',         'La Bamba',                         'song'),
  ('song_house_rising_sun', 'House of the Rising Sun',          'song'),
  ('song_brown_eyed_girl',  'Brown Eyed Girl',                  'song'),
  ('song_sweet_home_chicago','Sweet Home Chicago',              'song'),
  ('song_tears_heaven',     'Tears in Heaven',                  'song'),
  ('song_hotel_california', 'Hotel California',                 'song'),
  ('song_nothing_else_matters','Nothing Else Matters (Intro)',  'song'),
  ('song_let_it_be',        'Let It Be',                        'song'),
  ('song_smoke_on_water',   'Smoke on the Water',               'song'),
  ('song_stairway_intro',   'Stairway to Heaven (Intro)',       'song')
ON CONFLICT (key) DO NOTHING;
