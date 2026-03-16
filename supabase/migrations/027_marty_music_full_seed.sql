-- Migration 027: Expand Marty Music curriculum to 50 entries (song-first approach)
-- Existing: 8 entries. This adds 42 more = 50 total.
-- All inserts are idempotent via WHERE NOT EXISTS on (curriculum_id, skill_id).

DO $$
DECLARE
  v_marty UUID;

  v_warmup       UUID; v_em      UUID; v_am     UUID; v_d      UUID; v_g      UUID;
  v_c            UUID; v_a       UUID; v_e      UUID; v_strum_down UUID;
  v_transitions  UUID; v_strum_dduudu UUID; v_fingerpick UUID; v_power  UUID;
  v_horse        UUID; v_knockin UUID; v_f_barre UUID; v_bm_barre UUID;
  v_am_penta     UUID; v_blues   UUID; v_wonderwall UUID; v_wish   UUID;
  v_caged        UUID; v_major_scale UUID; v_penta_5 UUID; v_vibrato UUID;
  v_improv       UUID; v_modes   UUID; v_fingerstyle UUID; v_blackbird UUID;
  -- new skills from migration 025
  v_chord_dm     UUID; v_chord_a7 UUID; v_first_song_aed UUID;
  v_palm_muting  UUID; v_hammer_pulls UUID; v_string_bending UUID;
  v_legato       UUID; v_minor_penta_lead UUID; v_fingerstyle_travis UUID;
  v_rhythm_advanced UUID; v_scale_minor_modes UUID;
  v_chord_prog_12bar UUID; v_ear_training UUID;
  v_song_stand_by_me UUID; v_song_la_bamba UUID; v_song_house_rising UUID;
  v_song_brown_eyed UUID; v_song_sweet_home UUID; v_song_tears_heaven UUID;
  v_song_hotel_cal UUID; v_song_nothing_else UUID; v_song_let_it_be UUID;
  v_song_smoke_water UUID; v_song_stairway UUID;
