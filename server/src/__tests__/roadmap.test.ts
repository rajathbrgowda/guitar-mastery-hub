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

/**
 * Build a supabase query chain that resolves with `resolved` at the end.
 * Supports: .select().eq().eq()...single() / .select().eq().eq()...order()
 */
function makeChain(resolved: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(resolved);
  const limit = vi.fn().mockResolvedValue(resolved);
  const not = vi.fn().mockResolvedValue(resolved);
  const orderFn = vi.fn().mockReturnValue({ limit, single });
  const eq: ReturnType<typeof vi.fn> = vi.fn();
  eq.mockReturnValue({ eq, single, order: orderFn, not });
  const select = vi.fn().mockReturnValue({ eq, single, order: orderFn });
  return { select, single, eq, order: orderFn, limit };
}

describe('GET /api/roadmap', () => {
  it('returns phases array with correct shape', async () => {
    let callCount = 0;

    mockFrom.mockImplementation(() => {
      callCount++;

      if (callCount === 1) {
        // users table
        return makeChain({
          data: { current_phase: 1, selected_curriculum_key: 'best_of_all' },
          error: null,
        }) as never;
      }

      if (callCount === 2) {
        // curriculum_sources table (with name for v2)
        return makeChain({ data: { id: 'cs-uuid', name: 'Best of All' }, error: null }) as never;
      }

      if (callCount === 3) {
        // curriculum_skill_entries with skills join — supports .order().order()
        const entriesData = {
          data: [
            {
              phase_number: 1,
              phase_title: 'Grade 1',
              sort_order: 0,
              practice_tip: 'Practice slowly',
              video_youtube_id: null,
              skills: {
                id: 'skill-1',
                key: 'em_chord',
                title: 'Em Chord',
                category: 'chord',
              },
            },
          ],
          error: null,
        };
        const order2 = vi.fn().mockResolvedValue(entriesData);
        const order1 = vi.fn().mockReturnValue({ order: order2 });
        const eq: ReturnType<typeof vi.fn> = vi.fn();
        eq.mockReturnValue({ eq, order: order1 });
        const select = vi.fn().mockReturnValue({ eq });
        return { select } as never;
      }

      if (callCount === 4) {
        // skill_progress (with completed_at)
        return makeChain({
          data: [
            {
              skill_id: 'skill-1',
              completed: true,
              confidence: 3,
              completed_at: '2026-03-10T00:00:00Z',
            },
          ],
          error: null,
        }) as never;
      }

      if (callCount === 5) {
        // practice_sessions
        const orderFn = vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        });
        const eq: ReturnType<typeof vi.fn> = vi.fn();
        eq.mockReturnValue({ order: orderFn });
        const select = vi.fn().mockReturnValue({ eq });
        return { select } as never;
      }

      if (callCount === 6) {
        // skill_progress for skills_per_week (recentCompletions)
        const notFn = vi.fn().mockResolvedValue({
          data: [{ completed_at: '2026-03-10T00:00:00Z' }],
          error: null,
        });
        const eq: ReturnType<typeof vi.fn> = vi.fn();
        eq.mockReturnValue({ eq, not: notFn });
        const select = vi.fn().mockReturnValue({ eq });
        return { select } as never;
      }

      // fallback
      return makeChain({ data: null, error: null }) as never;
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.phases).toBeDefined();
    expect(Array.isArray(res.body.phases)).toBe(true);
    expect(res.body.current_phase).toBe(1);
    expect(res.body.curriculum_key).toBe('best_of_all');
    // v2 fields
    expect(res.body.curriculum_name).toBeDefined();
    expect(res.body).toHaveProperty('skills_per_week');
    if (res.body.phases.length > 0) {
      const phase = res.body.phases[0];
      expect(phase).toHaveProperty('phase_title');
      expect(phase).toHaveProperty('started_at');
      expect(phase).toHaveProperty('completed_at');
      expect(phase).toHaveProperty('focus_skill');
    }
  });

  it('returns 404 when user not found', async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }) as never);

    const res = await request(app).get('/api/roadmap').set(AUTH);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });
});

describe('PATCH /api/roadmap/skill/:key/confidence', () => {
  it('returns 200 with valid confidence body', async () => {
    let callCount = 0;

    mockFrom.mockImplementation(() => {
      callCount++;

      if (callCount === 1) {
        // users table
        return makeChain({
          data: { selected_curriculum_key: 'best_of_all' },
          error: null,
        }) as never;
      }

      if (callCount === 2) {
        // skills table
        return makeChain({ data: { id: 'skill-uuid' }, error: null }) as never;
      }

      if (callCount === 3) {
        // skill_progress select existing
        return makeChain({
          data: { id: 'sp-uuid', phase_index: 0, skill_index: 0 },
          error: null,
        }) as never;
      }

      if (callCount === 4) {
        // skill_progress update
        const eq = vi.fn().mockResolvedValue({ data: null, error: null });
        const update = vi.fn().mockReturnValue({ eq });
        return { update } as never;
      }

      return makeChain({ data: null, error: null }) as never;
    });

    const res = await request(app)
      .patch('/api/roadmap/skill/em_chord/confidence')
      .set(AUTH)
      .send({ confidence: 2 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 when confidence is out of range (5)', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        const single = vi
          .fn()
          .mockResolvedValue({ data: { selected_curriculum_key: 'best_of_all' }, error: null });
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
        } as never;
      }
      if (table === 'skills') {
        const single = vi.fn().mockResolvedValue({ data: { id: 'skill-uuid' }, error: null });
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
        } as never;
      }
      return {
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null }) }),
      } as never;
    });
    const res = await request(app)
      .patch('/api/roadmap/skill/em_chord/confidence')
      .set(AUTH)
      .send({ confidence: 5 });

    expect(res.status).toBe(400);
  });

  it('returns 400 when confidence is missing', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        const single = vi
          .fn()
          .mockResolvedValue({ data: { selected_curriculum_key: 'best_of_all' }, error: null });
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
        } as never;
      }
      if (table === 'skills') {
        const single = vi.fn().mockResolvedValue({ data: { id: 'skill-uuid' }, error: null });
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
        } as never;
      }
      return {
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null }) }),
      } as never;
    });
    const res = await request(app)
      .patch('/api/roadmap/skill/em_chord/confidence')
      .set(AUTH)
      .send({});

    expect(res.status).toBe(400);
  });
});
