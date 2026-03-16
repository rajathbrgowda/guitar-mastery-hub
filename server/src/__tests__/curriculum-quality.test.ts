/**
 * curriculum-quality.test.ts
 *
 * Curriculum data quality threshold tests (CARD-413).
 * Verifies:
 *   - GET /api/roadmap returns video IDs that are null or exactly 11 characters
 *   - Every skill in the response has a phase_title
 *   - practice_tip is passed through when present in DB
 *   - A 50-entry curriculum groups into correct phases, each with >= 5 skills
 *   - A 40-entry curriculum groups correctly across 4–5 phases
 *   - Curricula with < 5 skills per phase still respond 200 (no 500 crash)
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
    data: { user: { id: 'user-q', email: 'quality@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeEntry(opts: {
  phase: number;
  phaseTitle: string;
  sortOrder: number;
  skillId: string;
  skillKey: string;
  skillTitle: string;
  practiceTip?: string | null;
  videoId?: string | null;
}) {
  return {
    phase_number: opts.phase,
    phase_title: opts.phaseTitle,
    sort_order: opts.sortOrder,
    practice_tip: opts.practiceTip ?? null,
    video_youtube_id: opts.videoId ?? null,
    skills: {
      id: opts.skillId,
      key: opts.skillKey,
      title: opts.skillTitle,
      category: 'chord',
    },
  };
}

/** Generate `count` entries spread evenly across `phases` phases */
function makeEntries(count: number, phases: number, phasePrefix: string): object[] {
  const entries: object[] = [];
  const perPhase = Math.ceil(count / phases);
  let n = 0;
  for (let p = 1; p <= phases; p++) {
    for (let i = 0; i < perPhase && n < count; i++, n++) {
      entries.push(
        makeEntry({
          phase: p,
          phaseTitle: `${phasePrefix} ${p}`,
          sortOrder: i,
          skillId: `s-${p}-${i}`,
          skillKey: `skill_${p}_${i}`,
          skillTitle: `Skill ${p}-${i}`,
          practiceTip: `Practice tip for skill ${p}-${i}`,
          videoId: null,
        }),
      );
    }
  }
  return entries;
}

function setupMocks(entries: object[], curriculumName = 'Test Curriculum') {
  let callCount = 0;
  mockFrom.mockImplementation((table: string) => {
    callCount++;
    if (table === 'users') {
      const single = vi.fn().mockResolvedValue({
        data: { current_phase: 1, selected_curriculum_key: 'best_of_all' },
        error: null,
      });
      return {
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
      } as never;
    }
    if (table === 'curriculum_sources') {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'cur-test', name: curriculumName },
        error: null,
      });
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
        }),
      } as never;
    }
    if (table === 'curriculum_skill_entries') {
      const order2 = vi.fn().mockResolvedValue({ data: entries, error: null });
      const order1 = vi.fn().mockReturnValue({ order: order2 });
      const eq: ReturnType<typeof vi.fn> = vi.fn();
      eq.mockReturnValue({ eq, order: order1 });
      return { select: vi.fn().mockReturnValue({ eq }) } as never;
    }
    if (table === 'skill_progress') {
      const eq: ReturnType<typeof vi.fn> = vi.fn();
      if (callCount <= 4) {
        eq.mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) });
        return { select: vi.fn().mockReturnValue({ eq }) } as never;
      }
      // recentCompletions
      const notFn = vi.fn().mockResolvedValue({ data: [], error: null });
      eq.mockReturnValue({ eq, not: notFn });
      return { select: vi.fn().mockReturnValue({ eq }) } as never;
    }
    if (table === 'practice_sessions') {
      const limit = vi.fn().mockResolvedValue({ data: [], error: null });
      const order = vi.fn().mockReturnValue({ limit });
      const eq: ReturnType<typeof vi.fn> = vi.fn();
      eq.mockReturnValue({ order });
      return { select: vi.fn().mockReturnValue({ eq }) } as never;
    }
    return {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null }) }),
    } as never;
  });
}

// ── Video ID quality ──────────────────────────────────────────────────────────