BEGIN
  SELECT id INTO v_marty FROM curriculum_sources WHERE key = 'marty_music';

  SELECT id INTO v_warmup            FROM skills WHERE key = 'warmup_chord_changes';
  SELECT id INTO v_em                FROM skills WHERE key = 'chord_em';
  SELECT id INTO v_am                FROM skills WHERE key = 'chord_am';
  SELECT id INTO v_d                 FROM skills WHERE key = 'chord_d';
  SELECT id INTO v_g                 FROM skills WHERE key = 'chord_g';
  SELECT id INTO v_c                 FROM skills WHERE key = 'chord_c';
  SELECT id INTO v_a                 FROM skills WHERE key = 'chord_a';
  SELECT id INTO v_e                 FROM skills WHERE key = 'chord_e';
  SELECT id INTO v_strum_down        FROM skills WHERE key = 'strum_down';
  SELECT id INTO v_transitions       FROM skills WHERE key = 'chord_changes_smooth';
  SELECT id INTO v_strum_dduudu      FROM skills WHERE key = 'strum_dduudu';
  SELECT id INTO v_fingerpick        FROM skills WHERE key = 'fingerpicking_pima';
  SELECT id INTO v_power             FROM skills WHERE key = 'power_chords';
  SELECT id INTO v_horse             FROM skills WHERE key = 'song_horse_no_name';
  SELECT id INTO v_knockin           FROM skills WHERE key = 'song_knockin';
  SELECT id INTO v_f_barre           FROM skills WHERE key = 'chord_f_barre';
  SELECT id INTO v_bm_barre          FROM skills WHERE key = 'chord_bm_barre';
  SELECT id INTO v_am_penta          FROM skills WHERE key = 'scale_am_penta_box1';
  SELECT id INTO v_blues             FROM skills WHERE key = 'blues_shuffle';
  SELECT id INTO v_wonderwall        FROM skills WHERE key = 'song_wonderwall';
  SELECT id INTO v_wish              FROM skills WHERE key = 'song_wish_you_were';
  SELECT id INTO v_caged             FROM skills WHERE key = 'caged_system';
  SELECT id INTO v_major_scale       FROM skills WHERE key = 'scale_major_positions';
  SELECT id INTO v_penta_5           FROM skills WHERE key = 'pentatonic_5_boxes';
  SELECT id INTO v_vibrato           FROM skills WHERE key = 'vibrato_technique';
  SELECT id INTO v_improv            FROM skills WHERE key = 'improvisation_penta';
  SELECT id INTO v_modes             FROM skills WHERE key = 'modes_intro';
  SELECT id INTO v_fingerstyle       FROM skills WHERE key = 'fingerstyle_patterns';
  SELECT id INTO v_blackbird         FROM skills WHERE key = 'song_blackbird';
  SELECT id INTO v_chord_dm          FROM skills WHERE key = 'chord_dm';
  SELECT id INTO v_chord_a7          FROM skills WHERE key = 'chord_a7';
  SELECT id INTO v_first_song_aed    FROM skills WHERE key = 'first_song_aed';
  SELECT id INTO v_palm_muting       FROM skills WHERE key = 'palm_muting';
  SELECT id INTO v_hammer_pulls      FROM skills WHERE key = 'hammer_ons_pull_offs';
  SELECT id INTO v_string_bending    FROM skills WHERE key = 'string_bending';
  SELECT id INTO v_legato            FROM skills WHERE key = 'legato_technique';
  SELECT id INTO v_minor_penta_lead  FROM skills WHERE key = 'minor_pentatonic_lead';
  SELECT id INTO v_fingerstyle_travis FROM skills WHERE key = 'fingerstyle_travis';
  SELECT id INTO v_rhythm_advanced   FROM skills WHERE key = 'rhythm_advanced';
  SELECT id INTO v_scale_minor_modes FROM skills WHERE key = 'scale_minor_modes';
  SELECT id INTO v_chord_prog_12bar  FROM skills WHERE key = 'chord_progressions_12bar';
  SELECT id INTO v_ear_training      FROM skills WHERE key = 'ear_training_basics';
  SELECT id INTO v_song_stand_by_me  FROM skills WHERE key = 'song_stand_by_me';
  SELECT id INTO v_song_la_bamba     FROM skills WHERE key = 'song_la_bamba';
  SELECT id INTO v_song_house_rising FROM skills WHERE key = 'song_house_rising_sun';
  SELECT id INTO v_song_brown_eyed   FROM skills WHERE key = 'song_brown_eyed_girl';
  SELECT id INTO v_song_sweet_home   FROM skills WHERE key = 'song_sweet_home_chicago';
  SELECT id INTO v_song_tears_heaven FROM skills WHERE key = 'song_tears_heaven';
  SELECT id INTO v_song_hotel_cal    FROM skills WHERE key = 'song_hotel_california';
  SELECT id INTO v_song_nothing_else FROM skills WHERE key = 'song_nothing_else_matters';
  SELECT id INTO v_song_let_it_be    FROM skills WHERE key = 'song_let_it_be';
  SELECT id INTO v_song_smoke_water  FROM skills WHERE key = 'song_smoke_on_water';
  SELECT id INTO v_song_stairway     FROM skills WHERE key = 'song_stairway_intro';

  -- ──────────────────────────────────────────────────────────────────
  -- PHASE 1: Your First 5 Chords  (existing: em=0, am=1, g=2, c=3, d=4)
  -- Adding sort_order 5-9: strum_down, a, e, first_song_aed, warmup
  -- ──────────────────────────────────────────────────────────────────

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_strum_down, 1, 'Phase 1: Your First 5 Chords', 5,
    NULL, 'Basic Strumming - Marty Music',
    'Marty keeps it simple: four even downstrokes per bar. Loose wrist, not a stiff arm swing.',
    'Gripping the pick too tight — tension kills groove. Hold it firmly but relaxed.',
    'Hold G chord. Four downstrokes per bar at 60 BPM for 2 minutes. Focus on even spacing.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_strum_down
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_a, 1, 'Phase 1: Your First 5 Chords', 6,
    NULL, 'A Chord - Marty Music',
    'Marty often bunches all three fingers into fret 2 as a tiny barre. Works great for fast changes.',
    'Squishing strings together so they buzz. Arch each finger slightly.',
    'A → D → E: the I-IV-V blues progression. Marty builds almost every rock song on this.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_a
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_e, 1, 'Phase 1: Your First 5 Chords', 7,
    NULL, 'E Major Chord - Marty Music',
    'Marty pairs E with A and D — three chords that unlock most classic rock and blues.',
    'Forgetting to mute the open B string by accident. Keep fingers arched.',
    'E → A → D: 50 transitions each pair. Then play a 12-bar blues with just these three.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_e
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_first_song_aed, 1, 'Phase 1: Your First 5 Chords', 8,
    NULL, 'Play Your First Song - Marty Music',
    'Marty''s signature move: get students playing a full song on day one using A, D, and E.',
    'Waiting for perfect tone before playing songs. Rough is fine — play now, refine later.',
    'Use A, D, E. Pick a simple song (like Brown Eyed Girl verse). Play start to finish.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_first_song_aed
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_warmup, 1, 'Phase 1: Your First 5 Chords', 9,
    NULL, 'Chord Changes Practice - Marty Music',
    'Marty uses 1-minute chord changes as a warm-up in every practice session.',
    'Counting too loosely. Use a metronome and a tally mark for every clean change.',
    'One minute of G → C changes. Count every clean switch. Beat your score tomorrow.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_warmup
  );

  -- ──────────────────────────────────────────────────────────────────
  -- PHASE 2: Playing Real Songs  (existing: horse=0)
  -- Adding sort_order 1-9
  -- ──────────────────────────────────────────────────────────────────

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_strum_dduudu, 2, 'Phase 2: Playing Real Songs', 1,
    NULL, 'Strumming Pattern - Marty Music',
    'Marty teaches the D-DU-UDU pattern early so students can play actual songs. Keep the hand moving.',
    'Stopping the hand during up-strums. The phantom strums are what lock in rhythm.',
    'G chord, D-DU-UDU for 4 bars. Then switch to C mid-bar. Keep the pattern unbroken.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_strum_dduudu
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_knockin, 2, 'Phase 2: Playing Real Songs', 2,
    NULL, 'Knockin'' on Heaven''s Door - Marty Music',
    'Marty teaches this early because the slow tempo gives beginners time to make chord changes.',
    'Rushing the tempo to sound more impressive. Slow and steady sounds better here.',
    'G → D → Am loop. Add Marty''s simple strum. Play the full song once, then twice.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_knockin
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_transitions, 2, 'Phase 2: Playing Real Songs', 3,
    NULL, 'Smooth Chord Changes - Marty Music',
    'Marty: "A rough chord change at the right time beats a perfect chord one beat late."',
    'Practicing changes too slowly in isolation — always practice changes inside a song.',
    'Pick your hardest chord pair from the current song. 50 changes with a metronome.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_transitions
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_song_stand_by_me, 2, 'Phase 2: Playing Real Songs', 4,
    NULL, 'Stand By Me - Easy Guitar',
    'Four chords — A, F#m, D, E — in a beautiful repeating loop. Marty uses this to teach looping patterns.',
    'Not feeling the groove. This song has a strong pulse — tap your foot to the bass line.',
    'Loop A → F#m → D → E four times. Add a simple strum. Then sing or hum the melody over it.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_song_stand_by_me
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_song_la_bamba, 2, 'Phase 2: Playing Real Songs', 5,
    NULL, 'La Bamba - Easy Guitar Lesson',
    'C, F, G — the three-chord song used in Spanish guitar lessons. Strumming with conviction is everything here.',
    'Playing it too reserved. La Bamba wants energy and commitment. Strum like you mean it.',
    'C → F → G loop at 80 BPM with a rhythmic strum. Play the full song verse to chorus.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_song_la_bamba
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_chord_dm, 2, 'Phase 2: Playing Real Songs', 6,
    NULL, 'Dm Chord - Marty Music',
    'Dm unlocks sad, dramatic, and minor-flavoured songs. Marty uses it in dozens of song lessons.',
    'Muting the first string. Arch your 2nd finger to leave the high e string ringing open.',
    'Am → Dm → G → C. The classic minor-key loop that appears in hundreds of songs.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_chord_dm
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_song_house_rising, 2, 'Phase 2: Playing Real Songs', 7,
    NULL, 'House of the Rising Sun - Guitar',
    'Am, C, D, F, E — and the iconic arpeggiated pattern that defines the song. Marty teaches the picking pattern step-by-step.',
    'Learning the chords but ignoring the arpeggio pattern. The picking is what makes this song.',
    'Learn the Am arpeggio pattern first (bass note + 3 treble notes). Then apply to all chords.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_song_house_rising
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_fingerpick, 2, 'Phase 2: Playing Real Songs', 8,
    NULL, 'Fingerpicking Basics - Marty Music',
    'Marty introduces fingerpicking by applying it immediately to a song, not as an isolated exercise.',
    'Tension in the right hand. Fingerpicking only works when the hand is completely relaxed.',
    'p-i-m-a on Am chord, slow and even. Apply the same pattern to C, G, Em.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_fingerpick
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_wish, 2, 'Phase 2: Playing Real Songs', 9,
    NULL, 'Wish You Were Here - Marty Music',
    'Marty''s "Wish You Were Here" intro lesson is one of his most popular. Great for fingerpicking beginners.',
    'Rushing the intro riff. This intro works at half speed — it still sounds beautiful.',
    'Learn just bars 1-2 of the intro. Repeat 20 times. Then add bar 3. One bar per session.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_wish
  );

  -- ──────────────────────────────────────────────────────────────────
  -- PHASE 3: The Big Songs  (existing: wonderwall=0)
  -- Adding sort_order 1-9
  -- ──────────────────────────────────────────────────────────────────

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_f_barre, 3, 'Phase 3: The Big Songs', 1,
    NULL, 'F Barre Chord - Marty Music',
    'Marty is honest: F barre is hard, everyone struggles, and it takes time. Short daily sessions beat marathon practice.',
    'Squeezing with every finger equally. Only the barre needs extra pressure.',
    'F chord: barre fret 1, add Am shape. Press, listen, adjust one dead note at a time. 3 minutes daily.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_f_barre
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_bm_barre, 3, 'Phase 3: The Big Songs', 2,
    NULL, 'Bm Barre Chord - Marty Music',
    'Bm unlocks the key of G, which is where dozens of Marty''s favourite songs live.',
    'Trying to barre all 6 strings. Bm only needs strings 5-1 — mute string 6.',
    'G → D → Em → Bm. The key of G with Bm. Essential for countless Marty song lessons.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_bm_barre
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_song_brown_eyed, 3, 'Phase 3: The Big Songs', 3,
    NULL, 'Brown Eyed Girl - Easy Guitar',
    'G, C, D, Em — Marty''s bread-and-butter chord set. Brown Eyed Girl is the song that proves those four chords do everything.',
    'Not locking in the G → C change. This is the backbone of the verse — make it automatic.',
    'G → C → G → D verse loop. Learn the strum pattern. Play the verse 5 times without stopping.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_song_brown_eyed
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_blues, 3, 'Phase 3: The Big Songs', 4,
    NULL, 'Blues Shuffle - Marty Music',
    'Marty uses the blues shuffle to introduce rhythm guitar feel. It is the heartbeat of classic rock.',
    'Playing it straight instead of swung. Listen to the shuffle feel and imitate it before playing.',
    'E shuffle: 2nd fret to 4th fret on strings 5/4. Alternate picking. Swing it. Add A and B shuffles.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_blues
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_am_penta, 3, 'Phase 3: The Big Songs', 5,
    NULL, 'Am Pentatonic Scale - Marty Music',
    'Marty teaches the pentatonic scale as a tool for making music, not an academic exercise.',
    'Memorising the shape without making music with it. Learn 3 licks and improvise immediately.',
    'Box 1 up and down 5 times clean. Then improvise over a Marty backing track for 5 minutes.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_am_penta
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_string_bending, 3, 'Phase 3: The Big Songs', 6,
    NULL, 'String Bending - Marty Music',
    'Marty introduces bending in the context of blues and rock solos. Support the bending finger with the fingers behind it.',
    'Bending without supporting fingers — leads to weak, out-of-tune bends.',
    'B (2nd) string, 7th fret: bend up one whole step. Aim to match the pitch of the 9th fret.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_string_bending
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_song_sweet_home, 3, 'Phase 3: The Big Songs', 7,
    NULL, 'Sweet Home Chicago - Easy Guitar',
    'Classic 12-bar blues in E. Marty uses this to teach the connection between chords and the pentatonic scale.',
    'Playing only the chord shapes and ignoring the blues fill opportunities between changes.',
    '12-bar blues in E: E → A → E → E → A → A → E → E → B → A → E → B. Loop it twice.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_song_sweet_home
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_power, 3, 'Phase 3: The Big Songs', 8,
    NULL, 'Power Chords - Marty Music',
    'Marty teaches power chords for rock songs. Two-note shapes, moveable anywhere, instantly satisfying.',
    'Letting open strings ring around the power chord — palm muting is your friend here.',
    'E5 → A5 → D5 → G5 at 90 BPM. Palm mute all. Then try riffs from Marty''s rock song lessons.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_power
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_song_nothing_else, 3, 'Phase 3: The Big Songs', 9,
    NULL, 'Nothing Else Matters Intro - Metallica - Marty Music',
    'Marty''s lesson on this intro is one of his most-watched. All fingerpicked arpeggios on open-string chords.',
    'Playing it too fast. Metallica''s original is slow and deliberate — respect the tempo.',
    'Learn bars 1-4 only. Right-hand fingers: p on string 6, i-m-a on strings 3-2-1. Slow practice.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_song_nothing_else
  );

  -- ──────────────────────────────────────────────────────────────────
  -- PHASE 4: Intermediate Songs  (existing: 0)
  -- Adding sort_order 0-9
  -- ──────────────────────────────────────────────────────────────────

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_chord_a7, 4, 'Phase 4: Intermediate Songs', 0,
    NULL, 'A7 Chord - Marty Music',
    'A7 is the bluesy dominant 7th chord that adds tension and release to progressions. Marty uses it in shuffle blues.',
    'Forgetting to let the open G string ring. A7 has an open 3rd string — do not mute it.',
    'A7 → D7 → E7: the I-IV-V in a blues context. Play a 12-bar blues using all three.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_chord_a7
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_hammer_pulls, 4, 'Phase 4: Intermediate Songs', 1,
    NULL, 'Hammer-ons and Pull-offs - Marty Music',
    'Marty teaches hammer-ons in the context of solos and fills. They make playing sound smooth and legato.',
    'Not fretting hard enough on the hammer. The note must sustain without picking it again.',
    'On string 1: pick open, hammer 2nd fret, pull off back to open. Repeat 20 times. Keep it musical.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_hammer_pulls
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_caged, 4, 'Phase 4: Intermediate Songs', 2,
    NULL, 'CAGED System - Marty Music',
    'Marty teaches CAGED as a map to freedom. Once you know it, you can play any chord anywhere on the neck.',
    'Getting stuck memorising shapes in isolation. Always connect shapes you already know.',
    'Take G chord. Find it in 5 positions up the neck. Play each one and make sure it rings clean.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_caged
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_minor_penta_lead, 4, 'Phase 4: Intermediate Songs', 3,
    NULL, 'Lead Guitar with Pentatonic - Marty Music',
    'Marty''s lead guitar lessons focus on musical phrasing over speed. Three notes said well beats thirty said fast.',
    'Copying scale runs without phrasing. Bend, slide, and leave space like the players you love.',
    'Learn Marty''s beginner blues lick: fret 5 bend on B string. Add vibrato. Now play it over a backing track.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_minor_penta_lead
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_chord_prog_12bar, 4, 'Phase 4: Intermediate Songs', 4,
    NULL, '12-Bar Blues - Marty Music',
    'Marty treats the 12-bar as the foundation of rock. Once you feel the 12-bar, everything clicks.',
    'Counting wrong and losing your place. Sing the changes: "one-two-three-four-change".',
    'Slow 12-bar in A using A7, D7, E7. Four bars of A7, two of D7, two A7, one E7, one D7, two A7.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_chord_prog_12bar
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_song_tears_heaven, 4, 'Phase 4: Intermediate Songs', 5,
    NULL, 'Tears in Heaven - Eric Clapton - Guitar',
    'Fingerpicking with chord melody. Marty teaches it as an intermediate fingerpicking goal.',
    'Separating the bass from the treble too mechanically. The groove is in the interaction between them.',
    'Learn the picking pattern on Am chord first. Apply it to A, C, G, D before attempting the song.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_song_tears_heaven
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_vibrato, 4, 'Phase 4: Intermediate Songs', 6,
    NULL, 'Guitar Vibrato - Marty Music',
    'Marty teaches vibrato as expression, not technique. The note should feel alive. Use your wrist.',
    'Vibrato with finger movement only — weak and inconsistent. The wrist rotates, the finger holds.',
    'Sustain any note on strings 1-2. Push/pull with the wrist for 5 even oscillations. Even speed.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_vibrato
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_song_smoke_water, 4, 'Phase 4: Intermediate Songs', 7,
    NULL, 'Smoke on the Water - Deep Purple',
    'Marty''s Smoke on the Water lesson covers the iconic riff and power chord version. Essential rock milestone.',
    'Playing only the riff in isolation. Learn the full song structure, verse and chorus.',
    'Learn the riff (G5-Bb5-C5 etc.). Then learn the full song arrangement. Play it start to finish.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_song_smoke_water
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_fingerstyle_travis, 4, 'Phase 4: Intermediate Songs', 8,
    NULL, 'Travis Picking - Marty Music',
    'Marty introduces Travis picking for country and folk fingerstyle. Thumb alternates bass while fingers play treble melody.',
    'Making the thumb and fingers dependent on each other — they must be independent. Start very slow.',
    'C chord: thumb alternates strings 5 and 4. Add index on beat 2, middle on beat 4. 60 BPM.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_fingerstyle_travis
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_song_hotel_cal, 4, 'Phase 4: Intermediate Songs', 9,
    NULL, 'Hotel California - Eagles - Guitar',
    'The iconic intro uses a fingerpicked arpeggiated pattern across a descending chord progression. Marty teaches it in sections.',
    'Trying the full intro before the chord shapes are automatic. Chord shapes first, then picking.',
    'Bm → F# → A → E → G → D → Em → F#. Learn each chord, then apply the arpeggio pattern.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_song_hotel_cal
  );

  -- ──────────────────────────────────────────────────────────────────
  -- PHASE 5: Mastery Songs  (existing: blackbird=0)
  -- Adding sort_order 1-9
  -- ──────────────────────────────────────────────────────────────────

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_improv, 5, 'Phase 5: Mastery Songs', 1,
    NULL, 'Improvisation - Marty Music',
    'Marty''s approach: improvise over backing tracks from day one, even badly. That is how you develop your voice.',
    'Playing scales instead of music. Target chord tones. Leave space. Tell a story.',
    'Am backing track: play 4 notes, pause 2 beats, play 4 notes. No running scales. Pure expression.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_improv
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_penta_5, 5, 'Phase 5: Mastery Songs', 2,
    NULL, 'All 5 Pentatonic Boxes - Marty Music',
    'Marty teaches the five boxes as a fretboard map. Memorise the connections, not just the shapes.',
    'Learning all 5 at once in an afternoon. Add one box per week and actually improvise with it.',
    'Box 1 → connect to Box 2 at 8th fret. Improvise using both. Next week: add Box 3.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_penta_5
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_scale_minor_modes, 5, 'Phase 5: Mastery Songs', 3,
    NULL, 'Natural Minor Scale - Marty Music',
    'The natural minor scale is the basis for most rock and metal lead guitar. Marty teaches it alongside the pentatonic to show the connection.',
    'Treating minor scale and pentatonic as unrelated. They share 5 notes — see the overlap.',
    'A natural minor in position 1. Compare to A pentatonic box 1. Play a lick using the extra notes.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_scale_minor_modes
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_legato, 5, 'Phase 5: Mastery Songs', 4,
    NULL, 'Legato Technique - Marty Music',
    'Legato means hammer-ons and pull-offs chained together to create a smooth, flowing sound. Marty uses it in his advanced song breakdowns.',
    'Not sustaining notes through the chain. Each note must sound clearly without extra picking.',
    'String 2, frets 5-7-8: hammer on 7, hammer on 8, pull off 7, pull off 5. Keep it even.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_legato
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_song_stairway, 5, 'Phase 5: Mastery Songs', 5,
    NULL, 'Stairway to Heaven Intro - Led Zeppelin',
    'Marty breaks the intro into small sections. The beauty is in the slowness and note clarity — no rushing.',
    'Playing through dead notes because the full song is the goal. One note out of tune ruins everything.',
    'Learn the first 4 notes of the intro riff. Perfect each note before adding the next. Very slow.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_song_stairway
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_song_let_it_be, 5, 'Phase 5: Mastery Songs', 6,
    NULL, 'Let It Be - Beatles - Guitar',
    'C, G, Am, F — the same four-chord loop the Beatles used. Marty teaches Let It Be as a fingerpicking and chord melody study.',
    'Playing only strummed chords when the song calls for a lighter, more melodic approach.',
    'C → G → Am → F with fingerpicking. Learn the melody notes that sit on top of each chord.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_song_let_it_be
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_modes, 5, 'Phase 5: Mastery Songs', 7,
    NULL, 'Guitar Modes Introduction - Marty Music',
    'Marty explains modes as different starting points on the same scale. Dorian is the most useful for rock and blues.',
    'Confusing modes with entirely different scales. A Dorian uses the exact same notes as G major.',
    'Play G major scale starting from A. That is A Dorian. Improvise in A Dorian over an Am backing track.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_modes
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_rhythm_advanced, 5, 'Phase 5: Mastery Songs', 8,
    NULL, 'Advanced Rhythm Guitar - Marty Music',
    'Marty teaches rhythm as feel, not just pattern. Syncopation, ghost strums, and chord rhythms that drive a song.',
    'Thinking rhythm guitar is "lesser" than lead. Every great band is held together by the rhythm guitarist.',
    'Ghost strum exercise: play D-DU-UDU. Miss beats 2 and 4 with the pick. Feel the pocket.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_rhythm_advanced
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_marty, v_ear_training, 5, 'Phase 5: Mastery Songs', 9,
    NULL, 'Ear Training for Guitarists - Marty Music',
    'Marty teaches ear training by figuring out songs by ear. Start with simple melodies, then work up to chords.',
    'Relying entirely on tabs. Tabs are a crutch — your ears need exercise too.',
    'Pick a Marty song you know well. Try to figure out just the first 4 chords by ear. Check against the lesson.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_marty AND skill_id = v_ear_training
  );

END $$;
