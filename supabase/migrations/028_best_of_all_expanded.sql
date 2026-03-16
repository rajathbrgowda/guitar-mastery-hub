-- Migration 028: Expand Best of All curriculum from 29 → 44 entries
-- Also backfills NULL video IDs where verified YouTube IDs are available.
-- All inserts are idempotent via WHERE NOT EXISTS on (curriculum_id, skill_id).

DO $$
DECLARE
  v_best UUID;

  v_chord_dm          UUID; v_chord_a7         UUID; v_first_song_aed   UUID;
  v_palm_muting       UUID; v_hammer_pulls      UUID; v_string_bending   UUID;
  v_legato            UUID; v_minor_penta_lead  UUID; v_fingerstyle_travis UUID;
  v_rhythm_advanced   UUID; v_scale_minor_modes UUID;
  v_chord_prog_12bar  UUID; v_ear_training      UUID;
  v_song_stand_by_me  UUID; v_song_brown_eyed   UUID;
  v_song_sweet_home   UUID; v_song_tears_heaven UUID;
  v_song_hotel_cal    UUID; v_song_nothing_else UUID;
  v_song_let_it_be    UUID; v_song_smoke_water  UUID;
  v_song_stairway     UUID;
BEGIN
  SELECT id INTO v_best FROM curriculum_sources WHERE key = 'best_of_all';

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
  SELECT id INTO v_song_brown_eyed   FROM skills WHERE key = 'song_brown_eyed_girl';
  SELECT id INTO v_song_sweet_home   FROM skills WHERE key = 'song_sweet_home_chicago';
  SELECT id INTO v_song_tears_heaven FROM skills WHERE key = 'song_tears_heaven';
  SELECT id INTO v_song_hotel_cal    FROM skills WHERE key = 'song_hotel_california';
  SELECT id INTO v_song_nothing_else FROM skills WHERE key = 'song_nothing_else_matters';
  SELECT id INTO v_song_let_it_be    FROM skills WHERE key = 'song_let_it_be';
  SELECT id INTO v_song_smoke_water  FROM skills WHERE key = 'song_smoke_on_water';
  SELECT id INTO v_song_stairway     FROM skills WHERE key = 'song_stairway_intro';

  -- ──────────────────────────────────────────────────────────────────
  -- PHASE 1 additions  (existing sort_order 0-8)
  -- ──────────────────────────────────────────────────────────────────

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_first_song_aed, 1, 'Phase 1: Foundations', 9,
    NULL, 'Your First Song - A, D, E',
    'Playing a complete song — even a rough one — in your very first week builds more motivation than any exercise.',
    'Waiting for perfect technique before playing songs. Play now; refine as you go.',
    'Strum A → D → E using four down-strokes per chord. Play the whole pattern 8 times without stopping.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_first_song_aed
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_chord_a7, 1, 'Phase 1: Foundations', 10,
    NULL, 'A7 Chord',
    'A7 adds bluesy tension to the A chord. Same shape minus one finger — easy win.',
    'Muting the open G string by touching it. Let it ring — it is what gives A7 its colour.',
    'A → A7 → D: the classic country and blues move. Switch 30 times, listening for the colour change.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_chord_a7
  );

  -- ──────────────────────────────────────────────────────────────────
  -- PHASE 2 additions  (existing sort_order 0-5)
  -- ──────────────────────────────────────────────────────────────────

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_chord_dm, 2, 'Phase 2: Building Fluency', 6,
    NULL, 'Dm Chord',
    'Dm opens up the key of C and F. Am → Dm is one of the most emotional minor changes in music.',
    'Letting the 1st string buzz. Your 2nd finger must arch enough to free the high e string.',
    'Am → Dm → G → C: the minor key loop. Practise 50 transitions Am → Dm, then Dm → G.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_chord_dm
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_song_stand_by_me, 2, 'Phase 2: Building Fluency', 7,
    NULL, 'Stand By Me',
    'Four-chord loop in a steady repeating pattern. Great for locking in rhythm and clean chord transitions.',
    'Not feeling the groove — this song has a strong backbeat. Tap your foot and feel the pulse.',
    'A → F#m → D → E, four bars each at 70 BPM. Play through the full verse loop 4 times.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_song_stand_by_me
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_palm_muting, 2, 'Phase 2: Building Fluency', 8,
    NULL, 'Palm Muting',
    'Rest the heel of your picking hand lightly on the strings near the bridge. Too far back = dead; too far forward = no mute.',
    'Muting too heavily — the strings should sound dampened, not dead.',
    'E chord palm muted at 80 BPM. Four downstrokes muted, four open. Hear the contrast.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_palm_muting
  );

  -- ──────────────────────────────────────────────────────────────────
  -- PHASE 3 additions  (existing sort_order 0-5)
  -- ──────────────────────────────────────────────────────────────────

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_string_bending, 3, 'Phase 3: Breaking The Wall', 6,
    NULL, 'String Bending',
    'Support the bending finger with the two fingers behind it. Your index and middle reinforce the ring finger.',
    'Bending with only one finger — weak, sharp sounding, and risks injury.',
    'B string at fret 7: bend up one whole step to pitch of fret 9. Check pitch accuracy. 20 reps.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_string_bending
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_hammer_pulls, 3, 'Phase 3: Breaking The Wall', 7,
    NULL, 'Hammer-ons and Pull-offs',
    'Hammer-ons require a sharp, percussive motion from the fingertip. Pull-offs require a slight sideways snap.',
    'Hammer-ons with a flat finger — the note buzzes. Land on the very tip of the finger.',
    'String 1: pick open, hammer 2nd fret, pull off to open. 30 reps. Even and musical.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_hammer_pulls
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_song_brown_eyed, 3, 'Phase 3: Breaking The Wall', 8,
    NULL, 'Brown Eyed Girl',
    'G → C → G → D forms the backbone of the verse. Smooth, automatic changes are the goal here.',
    'Ignoring the off-beat strumming feel. This song swings slightly — don''t play it robotically.',
    'Play the verse chord progression (G C G D) 8 times with the D-DU-UDU pattern. Then chorus.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_song_brown_eyed
  );

  -- ──────────────────────────────────────────────────────────────────
  -- PHASE 4 additions  (existing sort_order 0-3)
  -- ──────────────────────────────────────────────────────────────────

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_chord_prog_12bar, 4, 'Phase 4: Expanding', 4,
    NULL, '12-Bar Blues Progression',
    'The 12-bar blues is the foundation of rock, blues, and country. Knowing it opens up hundreds of songs instantly.',
    'Getting lost in the form. Count bars aloud until the 12-bar feels natural.',
    '12-bar in A: A7 × 4, D7 × 2, A7 × 2, E7 × 1, D7 × 1, A7 × 2. Loop it slowly.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_chord_prog_12bar
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_fingerstyle_travis, 4, 'Phase 4: Expanding', 5,
    NULL, 'Travis Picking',
    'Thumb alternates on strings 5 and 4 while fingers play melody independently. The thumb is a metronome.',
    'Rushing because the hand can do both parts separately but not together yet. Slow is the only way.',
    'C chord: thumb 5-4-5-4. Add index on string 3 on beats 2 and 4. Keep thumb absolutely steady.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_fingerstyle_travis
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_minor_penta_lead, 4, 'Phase 4: Expanding', 6,
    NULL, 'Lead Guitar Phrases (Pentatonic)',
    'Learning lead phrases from the music you love builds vocabulary. Copy, then create.',
    'Only running up and down the scale. Lead guitar is phrasing, not scales. Target chord tones.',
    'Over Am: play a 4-note phrase. Pause. Play another. Leave space between every phrase.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_minor_penta_lead
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_song_sweet_home, 4, 'Phase 4: Expanding', 7,
    NULL, 'Sweet Home Chicago',
    'Classic 12-bar blues shuffle in E. Use the blues shuffle feel and connect it to the 12-bar form.',
    'Playing the changes without the shuffle feel. It needs to swing — listen to the original recording.',
    '12-bar blues in E using E7-A7-B7. Add the shuffle rhythm. Improvise in Am pentatonic over it.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_song_sweet_home
  );

  -- ──────────────────────────────────────────────────────────────────
  -- PHASE 5 additions  (existing sort_order 0-3)
  -- ──────────────────────────────────────────────────────────────────

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_scale_minor_modes, 5, 'Phase 5: Finding Your Voice', 4,
    NULL, 'Natural Minor Scale',
    'The natural minor adds two extra notes to the pentatonic. Those two notes are the notes of drama and resolution.',
    'Abandoning the pentatonic once you learn the full minor scale. They work together.',
    'A natural minor in position 1. Find the 2 extra notes compared to pentatonic. Use them as passing tones.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_scale_minor_modes
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_ear_training, 5, 'Phase 5: Finding Your Voice', 5,
    NULL, 'Ear Training Basics',
    'Intervals are the foundation of ear training. Start with the octave, then the 5th, then the 4th. Sing what you play.',
    'Practising intervals without singing. The voice is the tool — if you can sing it, you can find it on the guitar.',
    'Pick any note. Find it one octave up on the same string. Play and sing both. Repeat on 5 different notes.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_ear_training
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_rhythm_advanced, 5, 'Phase 5: Finding Your Voice', 6,
    NULL, 'Advanced Rhythm and Timing',
    'Advanced rhythm is about syncopation and feel, not just more complex patterns. Ghost strums create the pocket.',
    'Adding complexity for its own sake. Great rhythm guitar serves the song, not the ego.',
    'G chord: D-DU-UDU, emphasise the upstroke on the "and" of 2. Record yourself and listen back.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_rhythm_advanced
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_song_hotel_cal, 5, 'Phase 5: Finding Your Voice', 7,
    NULL, 'Hotel California',
    'The intro arpeggio over a descending minor progression is one of the most iconic guitar parts ever recorded.',
    'Rushing through the intro chord shapes. Each chord must be placed before the arpeggio can sound right.',
    'Bm-F#-A-E-G-D-Em-F# with fingerpicked arpeggios. One chord per day until all 8 are comfortable.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_song_hotel_cal
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_song_tears_heaven, 5, 'Phase 5: Finding Your Voice', 8,
    NULL, 'Tears in Heaven',
    'Fingerpicking with a walking bass line and chord melody. This is what advanced fingerstyle sounds like.',
    'Playing the chords and melody as separate exercises. They must feel connected from the start.',
    'Learn the picking pattern on Am. Apply it to A, C, D. Connect the bass movement between chords.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_song_tears_heaven
  );

  INSERT INTO curriculum_skill_entries
    (curriculum_id, skill_id, phase_number, phase_title, sort_order,
     video_youtube_id, video_title, practice_tip, common_mistake, practice_exercise)
  SELECT v_best, v_legato, 5, 'Phase 5: Finding Your Voice', 9,
    NULL, 'Legato Technique',
    'Legato chains hammer-ons and pull-offs to create a smooth, singing lead sound. Economy of motion is key.',
    'Picking between hammer-ons. Once you start a legato run, the pick stays still.',
    'Frets 5-7-8 on string 2: hammer 7, hammer 8, pull-off 7, pull-off 5. Clean and even at 60 BPM.'
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_skill_entries WHERE curriculum_id = v_best AND skill_id = v_legato
  );

  -- ──────────────────────────────────────────────────────────────────
  -- Backfill verified video IDs (NULL → known-good YouTube IDs)
  -- IDs verified via oEmbed: qXK_If0QzDM, Hfm4-yOI6oA, kV_EABwevy4,
  --   lPVK7eI2dKY, ecPzu9sTKbo, t2OCGN6AspY, 5TnySn2KqD4
  -- ──────────────────────────────────────────────────────────────────

  -- JustinGuitar Grade 1 warmup — qXK_If0QzDM (One Minute Changes)
  -- Already set in migration 008 as cHRFCNNrPKs — leave as-is

  -- Blackbird — tbM1LHzFhBQ already set in 008 — leave as-is

  -- Horse With No Name — U9QzAr6JiE8 already set in 008 — leave as-is

  -- song_nothing_else_matters in best_of_all — set verified intro ID
  UPDATE curriculum_skill_entries cse
  SET video_youtube_id = 'ecPzu9sTKbo',
      video_title      = 'Nothing Else Matters Intro - Metallica Guitar Tutorial'
  FROM curriculum_sources cs, skills sk
  WHERE cse.curriculum_id = cs.id
    AND cse.skill_id       = sk.id
    AND cs.key             = 'best_of_all'
    AND sk.key             = 'song_nothing_else_matters'
    AND cse.video_youtube_id IS NULL;

  -- song_smoke_on_water in best_of_all — set verified riff ID (if present after this migration)
  UPDATE curriculum_skill_entries cse
  SET video_youtube_id = 't2OCGN6AspY',
      video_title      = 'Smoke on the Water - Deep Purple - Easy Guitar'
  FROM curriculum_sources cs, skills sk
  WHERE cse.curriculum_id = cs.id
    AND cse.skill_id       = sk.id
    AND cs.key             = 'best_of_all'
    AND sk.key             = 'song_smoke_on_water'
    AND cse.video_youtube_id IS NULL;

END $$;
