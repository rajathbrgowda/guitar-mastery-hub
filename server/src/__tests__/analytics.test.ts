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

beforeEach(() => {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-123', email: 'test@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
});

const AUTH = { Authorization: 'Bearer valid-token' };

// Builds a supabase query chain mock that terminates with a resolved value.
// eq() returns itself so it can be chained multiple times: .eq(x).eq(y).
function mockChain(resolved: { data: unknown; error: null | { message: string } }) {
  const terminal = vi.fn().mockResolvedValue(resolved);
  const single = vi.fn().mockResolvedValue(resolved);
  const order = vi.fn().mockResolvedValue(resolved);
  const gte = vi.fn().mockReturnValue({ order, lte: vi.fn().mockReturnValue({ order }) });
  const lte = vi.fn().mockReturnValue({ order });
  // eq is self-referential so .eq(a).eq(b) works
  const eq: ReturnType<typeof vi.fn> = vi.fn();
  eq.mockReturnValue({ order, gte, lte, single, eq });
  const select = vi.fn().mockReturnValue({ eq, single: terminal });
  return { select, _order: order };
}

describe('GET /api/analytics/skills', () => {
  it('returns skills array and by_category when data exists', async () => {
    // First from() call: daily_practice_plans → returns plan IDs
    const plansChain = (() => {
      const gte = vi.fn().mockResolvedValue({ data: [{ id: 'plan-1' }], error: null });
      const eq: ReturnType<typeof vi.fn> = vi.fn();
      eq.mockReturnValue({ gte, eq });
      const select = vi.fn().mockReturnValue({ eq });
      return { select };
    })();

    // Second from() call: daily_practice_plan_items → returns completed items
    const itemsChain = (() => {
      const not = vi.fn().mockResolvedValue({
        data: [
          {
            skill_id: 'skill-abc',
            skill_title: 'Barre Chords',
            skill_category: 'chords',
            actual_duration_min: 20,
            confidence_rating: 3,
            completed_at: '2026-03-14T10:00:00Z',
            skills: { key: 'barre_chords' },
          },
        ],
        error: null,
      });
      const inFn = vi.fn().mockReturnValue({ not });
      const select = vi.fn().mockReturnValue({ in: inFn });
      return { select };
    })();

    mockFrom.mockReturnValueOnce(plansChain as never).mockReturnValueOnce(itemsChain as never);

    const res = await request(app).get('/api/analytics/skills').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('skills');
    expect(res.body).toHaveProperty('by_category');
    expect(Array.isArray(res.body.skills)).toBe(true);
    expect(res.body.skills).toHaveLength(1);
    expect(res.body.skills[0].skill_title).toBe('Barre Chords');
    expect(res.body.by_category).toHaveProperty('chords');
  });

  it('returns empty skills and by_category when no plans in last 30 days', async () => {
    const plansChain = (() => {
      const gte = vi.fn().mockResolvedValue({ data: [], error: null });
      const eq: ReturnType<typeof vi.fn> = vi.fn();
      eq.mockReturnValue({ gte, eq });
      const select = vi.fn().mockReturnValue({ eq });
      return { select };
    })();

    mockFrom.mockReturnValueOnce(plansChain as never);

    const res = await request(app).get('/api/analytics/skills').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ skills: [], by_category: {} });
  });
});

describe('GET /api/analytics/heatmap', () => {
  it('returns 364 entries each with week and day_of_week fields', async () => {
    // from('practice_sessions').select(...).eq(...).gte(...).order(...)
    const heatmapChain = (() => {
      const order = vi.fn().mockResolvedValue({ data: [], error: null });
      const gte = vi.fn().mockReturnValue({ order });
      const eq: ReturnType<typeof vi.fn> = vi.fn();
      eq.mockReturnValue({ gte, eq });
      const select = vi.fn().mockReturnValue({ eq });
      return { select };
    })();

    mockFrom.mockReturnValueOnce(heatmapChain as never);

    const res = await request(app).get('/api/analytics/heatmap').set(AUTH);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(364);
    const first = res.body[0];
    expect(first).toHaveProperty('date');
    expect(first).toHaveProperty('duration_min');
    expect(first).toHaveProperty('week');
    expect(first).toHaveProperty('day_of_week');
    expect(typeof first.week).toBe('number');
    expect(typeof first.day_of_week).toBe('number');
  });
});