describe('Curriculum quality — video IDs', () => {
  it('video IDs in response are null or exactly 11 characters', async () => {
    const entries = [
      makeEntry({
        phase: 1,
        phaseTitle: 'Phase 1',
        sortOrder: 0,
        skillId: 's1',
        skillKey: 'chord_em',
        skillTitle: 'Em Chord',
        videoId: 'cHRFCNNrPKs', // 11 chars — valid
      }),
      makeEntry({
        phase: 1,
        phaseTitle: 'Phase 1',
        sortOrder: 1,
        skillId: 's2',
        skillKey: 'chord_am',
        skillTitle: 'Am Chord',
        videoId: null, // null — valid
      }),
      makeEntry({
        phase: 1,
        phaseTitle: 'Phase 1',
        sortOrder: 2,
        skillId: 's3',
        skillKey: 'chord_d',
        skillTitle: 'D Chord',
        videoId: 'tbM1LHzFhBQ', // 11 chars — valid
      }),
    ];
    setupMocks(entries);

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);

    const skills: Array<{ video_youtube_id: string | null }> = res.body.phases.flatMap(
      (p: { skills: Array<{ video_youtube_id: string | null }> }) => p.skills,
    );
    for (const skill of skills) {
      if (skill.video_youtube_id !== null) {
        expect(
          typeof skill.video_youtube_id === 'string' && skill.video_youtube_id.length === 11,
          `Expected 11-char video ID but got "${skill.video_youtube_id}"`,
        ).toBe(true);
      }
    }
  });

  it('does not crash when all video IDs are null', async () => {
    const entries = [1, 2, 3].map((i) =>
      makeEntry({
        phase: 1,
        phaseTitle: 'Phase 1',
        sortOrder: i - 1,
        skillId: `s${i}`,
        skillKey: `skill_${i}`,
        skillTitle: `Skill ${i}`,
        videoId: null,
      }),
    );
    setupMocks(entries);

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
  });
});

// ── phase_title quality ───────────────────────────────────────────────────────

describe('Curriculum quality — phase_title', () => {
  it('every phase in response has a non-empty phase_title', async () => {
    const entries = [
      makeEntry({
        phase: 1,
        phaseTitle: 'Grade 1: Foundations',
        sortOrder: 0,
        skillId: 's1',
        skillKey: 'chord_em',
        skillTitle: 'Em',
      }),
      makeEntry({
        phase: 2,
        phaseTitle: 'Grade 2: Building',
        sortOrder: 0,
        skillId: 's2',
        skillKey: 'chord_am',
        skillTitle: 'Am',
      }),
      makeEntry({
        phase: 3,
        phaseTitle: 'Grade 3: Barre Chords',
        sortOrder: 0,
        skillId: 's3',
        skillKey: 'chord_f',
        skillTitle: 'F',
      }),
    ];
    setupMocks(entries);

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    for (const phase of res.body.phases) {
      expect(typeof phase.phase_title).toBe('string');
      expect(phase.phase_title.length).toBeGreaterThan(0);
    }
  });
});

// ── practice_tip passthrough ──────────────────────────────────────────────────

describe('Curriculum quality — practice_tip', () => {
  it('practice_tip is passed through to skill response when present', async () => {
    const entries = [
      makeEntry({
        phase: 1,
        phaseTitle: 'Phase 1',
        sortOrder: 0,
        skillId: 's1',
        skillKey: 'chord_em',
        skillTitle: 'Em Chord',
        practiceTip: 'Keep fingers arched to avoid muting open strings.',
      }),
    ];
    setupMocks(entries);

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);

    const skill = res.body.phases[0]?.skills[0];
    expect(skill).toBeDefined();
    expect(skill.practice_tip).toBe('Keep fingers arched to avoid muting open strings.');
  });

  it('practice_tip null is handled gracefully (no crash)', async () => {
    const entries = [
      makeEntry({
        phase: 1,
        phaseTitle: 'Phase 1',
        sortOrder: 0,
        skillId: 's1',
        skillKey: 'chord_em',
        skillTitle: 'Em Chord',
        practiceTip: null,
      }),
    ];
    setupMocks(entries);

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.phases[0].skills[0].practice_tip).toBeNull();
  });
});

