-- Migration 026: JustinGuitar full seed — 50 entries across 5 grades
-- Adds entries not yet in DB. Idempotent — WHERE NOT EXISTS guard.

-- ── Grade 1: Your First Guitar Lessons ────────────────────────────────────────
-- Existing: warmup_chord_changes(0), chord_em(1), chord_am(2), chord_d(3),
--           strum_down(4), chord_g(5), chord_c(6)
-- Adding: chord_a(7), chord_e(8), first_song_aed(9)

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 1, 'Grade 1: Your First Guitar Lessons', 7,
  'Arch your fingers so each one clears the strings below it.',
  'Flattening the first finger and muting adjacent strings.',
  'Place the A chord slowly, strum, release. Repeat 20 times.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'chord_a'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 1, 'Grade 1: Your First Guitar Lessons', 8,
  'Keep the E chord locked in tight — it is used in hundreds of songs.',
  'Not pressing close enough to the fret, causing buzzing.',
  'E → Am → E → Am — switch every 4 beats for 2 minutes.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'chord_e'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 1, 'Grade 1: Your First Guitar Lessons', 9,
  'Pick any two chords you know and play them along to a simple beat.',
  'Stopping between chords — keep the strumming hand moving.',
  'Play A → D → E in a loop to a metronome at 60 bpm.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'first_song_aed'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

-- ── Grade 2: Developing Skills ─────────────────────────────────────────────────
-- Existing: chord_changes_smooth(0), strum_dduudu(1), song_horse_no_name(2)
-- Adding: fingerpicking_pima(3), power_chords(4), chord_dm(5),
--         palm_muting(6), song_knockin(7), song_wish_you_were(8), hammer_ons_pull_offs(9)

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 2, 'Grade 2: Developing Skills', 3,
  'Use your thumb (p) for the low E/A strings, fingers i-m-a for G-B-e.',
  'Anchoring the wrist — keep it floating lightly above the body.',
  'Practice p-i-m-a on open strings for 5 min before adding chords.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'fingerpicking_pima'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 2, 'Grade 2: Developing Skills', 4,
  'Mute the non-root strings firmly with your index finger barre.',
  'Letting the open strings ring — power chords are 2-string shapes.',
  'Play E5 → A5 → D5 to a rock backing track.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'power_chords'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 2, 'Grade 2: Developing Skills', 5,
  'The Dm chord is fragile — press all 3 fingers at once rather than one at a time.',
  'The high-e string muting under the first finger.',
  'Switch between Am and Dm 30 times with one-minute changes.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'chord_dm'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 2, 'Grade 2: Developing Skills', 6,
  'Rest the palm lightly on the saddle — not too hard or you kill the sustain.',
  'Muting too far back toward the neck.',
  'Palm mute 8 downstrokes on E5 then release for 8 open strums.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'palm_muting'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 2, 'Grade 2: Developing Skills', 7,
  'Slow it down — the G→D→Am→C progression is very chord-change heavy.',
  'Rushing the intro arpeggio pattern before chords are solid.',
  'Loop the G→D→Am→C verse progression for 5 minutes.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'song_knockin'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 2, 'Grade 2: Developing Skills', 8,
  'The iconic intro is all about right-hand fingerpicking independence.',
  'Tensing up on the G-to-Em transition in the intro.',
  'Learn the intro picking pattern slowly at 40 bpm before speed.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'song_wish_you_were'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 2, 'Grade 2: Developing Skills', 9,
  'Hammer-ons should sound as loud as picked notes — use finger strength.',
  'Not pressing hard enough on the hammer — thin sound.',
  'Practice h-o and p-o on each string individually before combining.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'hammer_ons_pull_offs'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

