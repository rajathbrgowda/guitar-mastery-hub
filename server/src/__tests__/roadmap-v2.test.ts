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
    data: { user: { id: 'user-v2', email: 'v2@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockUser(data: object) {
  const single = vi.fn().mockResolvedValue({ data, error: null });
  return {
    select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
  };
}

function mockCurriculum(id: string, name: string) {
  const single = vi.fn().mockResolvedValue({ data: { id, name }, error: null });
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
    }),
  };
}

function mockEntries(entries: object[]) {
  const order2 = vi.fn().mockResolvedValue({ data: entries, error: null });
  const order1 = vi.fn().mockReturnValue({ order: order2 });
  const eq: ReturnType<typeof vi.fn> = vi.fn();
  eq.mockReturnValue({ eq, order: order1 });
  return { select: vi.fn().mockReturnValue({ eq }) };
}

function mockProgress(rows: object[]) {
  const eq: ReturnType<typeof vi.fn> = vi.fn();
  eq.mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: rows, error: null }) });
  return { select: vi.fn().mockReturnValue({ eq }) };
}

function mockSessions(sessions: object[]) {
  const limit = vi.fn().mockResolvedValue({ data: sessions, error: null });
  const order = vi.fn().mockReturnValue({ limit });
  const eq: ReturnType<typeof vi.fn> = vi.fn();
  eq.mockReturnValue({ order });
  return { select: vi.fn().mockReturnValue({ eq }) };
}

function mockRecentCompletions(rows: object[]) {
  const notFn = vi.fn().mockResolvedValue({ data: rows, error: null });
  const eq: ReturnType<typeof vi.fn> = vi.fn();
  eq.mockReturnValue({ eq, not: notFn });
  return { select: vi.fn().mockReturnValue({ eq }) };
}

// ── Standard v2 mock setup ───────────────────────────────────────────────────

interface V2MockOpts {
  user?: object;
  curriculum?: { id: string; name: string };
  entries?: object[];
  progress?: object[];
  sessions?: object[];
  recentCompletions?: object[];
}