// ── Phase grouping for 50-entry curriculum (JustinGuitar target) ──────────────

describe('Curriculum quality — 50-entry JustinGuitar grouping', () => {
  it('50 entries across 5 phases groups into 5 phases with 10 skills each', async () => {
    const entries = makeEntries(50, 5, 'Grade');
    setupMocks(entries, 'JustinGuitar');

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.curriculum_name).toBe('JustinGuitar');
    expect(res.body.phases.length).toBe(5);
    for (const phase of res.body.phases) {
      expect(phase.skills.length).toBe(10);
      expect(phase.skills.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('total skill count across all phases matches entry count', async () => {
    const entries = makeEntries(50, 5, 'Grade');
    setupMocks(entries, 'JustinGuitar');

    const res = await request(app).get('/api/roadmap').set(AUTH);
    const totalSkills = res.body.phases.reduce(
      (sum: number, p: { skills: unknown[] }) => sum + p.skills.length,
      0,
    );
    expect(totalSkills).toBe(50);
  });
});

// ── Phase grouping for 40-entry curriculum (Marty Music / Best of All target) ─

describe('Curriculum quality — 40-entry curriculum grouping', () => {
  it('40 entries across 5 phases groups correctly', async () => {
    const entries = makeEntries(40, 5, 'Phase');
    setupMocks(entries, 'Marty Music');

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.phases.length).toBe(5);
    for (const phase of res.body.phases) {
      expect(phase.skills.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('total skill count matches 40', async () => {
    const entries = makeEntries(40, 5, 'Phase');
    setupMocks(entries, 'Marty Music');

    const res = await request(app).get('/api/roadmap').set(AUTH);
    const totalSkills = res.body.phases.reduce(
      (sum: number, p: { skills: unknown[] }) => sum + p.skills.length,
      0,
    );
    expect(totalSkills).toBe(40);
  });
});

// ── Edge: small curriculum (<5 skills per phase) does not crash ───────────────

describe('Curriculum quality — small phase handling', () => {
  it('phase with only 1 skill responds 200 without crash', async () => {
    const entries = [
      makeEntry({
        phase: 1,
        phaseTitle: 'Phase 1',
        sortOrder: 0,
        skillId: 's1',
        skillKey: 'chord_em',
        skillTitle: 'Em',
      }),
    ];
    setupMocks(entries);

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.phases[0].skills.length).toBe(1);
  });

  it('multiple small phases each respond correctly', async () => {
    const entries = [
      makeEntry({
        phase: 1,
        phaseTitle: 'Phase 1',
        sortOrder: 0,
        skillId: 's1',
        skillKey: 'chord_em',
        skillTitle: 'Em',
      }),
      makeEntry({
        phase: 2,
        phaseTitle: 'Phase 2',
        sortOrder: 0,
        skillId: 's2',
        skillKey: 'chord_am',
        skillTitle: 'Am',
      }),
      makeEntry({
        phase: 3,
        phaseTitle: 'Phase 3',
        sortOrder: 0,
        skillId: 's3',
        skillKey: 'chord_d',
        skillTitle: 'D',
      }),
    ];
    setupMocks(entries);

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.phases.length).toBe(3);
    for (const phase of res.body.phases) {
      expect(phase.skills.length).toBeGreaterThanOrEqual(1);
    }
  });
});

// ── Curriculum name passthrough for all 3 curricula ──────────────────────────

describe('Curriculum quality — curriculum_name for all three curricula', () => {
  const curricula = [
    { name: 'JustinGuitar', key: 'justinguitar' },
    { name: 'Marty Music', key: 'marty_music' },
    { name: 'Best of All', key: 'best_of_all' },
  ];

  for (const { name } of curricula) {
    it(`returns correct curriculum_name for ${name}`, async () => {
      setupMocks(
        [
          makeEntry({
            phase: 1,
            phaseTitle: 'Phase 1',
            sortOrder: 0,
            skillId: 's1',
            skillKey: 'skill_x',
            skillTitle: 'Skill X',
          }),
        ],
        name,
      );

      const res = await request(app).get('/api/roadmap').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.curriculum_name).toBe(name);
    });
  }
});