-- ── Grade 3: Barre Chords ──────────────────────────────────────────────────────
-- Existing: chord_f_barre(0), scale_am_penta_box1(1), song_wonderwall(2)
-- Adding: chord_bm_barre(3), blues_shuffle(4), string_bending(5),
--         scale_major_positions(6), vibrato_technique(7), pentatonic_5_boxes(8), song_blackbird(9)

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 3, 'Grade 3: Barre Chords', 3,
  'Use the same barre shape as F but move it to the 2nd fret.',
  'Not fully barring the B string — it sits right under the index.',
  'Switch F→Bm 20 times to build barre chord stamina.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'chord_bm_barre'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 3, 'Grade 3: Barre Chords', 4,
  'Keep the groove steady — the feel of blues comes from relaxed timing.',
  'Playing the shuffle too stiff — it needs a swung 8th note feel.',
  'Play E-A blues shuffle for 5 minutes to a drum loop at 80 bpm.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'blues_shuffle'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 3, 'Grade 3: Barre Chords', 5,
  'Support the bending finger with your other fingers behind it.',
  'Bending out of tune — use a tuner to check the target pitch.',
  'Bend the B string at the 7th fret up a whole tone. Hold 3 seconds, release.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'string_bending'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 3, 'Grade 3: Barre Chords', 6,
  'Learn the G major scale in one position first before connecting positions.',
  'Skipping the fingering pattern and just noodling — be precise.',
  'Play the G major scale in position 1 up and down 10 times clean.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'scale_major_positions'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 3, 'Grade 3: Barre Chords', 7,
  'Start vibrato from the wrist, not just the finger — wider and more controlled.',
  'Doing vibrato too fast and tight — slow and wide sounds more musical.',
  'Add vibrato to every note in your pentatonic scale run.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'vibrato_technique'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 3, 'Grade 3: Barre Chords', 8,
  'Connect the 5 boxes by focusing on the notes they share at the edges.',
  'Learning all 5 boxes but not connecting them — they overlap by design.',
  'Play box 1 then slide to box 2 overlap, then back. Repeat all 5.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'pentatonic_5_boxes'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 3, 'Grade 3: Barre Chords', 9,
  'This song is all about right-hand independence — your left hand barely moves.',
  'Rushing — Blackbird is a slow, deliberate fingerpicking piece.',
  'Learn bars 1–4 perfectly before moving on. Speed comes after accuracy.',
  '5TnySn2KqD4'
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'song_blackbird'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

-- ── Grade 4: Expanding Techniques ─────────────────────────────────────────────
-- Existing: caged_system(0)
-- Adding: modes_intro(1), fingerstyle_patterns(2), fingerstyle_travis(3),
--         chord_a7(4), minor_pentatonic_lead(5), legato_technique(6),
--         chord_progressions_12bar(7), song_brown_eyed_girl(8), song_sweet_home_chicago(9)

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 4, 'Grade 4: Expanding Techniques', 1,
  'Start with Dorian mode — it sounds great over minor chord backing tracks.',
  'Treating modes as separate scales — they are the same notes, different root.',
  'Play Am Dorian over a Dm7 backing track for 5 minutes.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'modes_intro'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 4, 'Grade 4: Expanding Techniques', 2,
  'Build patterns slowly — right hand independence takes weeks to develop.',
  'Using tension in the picking hand — stay loose and fluid.',
  'Practice one fingerstyle pattern for 15 minutes without stopping.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'fingerstyle_patterns'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 4, 'Grade 4: Expanding Techniques', 3,
  'The thumb alternates bass notes independently while fingers pick the melody.',
  'Stopping the thumb when the fingers make a mistake — keep it going.',
  'Travis pick a G chord for 2 minutes — thumb on 6th and 4th strings alternating.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'fingerstyle_travis'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 4, 'Grade 4: Expanding Techniques', 4,
  'A7 is the same shape as A but lift your 3rd finger — simple but essential.',
  'Using a full A barre instead of the open A7 shape.',
  'Play A7→D chord change 30 times — it is a cornerstone blues move.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'chord_a7'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 4, 'Grade 4: Expanding Techniques', 5,
  'Focus on bending, slides and vibrato — these are the expressive lead tools.',
  'Just playing scale runs without dynamics — add space and feeling.',
  'Solo over an Am backing track for 5 minutes using only pentatonic box 1.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'minor_pentatonic_lead'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 4, 'Grade 4: Expanding Techniques', 6,
  'Legato playing is about finger strength — practice slow and deliberate.',
  'Letting notes die out between hammer-ons — keep even pressure.',
  'Play a 4-note legato phrase 50 times slow, then 50 times faster.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'legato_technique'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 4, 'Grade 4: Expanding Techniques', 7,
  'The 12-bar is the backbone of rock and blues — know it in A, E and G.',
  'Not feeling the groove — play with a metronome or drum loop always.',
  'Play the 12-bar in A major for 10 minutes to a shuffle backing track.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'chord_progressions_12bar'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 4, 'Grade 4: Expanding Techniques', 8,
  'Keep the chord changes rolling — the strumming does not stop.',
  'Stopping to reposition — practice the G→C→D changes isolated.',
  'Loop the intro riff for 5 minutes — get the groove locked in.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'song_brown_eyed_girl'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 4, 'Grade 4: Expanding Techniques', 9,
  'The shuffle groove is everything — nail the rhythm before adding licks.',
  'Rushing the turnaround — slow down and feel each beat.',
  'Play the 12-bar Chicago blues shuffle for 10 minutes straight.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'song_sweet_home_chicago'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

