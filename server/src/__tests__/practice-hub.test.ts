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

// ── helpers ──────────────────────────────────────────────────────────────────

function mockWeekRoute(sessions: { date: string; duration_min: number }[]) {
  // Call 1: users timezone
  const single1 = vi.fn().mockResolvedValue({ data: { timezone: 'UTC' }, error: null });
  const eq1 = vi.fn().mockReturnValue({ single: single1 });
  const select1 = vi.fn().mockReturnValue({ eq: eq1 });

  // Call 2: practice_sessions for the week
  const lte = vi.fn().mockResolvedValue({ data: sessions, error: null });
  const gte = vi.fn().mockReturnValue({ lte });
  const eq2 = vi.fn().mockReturnValue({ gte });
  const select2 = vi.fn().mockReturnValue({ eq: eq2 });

  mockFrom.mockReturnValueOnce({ select: select1 } as never).mockReturnValueOnce({
    select: select2,
  } as never);
}

// ── GET /api/practice/week ────────────────────────────────────────────────────

describe('GET /api/practice/week', () => {
  it('returns 7 PracticeWeekDay objects', async () => {
    mockWeekRoute([]);

    const res = await request(app).get('/api/practice/week').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(7);
    expect(res.body[0]).toMatchObject({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      day_label: expect.stringMatching(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/),
      has_session: false,
      duration_min: 0,
    });
  });

  it('marks day with sessions as has_session=true with summed duration', async () => {
    const today = new Date().toISOString().split('T')[0];
    mockWeekRoute([
      { date: today, duration_min: 20 },
      { date: today, duration_min: 15 },
    ]);

    const res = await request(app).get('/api/practice/week').set(AUTH);

    expect(res.status).toBe(200);
    const todayDay = res.body.find((d: { date: string }) => d.date === today);
    expect(todayDay?.has_session).toBe(true);
    expect(todayDay?.duration_min).toBe(35);
  });

  it('returns Mon as the first day and Sun as the last', async () => {
    mockWeekRoute([]);

    const res = await request(app).get('/api/practice/week').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body[0].day_label).toBe('Mon');
    expect(res.body[6].day_label).toBe('Sun');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/practice/week');
    expect(res.status).toBe(401);
  });
});
