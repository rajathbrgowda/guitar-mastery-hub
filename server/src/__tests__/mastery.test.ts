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
    data: { user: { id: 'user-123', email: 'test@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
});

// ── helpers ───────────────────────────────────────────────────────────────────

/** Mock the 5-query chain for GET /api/mastery/map */
function mockMapRoute(
  opts: {
    curriculumKey?: string;
    entries?: object[];
    progress?: object[];
    planDays?: object[];
  } = {},
) {
  const { curriculumKey = 'best_of_all', entries = [], progress = [], planDays = [] } = opts;

  // Call 1: users.select('selected_curriculum_key')
  const single1 = vi
    .fn()
    .mockResolvedValue({ data: { selected_curriculum_key: curriculumKey }, error: null });
  const eq1 = vi.fn().mockReturnValue({ single: single1 });
  const select1 = vi.fn().mockReturnValue({ eq: eq1 });

  // Call 2: curriculum_sources.select('id')
  const single2 = vi.fn().mockResolvedValue({ data: { id: 'source-uuid' }, error: null });
  const eq2b = vi.fn().mockReturnValue({ single: single2 });
  const eq2a = vi.fn().mockReturnValue({ eq: eq2b });
  const select2 = vi.fn().mockReturnValue({ eq: eq2a });

  // Call 3: curriculum_skill_entries
  const order3b = vi.fn().mockResolvedValue({ data: entries, error: null });
  const order3a = vi.fn().mockReturnValue({ order: order3b });
  const eq3 = vi.fn().mockReturnValue({ order: order3a });
  const select3 = vi.fn().mockReturnValue({ eq: eq3 });

  // Call 4: skill_progress
  const eq4b = vi.fn().mockResolvedValue({ data: progress, error: null });
  const eq4a = vi.fn().mockReturnValue({ eq: eq4b });
  const select4 = vi.fn().mockReturnValue({ eq: eq4a });

  // Call 5: practice_plan_days
  const limit5 = vi.fn().mockResolvedValue({ data: planDays, error: null });
  const order5 = vi.fn().mockReturnValue({ limit: limit5 });
  const gte5 = vi.fn().mockReturnValue({ order: order5 });
  const eq5b = vi.fn().mockReturnValue({ gte: gte5 });
  const eq5a = vi.fn().mockReturnValue({ eq: eq5b });
  const select5 = vi.fn().mockReturnValue({ eq: eq5a });

  mockFrom
    .mockReturnValueOnce({ select: select1 } as never)
    .mockReturnValueOnce({ select: select2 } as never)
    .mockReturnValueOnce({ select: select3 } as never)
    .mockReturnValueOnce({ select: select4 } as never)
    .mockReturnValueOnce({ select: select5 } as never);
}

/** Mock the 3-query chain for POST /api/mastery/rusty-check */
function mockRustyCheckRoute(rustyIds: string[] = []) {
  // Call 1: users curriculum key
  const single1 = vi
    .fn()
    .mockResolvedValue({ data: { selected_curriculum_key: 'best_of_all' }, error: null });
  const eq1 = vi.fn().mockReturnValue({ single: single1 });
  const select1 = vi.fn().mockReturnValue({ eq: eq1 });

  // Call 2: skill_progress.select('id') with filters
  const lt2 = vi.fn().mockResolvedValue({ data: rustyIds.map((id) => ({ id })), error: null });
  const eq2d = vi.fn().mockReturnValue({ lt: lt2 });
  const eq2c = vi.fn().mockReturnValue({ eq: eq2d });
  const eq2b = vi.fn().mockReturnValue({ eq: eq2c });
  const eq2a = vi.fn().mockReturnValue({ eq: eq2b });
  const select2 = vi.fn().mockReturnValue({ eq: eq2a });

  // Call 3: skill_progress.update().in() — only when rustyIds.length > 0
  const inFn = vi.fn().mockResolvedValue({ error: null });
  const update3 = vi.fn().mockReturnValue({ in: inFn });

  if (rustyIds.length > 0) {
    mockFrom
      .mockReturnValueOnce({ select: select1 } as never)
      .mockReturnValueOnce({ select: select2 } as never)
      .mockReturnValueOnce({ update: update3 } as never);
  } else {
    mockFrom
      .mockReturnValueOnce({ select: select1 } as never)
      .mockReturnValueOnce({ select: select2 } as never);
  }
}

