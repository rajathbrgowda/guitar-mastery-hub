-- Migration 008: Seed curriculum sources, canonical skills, and curriculum_skill_entries
-- Video IDs are YouTube IDs (embed as https://www.youtube.com/embed/{id}).
-- NULL video_youtube_id = graceful "no video" fallback in UI.

-- ─────────────────────────────────────────────────────────────
-- CURRICULUM SOURCES
-- ─────────────────────────────────────────────────────────────
INSERT INTO curriculum_sources (key, name, author, description, style, website_url, is_default, sort_order) VALUES
  ('best_of_all', 'Best of All',     NULL,             'A synthesised roadmap drawing the best from JustinGuitar, Andy Guitar, and Marty Music. Structured, practical, and song-driven.',   'structured',  NULL,                           TRUE,  1),
  ('justinguitar', 'JustinGuitar',   'Justin Sandercoe','The world''s most popular free guitar course. Grade-based, methodical, with clear milestones and a huge community.',               'structured',  'https://www.justinguitar.com', FALSE, 2),
  ('marty_music',  'Marty Music',    'Marty Schwartz',  'Song-first approach. Learn real songs fast from the very first lesson. Great for staying motivated as a beginner.',                'song-first',  'https://www.youtube.com/@MartyMusic', FALSE, 3)
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- CANONICAL SKILLS
-- ─────────────────────────────────────────────────────────────
INSERT INTO skills (key, category, title, description, difficulty, chord_diagram_key) VALUES
  -- WARMUP
  ('warmup_chord_changes',    'warmup',    '1-Minute Chord Changes',      'Pick any two chords. Switch between them as many times as you can in 60 seconds. Count your changes. Best single exercise for beginner fluency.', 1, NULL),

  -- PHASE 1 — Open Chords
  ('chord_em',    'chord', 'Em Chord',   'Two fingers on the 5th and 4th strings, 2nd fret. The easiest first chord — open, resonant, and used in hundreds of songs.',    1, 'Em'),
  ('chord_am',    'chord', 'Am Chord',   'Three fingers forming a mini-barre shape. Pairs beautifully with Em for your first song.',                                        1, 'Am'),
  ('chord_d',     'chord', 'D Chord',    'Three fingers making a small triangle shape. First chord many beginners find tricky — the high e string is easy to mute.',        2, 'D'),
  ('chord_g',     'chord', 'G Chord',    'Big open sound. Learn the 3-finger version first, then the 4-finger stretch. Essential for countless songs.',                     2, 'G'),
  ('chord_c',     'chord', 'C Chord',    'The chord everyone finds awkward at first. Finger placement is precise — your 1st finger must not mute the 2nd string.',         2, 'C'),
  ('chord_a',     'chord', 'A Chord',    'Three fingers squeezed into the 2nd fret on strings 4, 3, 2. Tight quarters. Try the barre version (index across) as you progress.', 2, 'A'),
  ('chord_e',     'chord', 'E Chord',    'Full, rich open chord. Similar finger shape to Am but on different strings. One of the most powerful open chords.',              2, 'E'),
  ('strum_down',  'technique', 'Basic Down Strumming', 'All downstrokes. Slow, steady, even. The foundation every strum pattern is built on. Use a loose wrist, not a stiff arm.', 1, NULL),

  -- PHASE 2 — Building
  ('chord_changes_smooth', 'technique', 'Smooth Chord Transitions',   'Aim for zero gap between chords. Practise "perfect" changes: anticipate the next chord half a beat early. Quality over speed.', 3, NULL),
  ('strum_dduudu',         'technique', 'D-DU-UDU Strumming Pattern', 'The most common strumming pattern in popular music. Down, Down-Up, Up-Down-Up. Counted: 1, 2-and, and-3-and.', 3, NULL),
  ('fingerpicking_pima',   'technique', 'Fingerpicking Basics (p-i-m-a)', 'Thumb (p) plays strings 6/5/4. Index (i) = string 3, Middle (m) = string 2, Ring (a) = string 1. Start with a simple arpeggio on Am.', 4, NULL),
  ('power_chords',         'technique', 'Power Chords',               'Two-note chords (root + 5th) moveable anywhere on the neck. The backbone of rock and punk. Use your index and ring finger.', 3, NULL),
  ('song_horse_no_name',   'song',      'Horse With No Name',         'Uses only two chords (Em and D6). Perfect first song — lets you focus on transitions and strumming rather than chord shapes.', 2, NULL),
  ('song_knockin',         'song',      'Knockin'' on Heaven''s Door',  'G, D, Am — or G, D, C depending on the version. Slow tempo, simple pattern. Classic crowd-pleaser.', 2, NULL),

  -- PHASE 3 — The Wall
  ('chord_f_barre',       'chord',     'F Barre Chord',              'The chord everyone dreads. Barre your index across all 6 strings at fret 1, add the Am shape above. Takes weeks of daily practice — completely normal.', 7, 'F'),
  ('chord_bm_barre',      'chord',     'Bm Barre Chord',             'Am-shape barre chord at fret 2. Essential for playing in the key of G. Your index barre only needs to cover strings 5-1.', 7, 'Bm'),
  ('scale_am_penta_box1', 'scale',     'Am Pentatonic Scale (Box 1)', 'Five-note scale starting at the 5th fret. The foundation of blues, rock, and lead guitar. Learn the box pattern, then make it sing.', 5, NULL),
  ('blues_shuffle',       'technique', 'Basic Blues Shuffle',        'Alternating between the 5th and 6th degree on the low strings. The feel of the blues. Usually in E or A.', 5, NULL),
  ('song_wonderwall',     'song',      'Wonderwall',                  'Em7, G, Dsus4, A7sus4. Capo 2. One of the most requested beginner songs of all time. The strumming pattern makes it.', 4, NULL),
  ('song_wish_you_were',  'song',      'Wish You Were Here',         'Fingerpicking + strumming hybrid. Iconic intro. Requires G, C, Am, Em, D. Slightly tricky intro riff to nail.', 5, NULL),

  -- PHASE 4 — Expanding
  ('caged_system',          'theory',    'CAGED System',               'Five chord shapes (C, A, G, E, D) that map the entire fretboard. Understanding CAGED unlocks barre chords everywhere.', 6, NULL),
  ('scale_major_positions', 'scale',     'Major Scale (All Positions)', 'Learn the major scale across the full neck using CAGED positions. Foundation for melody, composition, and understanding keys.', 6, NULL),
  ('pentatonic_5_boxes',    'scale',     'Pentatonic — All 5 Boxes',   'Connect all five pentatonic box patterns across the neck. True fretboard freedom. Start slow, connect one box at a time.', 7, NULL),
  ('vibrato_technique',     'technique', 'Vibrato',                    'Slight pitch oscillation on sustained notes. The difference between playing notes and making them sing. Use your wrist, not your finger.', 6, NULL),
  ('song_wish_you_were_full','song',     'Wish You Were Here (full)',   'Learn the complete song including the intro riff, chord sections, and solo fill. Combine all Phase 3-4 skills.', 6, NULL),

  -- PHASE 5 — Voice
  ('improvisation_penta',  'technique', 'Improvising with Pentatonic', 'Using the pentatonic scale to create your own solos and fills. Focus on phrasing, space, and feel — not just running notes.', 8, NULL),
  ('modes_intro',          'theory',    'Introduction to Modes',       'Dorian, Mixolydian, Aeolian — how modes change the colour of scales you already know. Practical application over backing tracks.', 8, NULL),
  ('fingerstyle_patterns', 'technique', 'Advanced Fingerstyle Patterns', 'Alternating bass + melody combinations. Travis picking and beyond. Requires independence between thumb and fingers.', 8, NULL),
  ('song_blackbird',       'song',      'Blackbird',                   'Beatles fingerpicking masterpiece. All fingerstyle, moving chord shapes, and a melody in the bass simultaneously.', 9, NULL)
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- HELPER: get IDs
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_best    UUID;
  v_jg      UUID;
  v_marty   UUID;

  v_warmup              UUID;
  v_em      UUID; v_am  UUID; v_d   UUID; v_g   UUID; v_c   UUID; v_a   UUID; v_e   UUID;
  v_strum_down          UUID;
  v_transitions         UUID;
  v_strum_dduudu        UUID;
  v_fingerpick          UUID;
  v_power               UUID;
  v_horse               UUID;
  v_knockin             UUID;
  v_f_barre             UUID;
  v_bm_barre            UUID;
  v_am_penta            UUID;
  v_blues               UUID;
  v_wonderwall          UUID;
  v_wish                UUID;
  v_caged               UUID;
  v_major_scale         UUID;
  v_penta_5             UUID;
  v_vibrato             UUID;
  v_wish_full           UUID;
  v_improv              UUID;
  v_modes               UUID;
  v_fingerstyle         UUID;
  v_blackbird           UUID;
BEGIN
  SELECT id INTO v_best   FROM curriculum_sources WHERE key = 'best_of_all';
  SELECT id INTO v_jg     FROM curriculum_sources WHERE key = 'justinguitar';
  SELECT id INTO v_marty  FROM curriculum_sources WHERE key = 'marty_music';

  SELECT id INTO v_warmup      FROM skills WHERE key = 'warmup_chord_changes';
  SELECT id INTO v_em          FROM skills WHERE key = 'chord_em';
  SELECT id INTO v_am          FROM skills WHERE key = 'chord_am';
  SELECT id INTO v_d           FROM skills WHERE key = 'chord_d';
  SELECT id INTO v_g           FROM skills WHERE key = 'chord_g';
  SELECT id INTO v_c           FROM skills WHERE key = 'chord_c';
  SELECT id INTO v_a           FROM skills WHERE key = 'chord_a';
  SELECT id INTO v_e           FROM skills WHERE key = 'chord_e';
  SELECT id INTO v_strum_down  FROM skills WHERE key = 'strum_down';
  SELECT id INTO v_transitions FROM skills WHERE key = 'chord_changes_smooth';
  SELECT id INTO v_strum_dduudu FROM skills WHERE key = 'strum_dduudu';
  SELECT id INTO v_fingerpick  FROM skills WHERE key = 'fingerpicking_pima';
  SELECT id INTO v_power       FROM skills WHERE key = 'power_chords';
  SELECT id INTO v_horse       FROM skills WHERE key = 'song_horse_no_name';
  SELECT id INTO v_knockin     FROM skills WHERE key = 'song_knockin';
  SELECT id INTO v_f_barre     FROM skills WHERE key = 'chord_f_barre';
  SELECT id INTO v_bm_barre    FROM skills WHERE key = 'chord_bm_barre';
  SELECT id INTO v_am_penta    FROM skills WHERE key = 'scale_am_penta_box1';
  SELECT id INTO v_blues       FROM skills WHERE key = 'blues_shuffle';
  SELECT id INTO v_wonderwall  FROM skills WHERE key = 'song_wonderwall';
  SELECT id INTO v_wish        FROM skills WHERE key = 'song_wish_you_were';
  SELECT id INTO v_caged       FROM skills WHERE key = 'caged_system';
  SELECT id INTO v_major_scale FROM skills WHERE key = 'scale_major_positions';
  SELECT id INTO v_penta_5     FROM skills WHERE key = 'pentatonic_5_boxes';
  SELECT id INTO v_vibrato     FROM skills WHERE key = 'vibrato_technique';
  SELECT id INTO v_wish_full   FROM skills WHERE key = 'song_wish_you_were_full';
  SELECT id INTO v_improv      FROM skills WHERE key = 'improvisation_penta';
  SELECT id INTO v_modes       FROM skills WHERE key = 'modes_intro';
  SELECT id INTO v_fingerstyle FROM skills WHERE key = 'fingerstyle_patterns';
  SELECT id INTO v_blackbird   FROM skills WHERE key = 'song_blackbird';

  -- ───────────────────────────────────────────────────────────
  -- BEST OF ALL — curriculum_skill_entries
  -- ───────────────────────────────────────────────────────────
  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  VALUES
    -- Phase 1: Foundations
    (v_best, v_warmup,     1, 'Phase 1: Foundations', 0,
     'cHRFCNNrPKs', 'One Minute Changes - Justin Guitar',
     'Do this every single day. It is the single fastest way to build chord-change muscle memory.',
     'Stopping between chords to look at your fingers — trust the muscle memory.',
     'Set a timer for 60 seconds. Count every clean change. Write down your score each day.'),

    (v_best, v_em,         1, 'Phase 1: Foundations', 1,
     'oGcNaJbTt4Y', 'How To Play Em Chord - JustinGuitar',
     'Keep your thumb behind the neck, opposite your middle finger. Arch your fingers to avoid muting strings.',
     'Muting the open 1st string (high e) with your ring finger touching it.',
     'Place Em, strum slowly, listen to every string. Fix any dead notes. Hold 10 seconds, release. Repeat 10×.'),

    (v_best, v_am,         1, 'Phase 1: Foundations', 2,
     'MDgZnKHKHZU', 'How To Play Am Chord - JustinGuitar',
     'Am and Em are best friends — practise switching between them until it feels automatic.',
     'Squishing the 1st string (high e) with your 2nd finger, making it buzz.',
     'Am → Em: switch 100 times with a metronome at 60 BPM. Count your clean changes.'),

    (v_best, v_d,          1, 'Phase 1: Foundations', 3,
     NULL, 'D Chord for Beginners',
     'Only strum strings 4, 3, 2, 1 — avoid hitting strings 6 and 5.',
     'Accidentally hitting the 5th string (A) which makes D sound muddy.',
     'Practise strumming just the top 4 strings. Use a piece of tape on strings 5-6 to train yourself.'),

    (v_best, v_g,          1, 'Phase 1: Foundations', 4,
     NULL, 'G Chord for Beginners',
     'Start with the 3-finger version (fingers on strings 6, 1, and 2). Add the 4-finger version later.',
     'Using 4 fingers too early — the stretch causes tension. Start simple.',
     'G → D: one of the most common chord changes in music. Practise 50 times slowly.'),

    (v_best, v_c,          1, 'Phase 1: Foundations', 5,
     NULL, 'C Chord for Beginners',
     'Your 1st finger on the 2nd string must be perfectly arched to let the 1st string (B) ring open.',
     'Muting the high B string with the side of your 1st finger.',
     'Press C chord. Strum slowly. Listen for every note. If any string is dead, adjust and try again.'),

    (v_best, v_strum_down, 1, 'Phase 1: Foundations', 6,
     NULL, 'Basic Strumming for Beginners',
     'Use your wrist, not your whole arm. Imagine shaking water off your hand — loose and relaxed.',
     'Stiff arm strumming — leads to fatigue and inconsistent rhythm.',
     'Hold G chord. Strum 4 even downstrokes per bar. Use a metronome at 60 BPM for 5 minutes.'),

    (v_best, v_a,          1, 'Phase 1: Foundations', 7,
     NULL, 'A Chord for Beginners',
     'Three fingers in a tight space on fret 2. Try rolling your fingers slightly so they are more vertical.',
     'One finger overlapping into the wrong string space.',
     'A → D: practise this pair 50 times. Then A → E for another 50.'),

    (v_best, v_e,          1, 'Phase 1: Foundations', 8,
     NULL, 'E Major Chord for Beginners',
     'E is the same finger shape as Am, just moved to different strings. Notice the similarity.',
     'Muting the open B (2nd) string by touching it with the ring finger.',
     'E → A → D: the classic 1-4-5 progression. Practise it slowly until transitions are smooth.'),

    -- Phase 2: Building
    (v_best, v_transitions, 2, 'Phase 2: Building Fluency', 0,
     NULL, 'Smooth Chord Changes - Guitar',
     'Anticipate the next chord half a beat early — start moving before the last strum lands.',
     'Waiting until the last moment to move, creating an audible gap.',
     'Play G for one bar, C for one bar, D for one bar at 70 BPM. No gaps allowed. Record yourself.'),

    (v_best, v_strum_dduudu, 2, 'Phase 2: Building Fluency', 1,
     NULL, 'D-DU-UDU Strumming Pattern',
     'Keep your strumming hand moving in a constant down-up pendulum even for "miss" strums.',
     'Stopping the hand motion for up strums — this kills the groove.',
     'Air guitar the pattern without touching strings. Say "Down, Down-Up, Up-Down-Up" aloud. Then apply to G chord.'),

    (v_best, v_horse,      2, 'Phase 2: Building Fluency', 2,
     'U9QzAr6JiE8', 'Horse With No Name - Easy Guitar Lesson - Marty Music',
     'Just two chords the whole song. Focus entirely on your strumming groove and timing.',
     'Rushing the tempo — this song has a laid-back, almost lazy feel.',
     'Em → D6 with a capo on 2 (or without capo in Em). Play the full song from start to finish.'),

    (v_best, v_fingerpick, 2, 'Phase 2: Building Fluency', 3,
     NULL, 'Fingerpicking for Beginners',
     'Keep your thumb (p) planted on string 4, 5, or 6. Let fingers i, m, a handle strings 3, 2, 1.',
     'Tensing up the picking hand — fingerpicking requires maximum relaxation.',
     'On Am chord: p on string 5, i on 3, m on 2, a on 1. Pluck p-i-m-a in sequence. Slow, clean.'),

    (v_best, v_power,      2, 'Phase 2: Building Fluency', 4,
     NULL, 'Power Chords for Beginners',
     'Mute strings above and below your power chord with your strumming hand palm.',
     'Accidentally letting open strings ring out — makes the sound muddy.',
     'E5 → A5 → D5 → G5. One bar each at 80 BPM. Move up and down the neck.'),

    (v_best, v_knockin,    2, 'Phase 2: Building Fluency', 5,
     NULL, 'Knockin'' On Heaven''s Door - Easy Guitar',
     'Slow tempo makes this song perfect for practising smooth transitions.',
     'Rushing back to G after the Am/C — hold each chord its full length.',
     'G → D → Am (or C). Loop the chord progression. Then add Bob Dylan strumming on top.'),

    -- Phase 3: The Wall
    (v_best, v_f_barre,   3, 'Phase 3: Breaking The Wall', 0,
     'FCBtkg3Cop0', 'How To Play F Chord - JustinGuitar',
     'Do NOT practise F for more than 5 minutes at a time. Short sessions daily beat long sessions weekly.',
     'Pressing too hard with every finger — only your barre finger needs extra pressure.',
     'Place barre on fret 1. Listen to each string individually. Fix one dead note at a time. 3 min/day minimum.'),

    (v_best, v_am_penta,  3, 'Phase 3: Breaking The Wall', 1,
     NULL, 'Am Pentatonic Scale - Box 1',
     'Learn the box as a shape first, then focus on making notes sound musical — bend, slide, vibrato.',
     'Playing it too fast. Speed comes after accuracy. Start at 60 BPM with a metronome.',
     'Play box 1 up and down 10 times at 60 BPM. Then improvise — just noodle over an Am backing track.'),

    (v_best, v_wonderwall,3, 'Phase 3: Breaking The Wall', 2,
     NULL, 'Wonderwall - Easy Guitar Lesson',
     'Capo 2 makes it sound like the record. The strumming pattern is what makes this song — nail that first.',
     'Chord shapes without capo sound wrong. Do not skip the capo for this one.',
     'Learn chord shapes (Em7, G, Dsus4, A7sus4). Then learn the strumming pattern. Then combine.'),

    (v_best, v_bm_barre,  3, 'Phase 3: Breaking The Wall', 3,
     NULL, 'Bm Barre Chord for Beginners',
     'You only need to barre strings 5 through 1 (5 strings) — mute string 6 with your thumb or barre tip.',
     'Trying to get string 6 to ring — it is meant to be muted for most Bm voicings.',
     'A → Bm: practise this pair 50 times. Then E → Bm for another 50.'),

    (v_best, v_blues,     3, 'Phase 3: Breaking The Wall', 4,
     NULL, 'Basic Blues Shuffle Guitar',
     'The shuffle feel is triplet-based — think "long-short, long-short" not straight eighth notes.',
     'Playing it straight (non-swung) — it loses the blues feel entirely.',
     'E shuffle pattern: 2nd fret then 4th fret on strings 5 and 4. Alternate with your pick. Loop in A too.'),

    (v_best, v_wish,      3, 'Phase 3: Breaking The Wall', 5,
     NULL, 'Wish You Were Here - Easy Guitar Lesson',
     'Learn the fingerpicking intro slowly. The melody lives in the top strings; the bass alternates underneath.',
     'Playing it too fast before the independence between fingers is there.',
     'Intro riff: learn each bar separately, then connect. Aim for 1 new bar per day.'),

    -- Phase 4: Expanding
    (v_best, v_caged,     4, 'Phase 4: Expanding', 0,
     NULL, 'CAGED System Explained',
     'The CAGED system is not music theory — it is a map. Use it to find chords you already know in new places.',
     'Treating CAGED as abstract theory. Always relate it to chord shapes you can already play.',
     'Take G chord. Find it in the CAGED D-shape (G barre at fret 5). Find it in the CAGED C-shape. Connect them.'),

    (v_best, v_major_scale, 4, 'Phase 4: Expanding', 1,
     NULL, 'Major Scale Guitar - All Positions',
     'The major scale sounds like "Do Re Mi". You already know the sound — now learn where it lives.',
     'Memorising patterns without understanding the sound. Sing the scale as you play it.',
     'G major scale in position 1 (3rd fret). Play it up and down 10 times. Sing each note.'),

    (v_best, v_vibrato,   4, 'Phase 4: Expanding', 2,
     NULL, 'Guitar Vibrato Technique',
     'Use your wrist to push and pull the string (or bend it). Your finger just holds on — the wrist does the work.',
     'Vibrato with only finger motion — produces weak, inconsistent vibrato.',
     'Hold any note on string 1 or 2. Push/pull with wrist for 5 even oscillations. Keep it consistent.'),

    (v_best, v_penta_5,   4, 'Phase 4: Expanding', 3,
     NULL, 'All 5 Pentatonic Boxes - Guitar',
     'You already know Box 1. Each new box shares two notes with the previous. Connect them one at a time.',
     'Trying to learn all 5 at once. Learn Box 2, then link it to Box 1. Then add Box 3.',
     'Box 1 → Box 2: find where they overlap at the 8th fret. Play between them in Am.'),

    -- Phase 5: Finding Your Voice
    (v_best, v_improv,    5, 'Phase 5: Finding Your Voice', 0,
     NULL, 'Guitar Improvisation for Beginners',
     'Less is more. Leave space. One great note with feeling beats ten rushed notes.',
     'Playing every note in the scale as fast as possible. Silence is part of music.',
     'Over an Am backing track: play 4 notes, then rest 4 beats. Repeat with different 4 notes.'),

    (v_best, v_modes,     5, 'Phase 5: Finding Your Voice', 1,
     NULL, 'Introduction to Guitar Modes',
     'Start with Dorian (the minor mode used in most rock solos) and Mixolydian (the blues-rock major mode).',
     'Memorising mode formulas without hearing the difference. Modes are colours — listen first.',
     'Compare Am natural minor to A Dorian over a backing track. Hear the b7 difference.'),

    (v_best, v_fingerstyle, 5, 'Phase 5: Finding Your Voice', 2,
     NULL, 'Advanced Fingerstyle Guitar Patterns',
     'Travis picking: thumb alternates on strings 5 and 4 while fingers play melody on 3, 2, 1 independently.',
     'Rushing. Fingerstyle patterns require independent hand mechanics that take weeks of slow practice.',
     'C chord. Thumb: 5, 4, 5, 4. Add index on string 3 on beats 2 and 4. Very slow.'),

    (v_best, v_blackbird,  5, 'Phase 5: Finding Your Voice', 3,
     'tbM1LHzFhBQ', 'Blackbird - Beatles Guitar Tutorial',
     'This is a real song in standard tuning. The moving bass + melody combination is the challenge.',
     'Trying to play it at full speed. Blackbird is 90% slow practice, 10% performance speed.',
     'Learn bars 1-4 only. Play them 20 times before moving on. Treat each bar as a separate exercise.')

  ON CONFLICT (curriculum_id, skill_id) DO NOTHING;

  -- ───────────────────────────────────────────────────────────
  -- JUSTINGUITAR — curriculum_skill_entries (JG-specific content)
  -- Justin's Grade 1 maps to Phase 1, Grade 2 → Phase 2, etc.
  -- ───────────────────────────────────────────────────────────
  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  VALUES
    (v_jg, v_warmup,      1, 'Grade 1: Your First Guitar Lessons', 0,
     'cHRFCNNrPKs', 'One Minute Changes - Justin Guitar BC-141',
     'Justin calls this the "most important beginner exercise." Do it every day, no exceptions.',
     'Losing count — keep a tally with a pen. Progress must be measured to be managed.',
     'Justin''s method: pick two chords, switch as many times as possible in 60 seconds. Record your score.'),

    (v_jg, v_em,          1, 'Grade 1: Your First Guitar Lessons', 1,
     'oGcNaJbTt4Y', 'Em Chord - JustinGuitar BC-101',
     'Justin emphasises: Em is a 2-finger chord. Keep it simple, make it clean.',
     'Using more pressure than needed. Relax — the chord should ring with minimum effort.',
     'Justin''s "Perfect" chord practice: place, strum, listen, adjust, release. Repeat 20 times.'),

    (v_jg, v_am,          1, 'Grade 1: Your First Guitar Lessons', 2,
     'MDgZnKHKHZU', 'Am Chord - JustinGuitar BC-102',
     'Justin pairs Am and Em as the first chord change exercise. Start here.',
     'Rushing to the next chord. Each chord must sound perfect before you move.',
     'Justin''s perfect chord technique: place Am 20 times. Then 1-min changes between Am and Em.'),

    (v_jg, v_d,           1, 'Grade 1: Your First Guitar Lessons', 3,
     NULL, 'D Chord - JustinGuitar BC-103',
     'Justin teaches D early because it pairs with Em and Am for full songs right away.',
     'Strumming strings 5 and 6 — avoid them. Justin recommends starting your strum from string 4.',
     'Justin''s exercise: D → Em → Am. The "folk" change. 1 minute each pair.'),

    (v_jg, v_strum_down,  1, 'Grade 1: Your First Guitar Lessons', 4,
     NULL, 'Basic Strumming - JustinGuitar',
     'Justin: "The wrist is the engine, not the arm." Keep your elbow still.',
     'Strumming from the elbow — this causes fatigue and stiffness.',
     'Justin''s exercise: 4 downstrokes per bar on G chord, 4 bars. Then switch to C for 4 bars.'),

    (v_jg, v_g,           1, 'Grade 1: Your First Guitar Lessons', 5,
     NULL, 'G Chord - JustinGuitar BC-106',
     'Justin teaches the 3-finger G first (fingers 2, 3, 4). The 4-finger version comes in Grade 2.',
     'Using finger 1 on the 5th string — this makes chord changes harder. Avoid it early.',
     'Justin''s G → D → Em → C progression. The most popular chord loop in pop music.'),

    (v_jg, v_c,           1, 'Grade 1: Your First Guitar Lessons', 6,
     NULL, 'C Chord - JustinGuitar BC-107',
     'Justin says C is the hardest open chord to nail cleanly. Give it extra time.',
     'Not arching finger 1 enough. The tip must be vertical to let the B string ring.',
     'Justin''s "Anchor Finger" technique: keep finger 1 planted on the B string as you move to Am.'),

    (v_jg, v_transitions, 2, 'Grade 2: Developing Skills', 0,
     NULL, 'Chord Changes - JustinGuitar Grade 2',
     'Justin''s Grade 2 focus is entirely on making changes automatic. Slow is smooth, smooth is fast.',
     'Practising fast before you are clean. Bad habits at speed are very hard to unlearn.',
     'Justin''s "ninja chord changes": move fingers as a unit, not one at a time. Visualise the shape before moving.'),

    (v_jg, v_strum_dduudu, 2, 'Grade 2: Developing Skills', 1,
     NULL, 'Strumming Patterns - JustinGuitar Grade 2',
     'Justin: keep the strumming hand moving like a pendulum — never stop, even for "miss" strums.',
     'Stopping the hand motion. The invisible upstrokes are what keeps rhythm locked in.',
     'Justin''s method: air guitar the pattern first. Say "down down-up up-down-up" aloud. Then apply.'),

    (v_jg, v_horse,       2, 'Grade 2: Developing Skills', 2,
     'U9QzAr6JiE8', 'Horse With No Name - Justin Guitar Lesson',
     'Justin uses this song as the first "song lesson" in Grade 1-2 because it only uses 2 chords.',
     'Over-thinking the strumming. Let it be loose and relaxed — the song has a desert groove.',
     'Full song from verse to chorus to verse. Play all the way through without stopping.'),

    (v_jg, v_f_barre,    3, 'Grade 3: Barre Chords', 0,
     'FCBtkg3Cop0', 'F Chord - JustinGuitar',
     'Justin calls F "the Mount Everest of beginner guitar." Everyone struggles. Everyone eventually gets it.',
     'Practising more than 5-10 minutes — you risk injury and the finger won''t remember overnight. Rest matters.',
     'Justin''s F chord routine: 2 min F, rest 1 min, 2 min F, rest 1 min, 2 min F. Every day.'),

    (v_jg, v_am_penta,   3, 'Grade 3: Barre Chords', 1,
     NULL, 'Am Pentatonic Scale - JustinGuitar Grade 3',
     'Justin introduces the pentatonic scale alongside barre chords in Grade 3 to give students something fun.',
     'Only playing the scale up and down. Use it musically — mix it with bends and slides.',
     'Justin''s "lick library" approach: learn 5 licks from the scale. Combine them over a backing track.'),

    (v_jg, v_wonderwall, 3, 'Grade 3: Barre Chords', 2,
     NULL, 'Wonderwall - JustinGuitar Song Lesson',
     'Justin has a full lesson on Wonderwall. Capo 2 is essential.',
     'Skipping the strumming pattern and just doing downstrokes — that kills the Oasis feel.',
     'Justin''s song lesson: learn each chord shape, learn the strumming pattern, then combine.'),

    (v_jg, v_caged,      4, 'Grade 4: Expanding Techniques', 0,
     NULL, 'CAGED System - JustinGuitar Intermediate',
     'Justin''s CAGED lessons are some of his most-watched intermediate content. Take your time here.',
     'Treating CAGED as theory homework. Justin''s approach: always have your guitar in hand.',
     'Justin''s exercise: take one chord (e.g. G), find all 5 CAGED positions up the neck.'),

    (v_jg, v_improv,     5, 'Grade 5: Finding Your Voice', 0,
     NULL, 'Improvisation - JustinGuitar Advanced',
     'Justin: "The best soloists are story-tellers. They have something to say." Play with intention.',
     'Noodling without direction. Every phrase should have a start, a journey, and an end.',
     'Justin''s practice: 12-bar blues backing track. Improvise 3 phrases, rest 1 bar between each.')

  ON CONFLICT (curriculum_id, skill_id) DO NOTHING;

  -- ───────────────────────────────────────────────────────────
  -- MARTY MUSIC — curriculum_skill_entries (song-first approach)
  -- ───────────────────────────────────────────────────────────
  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  VALUES
    (v_marty, v_em,       1, 'Phase 1: Your First 5 Chords', 0,
     NULL, 'Em Chord - Marty Music',
     'Marty gets you playing songs from lesson 1. Em is your gateway chord — learn it and play a song today.',
     'Waiting until your chord is "perfect" before playing songs. Play rough songs NOW.',
     'Marty''s approach: learn Em, Am, D. Play "Wish You Were Here" intro with just these.'),

    (v_marty, v_am,       1, 'Phase 1: Your First 5 Chords', 1,
     NULL, 'Am Chord - Marty Music',
     'Marty teaches chord families. Am, C, Em, G all share the same key — learn them as a set.',
     'Learning chords in isolation instead of in the context of songs.',
     'Marty''s chord family exercise: Am → C → G → Em. Loop it. This is the chord loop of pop music.'),

    (v_marty, v_g,        1, 'Phase 1: Your First 5 Chords', 2,
     NULL, 'G Chord - Marty Music',
     'Marty often uses a simplified G with fingers 2 and 3 on strings 1 and 6. Easy and effective.',
     'Over-complicating G with 4 fingers before you have the basics locked.',
     'G → C → D → G. The most played progression in country and pop. Learn it, own it.'),

    (v_marty, v_c,        1, 'Phase 1: Your First 5 Chords', 3,
     NULL, 'C Chord - Marty Music',
     'Marty pairs C with G in most of his beginner songs. Learn this change thoroughly.',
     'Not arching the 1st finger — the open B string gets muted.',
     'G → C 50 times slowly. Then C → Am 50 times. Both are very common in Marty''s song lessons.'),

    (v_marty, v_d,        1, 'Phase 1: Your First 5 Chords', 4,
     NULL, 'D Chord - Marty Music',
     'D is the final chord of the "5 chords that unlock 50 songs." Master this and you can play a LOT.',
     'Hitting strings 5 and 6 with D — only the top 4 strings. Marty often reminds students of this.',
     'G → D → C → G loop. Play 20 songs that use only these chords.'),

    (v_marty, v_horse,    2, 'Phase 2: Playing Real Songs', 0,
     'U9QzAr6JiE8', 'Horse With No Name - Easy Guitar Lesson - Marty Music',
     'Marty''s philosophy: play songs from day 1. Horse With No Name is his classic 2-chord starter.',
     'Not playing through the whole song. Always finish what you start.',
     'Marty''s lesson: play the song all the way through, verse and chorus, 3 times in a row.'),

    (v_marty, v_wonderwall, 3, 'Phase 3: The Big Songs', 0,
     NULL, 'Wonderwall - Marty Music Lesson',
     'Marty''s Wonderwall lesson is one of his most viewed. He teaches it with easy voicings first.',
     'Skipping past the chord shapes to get to the strumming — shapes come first.',
     'Marty''s lesson structure: shapes, then rhythm, then combine. Watch once, then play along.'),

    (v_marty, v_blackbird, 5, 'Phase 5: Mastery Songs', 0,
     'tbM1LHzFhBQ', 'Blackbird - Beatles - Marty Music Tutorial',
     'Marty breaks Blackbird into small sections. One section per day is the right pace.',
     'Trying to learn the whole song in one sitting.',
     'Marty''s lesson: bars 1-8, then 9-16, then combine. Use his fret-by-fret breakdown.')

  ON CONFLICT (curriculum_id, skill_id) DO NOTHING;

END $$;
