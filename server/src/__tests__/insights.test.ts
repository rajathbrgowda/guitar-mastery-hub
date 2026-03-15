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

function makeChain(returnData: unknown) {
  const single = vi.fn().mockResolvedValue({ data: returnData, error: null });
  const eq3 = vi.fn().mockReturnValue({ single });
  const eq2 = vi.fn().mockReturnValue({ eq: eq3, single });
  const eq1 = vi.fn().mockReturnValue({ eq: eq2, single });
  const select = vi.fn().mockReturnValue({ eq: eq1, single });
  return { select, eq1, eq2, eq3, single };
}

describe('GET /api/analytics/insights', () => {
  it('returns 200 with correct shape when no plan items exist', async () => {
    // Call 1: user profile
    const userChain = makeChain({
      current_phase: 0,
      selected_curriculum_key: 'best_of_all',
      timezone: 'UTC',
    });

    // Call 2: user plans (empty) — chain: .select().eq(user_id).eq(curriculum_key).gte(...)
    const plansGte = vi.fn().mockResolvedValue({ data: [], error: null });
    const plansEqCurriculum = vi.fn().mockReturnValue({ gte: plansGte });
    const plansEqUser = vi.fn().mockReturnValue({ eq: plansEqCurriculum, gte: plansGte });
    const plansSelect = vi.fn().mockReturnValue({ eq: plansEqUser });

    // Call 3: curriculum source
    const currChain = makeChain({ id: 'curr-1' });

    // Call 4: phase skills (empty)
    const skillsEq2 = vi.fn().mockResolvedValue({ data: [], error: null });
    const skillsEq1 = vi.fn().mockReturnValue({ eq: skillsEq2 });
    const skillsSelect = vi.fn().mockReturnValue({ eq: skillsEq1 });

    // Call 5: recent practice sessions
    const sessionsEq = vi.fn().mockReturnValue({
      gte: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    const sessionsSelect = vi.fn().mockReturnValue({ eq: sessionsEq });

    mockFrom
      .mockReturnValueOnce({ select: userChain.select } as never) // users
      .mockReturnValueOnce({ select: plansSelect } as never) // daily_practice_plans
      .mockReturnValueOnce({ select: currChain.select } as never) // curriculum_sources
      .mockReturnValueOnce({ select: skillsSelect } as never) // curriculum_skill_entries
      .mockReturnValueOnce({ select: sessionsSelect } as never); // practice_sessions

    const res = await request(app).get('/api/analytics/insights').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('weakSkills');
    expect(res.body).toHaveProperty('strongSkills');
    expect(res.body).toHaveProperty('weeklyDigest');
    expect(res.body).toHaveProperty('focusSkill');
    expect(Array.isArray(res.body.weakSkills)).toBe(true);
    expect(Array.isArray(res.body.strongSkills)).toBe(true);
    expect(res.body.weakSkills).toHaveLength(0);
    expect(res.body.strongSkills).toHaveLength(0);
    expect(res.body.focusSkill).toBeNull();
  });

  it('returns correct weeklyDigest shape with empty sessions', async () => {
    const userChain = makeChain({
      current_phase: 0,
      selected_curriculum_key: 'best_of_all',
      timezone: 'UTC',
    });
    // Second test: plan chain with two eq calls
    const plansGte2 = vi.fn().mockResolvedValue({ data: [], error: null });
    const plansEqCurriculum2 = vi.fn().mockReturnValue({ gte: plansGte2 });
    const plansEqUser2 = vi.fn().mockReturnValue({ eq: plansEqCurriculum2, gte: plansGte2 });
    const plansSelect = vi.fn().mockReturnValue({ eq: plansEqUser2 });
    const currChain = makeChain({ id: 'curr-1' });
    const skillsEq2 = vi.fn().mockResolvedValue({ data: [], error: null });
    const skillsSelect = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: skillsEq2 }) });
    const sessionsEq = vi.fn().mockReturnValue({
      gte: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    const sessionsSelect = vi.fn().mockReturnValue({ eq: sessionsEq });

    mockFrom
      .mockReturnValueOnce({ select: userChain.select } as never)
      .mockReturnValueOnce({ select: plansSelect } as never)
      .mockReturnValueOnce({ select: currChain.select } as never)
      .mockReturnValueOnce({ select: skillsSelect } as never)
      .mockReturnValueOnce({ select: sessionsSelect } as never);

    const res = await request(app).get('/api/analytics/insights').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.weeklyDigest.sessions_count).toBe(0);
    expect(res.body.weeklyDigest.total_mins).toBe(0);
    expect(res.body.weeklyDigest.days_practiced).toBe(0);
    expect(res.body.weeklyDigest.top_skill_title).toBeNull();
    expect(typeof res.body.weeklyDigest.week_start).toBe('string');
  });
});