function setupV2Mocks(opts: V2MockOpts = {}) {
  const {
    user = { current_phase: 1, selected_curriculum_key: 'justinguitar' },
    curriculum = { id: 'cur-1', name: 'JustinGuitar' },
    entries = [],
    progress = [],
    sessions = [],
    recentCompletions = [],
  } = opts;

  let callCount = 0;
  mockFrom.mockImplementation((table: string) => {
    callCount++;
    if (table === 'users') return mockUser(user) as never;
    if (table === 'curriculum_sources')
      return mockCurriculum(curriculum.id, curriculum.name) as never;
    if (table === 'curriculum_skill_entries') return mockEntries(entries) as never;
    if (table === 'skill_progress') {
      // First call = main progress, second call = recentCompletions
      if (callCount <= 4) return mockProgress(progress) as never;
      return mockRecentCompletions(recentCompletions) as never;
    }
    if (table === 'practice_sessions') return mockSessions(sessions) as never;
    return {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null }) }),
    } as never;
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/roadmap — v2 fields', () => {
  it('returns curriculum_name from curriculum_sources', async () => {
    setupV2Mocks({
      curriculum: { id: 'cur-jg', name: 'JustinGuitar Beginner' },
      entries: [
        {
          phase_number: 1,
          phase_title: 'Grade 1',
          sort_order: 0,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's1', key: 'em_chord', title: 'Em Chord', category: 'chord' },
        },
      ],
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.curriculum_name).toBe('JustinGuitar Beginner');
  });

  it('returns phase_title from curriculum_skill_entries', async () => {
    setupV2Mocks({
      entries: [
        {
          phase_number: 1,
          phase_title: 'Grade 1: Your First Guitar Lessons',
          sort_order: 0,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's1', key: 'em_chord', title: 'Em Chord', category: 'chord' },
        },
      ],
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.phases[0].phase_title).toBe('Grade 1: Your First Guitar Lessons');
  });

  it('completed phase has both started_at and completed_at', async () => {
    setupV2Mocks({
      entries: [
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 0,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's1', key: 'em_chord', title: 'Em Chord', category: 'chord' },
        },
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 1,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's2', key: 'am_chord', title: 'Am Chord', category: 'chord' },
        },
      ],
      progress: [
        { skill_id: 's1', completed: true, confidence: 3, completed_at: '2026-03-01T10:00:00Z' },
        { skill_id: 's2', completed: true, confidence: 2, completed_at: '2026-03-05T10:00:00Z' },
      ],
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);

    const phase = res.body.phases[0];
    expect(phase.started_at).toBe('2026-03-01T10:00:00Z');
    expect(phase.completed_at).toBe('2026-03-05T10:00:00Z');
  });

  it('partially completed phase has started_at but not completed_at', async () => {
    setupV2Mocks({
      entries: [
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 0,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's1', key: 'em_chord', title: 'Em Chord', category: 'chord' },
        },
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 1,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's2', key: 'am_chord', title: 'Am Chord', category: 'chord' },
        },
      ],
      progress: [
        { skill_id: 's1', completed: true, confidence: 3, completed_at: '2026-03-01T10:00:00Z' },
        { skill_id: 's2', completed: false, confidence: null, completed_at: null },
      ],
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    const phase = res.body.phases[0];
    expect(phase.started_at).toBe('2026-03-01T10:00:00Z');
    expect(phase.completed_at).toBeNull();
  });

  it('focus_skill returns Hard-confidence skill over Okay-confidence', async () => {
    setupV2Mocks({
      entries: [
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 0,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's1', key: 'em_chord', title: 'Em Chord', category: 'chord' },
        },
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 1,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's2', key: 'am_chord', title: 'Am Chord', category: 'chord' },
        },
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 2,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's3', key: 'dm_chord', title: 'Dm Chord', category: 'chord' },
        },
      ],
      progress: [
        { skill_id: 's1', completed: false, confidence: 2, completed_at: null }, // Okay
        { skill_id: 's2', completed: false, confidence: 1, completed_at: null }, // Hard
        { skill_id: 's3', completed: false, confidence: null, completed_at: null }, // No rating
      ],
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.body.phases[0].focus_skill).not.toBeNull();
    expect(res.body.phases[0].focus_skill.skill_key).toBe('am_chord'); // confidence=1 (Hard)
  });

  it('focus_skill returns first incomplete when no confidence data', async () => {
    setupV2Mocks({
      entries: [
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 0,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's1', key: 'em_chord', title: 'Em Chord', category: 'chord' },
        },
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 1,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's2', key: 'am_chord', title: 'Am Chord', category: 'chord' },
        },
      ],
      progress: [
        { skill_id: 's1', completed: false, confidence: null, completed_at: null },
        { skill_id: 's2', completed: false, confidence: null, completed_at: null },
      ],
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.body.phases[0].focus_skill.skill_key).toBe('em_chord');
  });

  it('focus_skill is null when all skills in current phase are completed', async () => {
    setupV2Mocks({
      entries: [
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 0,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's1', key: 'em_chord', title: 'Em Chord', category: 'chord' },
        },
      ],
      progress: [
        { skill_id: 's1', completed: true, confidence: 3, completed_at: '2026-03-01T00:00:00Z' },
      ],
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.body.phases[0].focus_skill).toBeNull();
  });

  it('skills_per_week is null for new user with no completions', async () => {
    setupV2Mocks({
      entries: [
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 0,
          practice_tip: null,
          video_youtube_id: null,
          skills: { id: 's1', key: 'em_chord', title: 'Em Chord', category: 'chord' },
        },
      ],
      progress: [],
      recentCompletions: [],
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.body.skills_per_week).toBeNull();
  });

  it('new user with 0 progress: all skills incomplete, no crash', async () => {
    setupV2Mocks({
      entries: [
        {
          phase_number: 1,
          phase_title: 'Phase 1',
          sort_order: 0,
          practice_tip: 'Try slowly',
          video_youtube_id: 'abc123',
          skills: { id: 's1', key: 'em_chord', title: 'Em Chord', category: 'chord' },
        },
      ],
      progress: [],
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.phases[0].skills[0].completed).toBe(false);
    expect(res.body.phases[0].skills[0].confidence).toBeNull();
    expect(res.body.phases[0].started_at).toBeNull();
    expect(res.body.phases[0].completed_at).toBeNull();
  });

  it('empty curriculum (0 entries): returns empty phases array', async () => {
    setupV2Mocks({ entries: [] });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.phases).toEqual([]);
    expect(res.body.skills_per_week).toBeNull();
  });
});