describe('GET /api/analytics/streak/detail', () => {
  it('returns current_streak, longest_streak, last_practiced, at_risk', async () => {
    const sessionsChain = (() => {
      const order = vi.fn().mockResolvedValue({
        data: [{ date: '2026-03-14' }, { date: '2026-03-13' }],
        error: null,
      });
      const eq: ReturnType<typeof vi.fn> = vi.fn();
      eq.mockReturnValue({ order, eq });
      const select = vi.fn().mockReturnValue({ eq });
      return { select };
    })();
    const usersChain = (() => {
      const single = vi.fn().mockResolvedValue({ data: { timezone: 'UTC' }, error: null });
      const eq: ReturnType<typeof vi.fn> = vi.fn();
      eq.mockReturnValue({ single, eq });
      const select = vi.fn().mockReturnValue({ eq });
      return { select };
    })();

    mockFrom.mockReturnValueOnce(sessionsChain as never).mockReturnValueOnce(usersChain as never);

    const res = await request(app).get('/api/analytics/streak/detail').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('current_streak');
    expect(res.body).toHaveProperty('longest_streak');
    expect(res.body).toHaveProperty('last_practiced');
    expect(res.body).toHaveProperty('at_risk');
    expect(typeof res.body.current_streak).toBe('number');
    expect(typeof res.body.longest_streak).toBe('number');
    expect(typeof res.body.at_risk).toBe('boolean');
  });
});

describe('GET /api/analytics/insights/cards', () => {
  it('returns cards array with type, title, body, value', async () => {
    const sessionsChain = (() => {
      const order = vi.fn().mockResolvedValue({
        data: [
          {
            date: '2026-03-14',
            duration_min: 30,
            sections: [{ name: 'Barre Chords' }],
          },
        ],
        error: null,
      });
      const gte = vi.fn().mockReturnValue({ order });
      const eq: ReturnType<typeof vi.fn> = vi.fn();
      eq.mockReturnValue({ gte, eq });
      const select = vi.fn().mockReturnValue({ eq });
      return { select };
    })();
    const usersChain = (() => {
      const single = vi.fn().mockResolvedValue({ data: { timezone: 'UTC' }, error: null });
      const eq: ReturnType<typeof vi.fn> = vi.fn();
      eq.mockReturnValue({ single, eq });
      const select = vi.fn().mockReturnValue({ eq });
      return { select };
    })();

    mockFrom.mockReturnValueOnce(sessionsChain as never).mockReturnValueOnce(usersChain as never);

    const res = await request(app).get('/api/analytics/insights/cards').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cards');
    expect(Array.isArray(res.body.cards)).toBe(true);
    expect(res.body.cards.length).toBeGreaterThan(0);
    const card = res.body.cards[0];
    expect(card).toHaveProperty('type');
    expect(card).toHaveProperty('title');
    expect(card).toHaveProperty('body');
    expect(card).toHaveProperty('value');
  });
});

describe('GET /api/analytics/summary', () => {
  beforeEach(() => {
    // Promise.all fires 3 concurrent from() calls: sessions, users, recent_sessions
    const sessionsChain = mockChain({
      data: [{ date: '2026-03-15', duration_min: 45 }],
      error: null,
    });
    const usersChain = mockChain({
      data: { current_phase: 1, timezone: 'UTC', selected_curriculum_key: 'best_of_all' },
      error: null,
    });
    const recentChain = mockChain({ data: [], error: null });
    // Sequential after Promise.all: curriculum_sources lookup, then curriculum_skill_entries
    const curriculumChain = mockChain({ data: { id: 'curr-1' }, error: null });
    const phaseSkillsChain = mockChain({ data: [], error: null });
    mockFrom
      .mockReturnValueOnce(sessionsChain as never)
      .mockReturnValueOnce(usersChain as never)
      .mockReturnValueOnce(recentChain as never)
      .mockReturnValueOnce(curriculumChain as never)
      .mockReturnValueOnce(phaseSkillsChain as never);
  });

  it('returns 200', async () => {
    const res = await request(app).get('/api/analytics/summary').set(AUTH);
    expect(res.status).toBe(200);
  });

  it('response has required shape fields', async () => {
    const res = await request(app).get('/api/analytics/summary').set(AUTH);
    expect(res.body).toHaveProperty('totalMins');
    expect(res.body).toHaveProperty('totalSessions');
    expect(res.body).toHaveProperty('streak');
    expect(res.body).toHaveProperty('currentPhase');
    expect(res.body).toHaveProperty('last7');
  });

  it('last7 is an array of 7 entries', async () => {
    const res = await request(app).get('/api/analytics/summary').set(AUTH);
    expect(Array.isArray(res.body.last7)).toBe(true);
    expect(res.body.last7).toHaveLength(7);
  });

  it('totalMins sums session durations', async () => {
    const res = await request(app).get('/api/analytics/summary').set(AUTH);
    expect(res.body.totalMins).toBe(45);
  });
});
