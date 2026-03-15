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
