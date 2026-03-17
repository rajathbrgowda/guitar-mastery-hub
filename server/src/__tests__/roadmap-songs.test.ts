/**
 * roadmap-songs.test.ts — CARD-454
 * Verifies that GET /api/roadmap returns is_song and song_artist fields
 * correctly for each skill in the phase response.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

import app from '../app';
import { supabase } from '../lib/supabase';

const mockGetUser = vi.mocked(supabase.auth.getUser);
const mockFrom = vi.mocked(supabase.from);
const AUTH = { Authorization: 'Bearer valid-token' };

beforeEach(() => {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-songs', email: 'songs@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSkillEntry(opts: {
  phase: number;
  skillId: string;
  skillKey: string;
  skillTitle: string;
  isSong?: boolean;
  songArtist?: string | null;
}) {
  return {
    phase_number: opts.phase,
    phase_title: `Phase ${opts.phase}`,
    sort_order: 0,
    practice_tip: null,
    common_mistake: null,
    practice_exercise: null,
    video_youtube_id: null,
    video_title: null,
    skills: {
      id: opts.skillId,
      key: opts.skillKey,
      title: opts.skillTitle,
      category: 'technique',
      is_song: opts.isSong ?? false,
      song_artist: opts.songArtist ?? null,
    },
  };
}

function setupMocks(entries: object[]) {
  const mockUser = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { current_phase: 1, selected_curriculum_key: 'best_of_all' },
          error: null,
        }),
      }),
    }),
  };

  const mockCurriculum = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'cur-1', name: 'Best of All', style: null },
            error: null,
          }),
        }),
      }),
    }),
  };

  const order2 = vi.fn().mockResolvedValue({ data: entries, error: null });
  const order1 = vi.fn().mockReturnValue({ order: order2 });
  const entriesEq: ReturnType<typeof vi.fn> = vi.fn();
  entriesEq.mockReturnValue({ eq: entriesEq, order: order1 });
  const mockEntries = { select: vi.fn().mockReturnValue({ eq: entriesEq }) };

  const progressEq: ReturnType<typeof vi.fn> = vi.fn();
  progressEq.mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) });
  const mockProgress = { select: vi.fn().mockReturnValue({ eq: progressEq }) };

  const mockSessions = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }),
  };

  const mockCompletions = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    }),
  };

  let callCount = 0;
  mockFrom.mockImplementation((table: string) => {
    callCount++;
    if (table === 'users') return mockUser as never;
    if (table === 'curriculum_sources') return mockCurriculum as never;
    if (table === 'curriculum_skill_entries') return mockEntries as never;
    if (table === 'skill_progress') {
      return callCount <= 4 ? (mockProgress as never) : (mockCompletions as never);
    }
    if (table === 'practice_sessions') return mockSessions as never;
    return {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null }) }),
    } as never;
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/roadmap — song skill fields', () => {
  it('returns is_song=true and song_artist for a song skill', async () => {
    setupMocks([
      makeSkillEntry({
        phase: 1,
        skillId: 's-wonder',
        skillKey: 'song_wonderwall',
        skillTitle: 'Wonderwall',
        isSong: true,
        songArtist: 'Oasis',
      }),
    ]);

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    const skill = res.body.phases[0].skills[0];
    expect(skill.is_song).toBe(true);
    expect(skill.song_artist).toBe('Oasis');
  });

  it('returns is_song=false and song_artist=null for a non-song skill', async () => {
    setupMocks([
      makeSkillEntry({
        phase: 1,
        skillId: 's-em',
        skillKey: 'em_chord',
        skillTitle: 'Em Chord',
        isSong: false,
        songArtist: null,
      }),
    ]);

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    const skill = res.body.phases[0].skills[0];
    expect(skill.is_song).toBe(false);
    expect(skill.song_artist).toBeNull();
  });

  it('phase with mixed song and non-song skills returns both correctly', async () => {
    setupMocks([
      makeSkillEntry({
        phase: 1,
        skillId: 's-em',
        skillKey: 'em_chord',
        skillTitle: 'Em Chord',
        isSong: false,
      }),
      makeSkillEntry({
        phase: 1,
        skillId: 's-wonder',
        skillKey: 'song_wonderwall',
        skillTitle: 'Wonderwall',
        isSong: true,
        songArtist: 'Oasis',
      }),
    ]);

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);

    const skills = res.body.phases[0].skills as Array<{
      skill_key: string;
      is_song: boolean;
      song_artist: string | null;
    }>;

    const techSkill = skills.find((s) => s.skill_key === 'em_chord');
    const songSkill = skills.find((s) => s.skill_key === 'song_wonderwall');

    expect(techSkill?.is_song).toBe(false);
    expect(techSkill?.song_artist).toBeNull();
    expect(songSkill?.is_song).toBe(true);
    expect(songSkill?.song_artist).toBe('Oasis');
  });

  it('defaults is_song to false when field missing from DB (backward compat)', async () => {
    // Simulate old DB row without is_song field
    const entryWithoutIsSong = {
      phase_number: 1,
      phase_title: 'Phase 1',
      sort_order: 0,
      practice_tip: null,
      common_mistake: null,
      practice_exercise: null,
      video_youtube_id: null,
      video_title: null,
      skills: { id: 's-old', key: 'old_skill', title: 'Old Skill', category: 'chord' },
    };
    setupMocks([entryWithoutIsSong]);

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    const skill = res.body.phases[0].skills[0];
    expect(skill.is_song).toBe(false);
    expect(skill.song_artist).toBeNull();
  });
});