-- ── Grade 5: Finding Your Voice ────────────────────────────────────────────────
-- Existing: improvisation_penta(0)
-- Adding: scale_minor_modes(1), ear_training_basics(2), rhythm_advanced(3),
--         song_nothing_else_matters(4), song_hotel_california(5),
--         song_smoke_on_water(6), song_stairway_intro(7),
--         song_let_it_be(8), song_tears_heaven(9)

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 5, 'Grade 5: Finding Your Voice', 1,
  'The natural minor is just the major scale starting from the 6th degree.',
  'Confusing natural minor with the pentatonic — the minor has 7 notes.',
  'Play the A natural minor scale in 3 positions every day this week.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'scale_minor_modes'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 5, 'Grade 5: Finding Your Voice', 2,
  'Sing the note before you play it — your voice is the best ear trainer.',
  'Only training by playing — sing intervals to internalize them.',
  'Sing and play 5 intervals daily: unison, 3rd, 5th, octave, 4th.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'ear_training_basics'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 5, 'Grade 5: Finding Your Voice', 3,
  'Record yourself — timing issues only become obvious when you listen back.',
  'Assuming you are in time because it feels right.',
  'Play with a metronome for 20 minutes — vary the subdivision (8ths, 16ths, triplets).',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'rhythm_advanced'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 5, 'Grade 5: Finding Your Voice', 4,
  'The intro is entirely fingerpicked — use your thumb on the low string throughout.',
  'Using a pick — the song requires consistent fingerstyle technique.',
  'Learn bars 1–8 of the intro perfectly before attempting the full song.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'song_nothing_else_matters'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 5, 'Grade 5: Finding Your Voice', 5,
  'The signature arpeggio intro requires patient fingerstyle work.',
  'Rushing the arpeggio — the magic is in the space between notes.',
  'Learn the Em7 intro arpeggio at 40 bpm before bringing up to speed.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'song_hotel_california'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 5, 'Grade 5: Finding Your Voice', 6,
  'The main riff is 4 power chords — focus on the rhythm and palm muting.',
  'Playing too quietly — Smoke on the Water demands power and presence.',
  'Play the main riff 50 times with palm muting, then 50 times open.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'song_smoke_on_water'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 5, 'Grade 5: Finding Your Voice', 7,
  'The arpeggio picking pattern stays consistent throughout — lock it in first.',
  'Changing the picking pattern when the chords change — it stays the same.',
  'Practice the Am7 intro arpeggio for 10 minutes before adding chords.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'song_stairway_intro'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 5, 'Grade 5: Finding Your Voice', 8,
  'A classic singalong — nail the chord transitions and the rest is easy.',
  'Not singing along — this song loses its magic without the voice.',
  'Loop the C→G→Am→F chorus progression for 5 minutes.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'song_let_it_be'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);

INSERT INTO curriculum_skill_entries
  (curriculum_id, skill_id, phase_number, phase_title, sort_order,
   practice_tip, common_mistake, practice_exercise, video_youtube_id)
SELECT cs.id, s.id, 5, 'Grade 5: Finding Your Voice', 9,
  'The fingerpicking pattern is simple — it is all about the emotional feel.',
  'Playing too rushed — this song breathes and needs space.',
  'Learn the Em-Am fingerpicked intro and add vibrato on the held notes.',
  NULL
FROM curriculum_sources cs CROSS JOIN skills s
WHERE cs.key = 'justinguitar' AND s.key = 'song_tears_heaven'
  AND NOT EXISTS (SELECT 1 FROM curriculum_skill_entries e WHERE e.curriculum_id = cs.id AND e.skill_id = s.id);
