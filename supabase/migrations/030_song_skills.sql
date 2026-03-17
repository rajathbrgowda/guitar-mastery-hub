-- 030_song_skills.sql
-- Adds is_song + song_artist to the canonical skills table.
-- Backfills all song-prefixed keys with is_song=true and known artists.

ALTER TABLE skills ADD COLUMN IF NOT EXISTS is_song BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS song_artist TEXT;

-- Backfill is_song flag for all song-prefix keys
UPDATE skills
SET is_song = true
WHERE key LIKE 'song_%' OR key = 'first_song_aed';

-- Backfill known artists
UPDATE skills SET song_artist = 'The Beatles'   WHERE key = 'song_blackbird';
UPDATE skills SET song_artist = 'The Beatles'   WHERE key = 'song_let_it_be';
UPDATE skills SET song_artist = 'Van Morrison'  WHERE key = 'song_brown_eyed_girl';
UPDATE skills SET song_artist = 'America'       WHERE key = 'song_horse_no_name';
UPDATE skills SET song_artist = 'Eagles'        WHERE key = 'song_hotel_california';
UPDATE skills SET song_artist = 'The Animals'   WHERE key = 'song_house_rising_sun';
UPDATE skills SET song_artist = 'Bob Dylan'     WHERE key = 'song_knockin';
UPDATE skills SET song_artist = 'Ritchie Valens' WHERE key = 'song_la_bamba';
UPDATE skills SET song_artist = 'Metallica'     WHERE key = 'song_nothing_else_matters';
UPDATE skills SET song_artist = 'Deep Purple'   WHERE key = 'song_smoke_on_water';
UPDATE skills SET song_artist = 'Led Zeppelin'  WHERE key = 'song_stairway_intro';
UPDATE skills SET song_artist = 'Ben E. King'   WHERE key = 'song_stand_by_me';
UPDATE skills SET song_artist = 'Robert Johnson' WHERE key = 'song_sweet_home_chicago';
UPDATE skills SET song_artist = 'Eric Clapton'  WHERE key = 'song_tears_heaven';
UPDATE skills SET song_artist = 'Pink Floyd'    WHERE key = 'song_wish_you_were';
UPDATE skills SET song_artist = 'Pink Floyd'    WHERE key = 'song_wish_you_were_full';
UPDATE skills SET song_artist = 'Oasis'         WHERE key = 'song_wonderwall';
