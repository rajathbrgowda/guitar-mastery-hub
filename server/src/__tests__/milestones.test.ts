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

describe('GET /api/milestones', () => {
  function setupMocks(sessions: unknown[], plans: unknown[]) {
    const sessionsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: sessions, error: null }),
    };
    const plansChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: plans, error: null }),
    };
    const userChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { timezone: 'UTC' }, error: null }),
    };

    mockFrom
      .mockReturnValueOnce(sessionsChain as never)
      .mockReturnValueOnce(plansChain as never)
      .mockReturnValueOnce(userChain as never);
  }

  it('returns 12 milestones', async () => {
    setupMocks([], []);
    const res = await request(app).get('/api/milestones').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.milestones).toHaveLength(12);
    expect(res.body.total_count).toBe(12);
  });

  it('first_session earned=true when session count >= 1', async () => {
    setupMocks([{ date: '2026-03-01', duration_min: 30 }], []);
    const res = await request(app).get('/api/milestones').set(AUTH);
    expect(res.status).toBe(200);
    const first = res.body.milestones.find((m: { key: string }) => m.key === 'first_session');
    expect(first.earned).toBe(true);
    expect(first.earned_at).toBe('2026-03-01');
  });

  it('streak_7 earned=false when streak < 7', async () => {
    setupMocks([{ date: '2026-03-01', duration_min: 30 }], []);
    const res = await request(app).get('/api/milestones').set(AUTH);
    const streak7 = res.body.milestones.find((m: { key: string }) => m.key === 'streak_7');
    expect(streak7.earned).toBe(false);
  });

  it('earned_count reflects earned milestones', async () => {
    setupMocks([{ date: '2026-03-01', duration_min: 30 }], []);
    const res = await request(app).get('/api/milestones').set(AUTH);
    // first_session + mins_60 (if 30 < 60: not earned) — only first_session earned
    expect(res.body.earned_count).toBeGreaterThanOrEqual(1);
  });
});