// ── GET /api/mastery/map ──────────────────────────────────────────────────────

describe('GET /api/mastery/map', () => {
  it('returns empty phases when no skill entries exist', async () => {
    mockMapRoute({ entries: [] });

    const res = await request(app).get('/api/mastery/map').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ phases: [], rusty_count: 0 });
  });

  it('returns phases with not_started nodes when no progress', async () => {
    mockMapRoute({
      entries: [
        {
          skill_id: 'skill-uuid-1',
          phase_number: 1,
          phase_title: 'Foundations',
          sort_order: 1,
          video_youtube_id: null,
          practice_tip: null,
          skills: [{ key: 'open_chords', title: 'Open Chords' }],
        },
      ],
      progress: [],
    });

    const res = await request(app).get('/api/mastery/map').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.phases).toHaveLength(1);
    expect(res.body.phases[0].phase_title).toBe('Foundations');
    expect(res.body.phases[0].nodes[0]).toMatchObject({
      skill_key: 'open_chords',
      title: 'Open Chords',
      mastery_state: 'not_started',
      phase_index: 0,
      skill_index: 0,
    });
    expect(res.body.rusty_count).toBe(0);
  });

  it('marks node as mastered when completed recently', async () => {
    const recentDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days ago

    mockMapRoute({
      entries: [
        {
          skill_id: 'skill-uuid-1',
          phase_number: 1,
          phase_title: 'Foundations',
          sort_order: 1,
          video_youtube_id: null,
          practice_tip: null,
          skills: [{ key: 'open_chords', title: 'Open Chords' }],
        },
      ],
      progress: [
        {
          phase_index: 0,
          skill_index: 0,
          completed: true,
          completed_at: recentDate,
          last_practiced_at: recentDate,
          mastery_state: 'mastered',
        },
      ],
    });

    const res = await request(app).get('/api/mastery/map').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.phases[0].nodes[0].mastery_state).toBe('mastered');
    expect(res.body.rusty_count).toBe(0);
  });

  it('marks node as rusty when completed > 21 days ago', async () => {
    const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago

    mockMapRoute({
      entries: [
        {
          skill_id: 'skill-uuid-1',
          phase_number: 1,
          phase_title: 'Foundations',
          sort_order: 1,
          video_youtube_id: null,
          practice_tip: null,
          skills: [{ key: 'open_chords', title: 'Open Chords' }],
        },
      ],
      progress: [
        {
          phase_index: 0,
          skill_index: 0,
          completed: true,
          completed_at: oldDate,
          last_practiced_at: oldDate,
          mastery_state: 'mastered',
        },
      ],
    });

    const res = await request(app).get('/api/mastery/map').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.phases[0].nodes[0].mastery_state).toBe('rusty');
    expect(res.body.rusty_count).toBe(1);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/mastery/map');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/mastery/rusty-check ─────────────────────────────────────────────

describe('POST /api/mastery/rusty-check', () => {
  it('returns updated_count 0 when no rusty skills found', async () => {
    mockRustyCheckRoute([]);

    const res = await request(app).post('/api/mastery/rusty-check').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ updated_count: 0 });
  });

  it('returns updated_count matching number of rusty rows updated', async () => {
    mockRustyCheckRoute(['id-1', 'id-2', 'id-3']);

    const res = await request(app).post('/api/mastery/rusty-check').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ updated_count: 3 });
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/mastery/rusty-check');
    expect(res.status).toBe(401);
  });
});
