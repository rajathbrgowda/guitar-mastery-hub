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
    data: { user: { id: 'user-streak', email: 'streak@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
});

// Helper: generate consecutive dates ending at `endDate`, going back `count` days
function consecutiveDates(endDate: string, count: number): string[] {
  const dates: string[] = [];
  const d = new Date(endDate + 'T12:00:00Z');
  for (let i = 0; i < count; i++) {
    dates.push(d.toISOString().split('T')[0]);
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return dates; // newest first
}

function mockSummaryEndpoint(opts: {
  dates: string[];
  graceWeekUsed?: number;
  graceWeekStart?: string | null;
}) {
  const { dates, graceWeekUsed = 0, graceWeekStart = null } = opts;
  const sessions = dates.map((date) => ({ date, duration_min: 30 }));

  mockFrom.mockImplementation((table: string) => {
    if (table === 'practice_sessions') {
      // Summary endpoint calls practice_sessions twice:
      // 1) select('date, duration_min').eq().order() — all sessions
      // 2) select('sections').eq().gte() — recent sections for weak spots
      const orderFn = vi.fn().mockResolvedValue({ data: sessions, error: null });
      const gteFn = vi.fn().mockResolvedValue({ data: [], error: null });
      const eq: ReturnType<typeof vi.fn> = vi.fn();
      eq.mockReturnValue({ order: orderFn, gte: gteFn, eq });
      return {
        select: vi.fn().mockReturnValue({ eq }),
      } as never;
    }
    if (table === 'users') {
      const single = vi.fn().mockResolvedValue({
        data: {
          current_phase: 1,
          timezone: 'UTC',
          selected_curriculum_key: 'best_of_all',
          streak_grace_week_used: graceWeekUsed,
          streak_grace_week_start: graceWeekStart,
        },
        error: null,
      });
      return {
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
      } as never;
    }
    if (table === 'curriculum_sources') {
      const single = vi.fn().mockResolvedValue({ data: { id: 'cs-1' }, error: null });
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ single }),
        }),
      } as never;
    }
    if (table === 'curriculum_skill_entries') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as never;
    }
    return {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null }) }),
    } as never;
  });
}

describe('GET /api/analytics/summary — streak grace', () => {
  it('returns graceAvailable=true and graceUsed=false for new user', async () => {
    mockSummaryEndpoint({ dates: [] });

    const res = await request(app).get('/api/analytics/summary').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.graceAvailable).toBe(true);
    expect(res.body.graceUsed).toBe(false);
    expect(res.body.streak).toBe(0);
  });

  it('returns totalHours fields', async () => {
    const today = new Date().toISOString().split('T')[0];
    mockSummaryEndpoint({ dates: consecutiveDates(today, 5) });

    const res = await request(app).get('/api/analytics/summary').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalHours7d');
    expect(res.body).toHaveProperty('totalHours30d');
    expect(res.body).toHaveProperty('totalHoursAllTime');
    expect(res.body).toHaveProperty('avgSessionMin30d');
    expect(res.body.totalHoursAllTime).toBeGreaterThan(0);
  });

  it('returns streak > 0 for consecutive practice days', async () => {
    const today = new Date().toISOString().split('T')[0];
    mockSummaryEndpoint({ dates: consecutiveDates(today, 5) });

    const res = await request(app).get('/api/analytics/summary').set(AUTH);
    expect(res.body.streak).toBe(5);
  });

  it('graceAvailable=false when grace already used this week', async () => {
    const today = new Date().toISOString().split('T')[0];
    // Calculate this Monday
    const d = new Date(today + 'T12:00:00Z');
    const dow = d.getUTCDay();
    const mondayOffset = dow === 0 ? 6 : dow - 1;
    d.setUTCDate(d.getUTCDate() - mondayOffset);
    const monday = d.toISOString().split('T')[0];

    mockSummaryEndpoint({
      dates: consecutiveDates(today, 3),
      graceWeekUsed: 1,
      graceWeekStart: monday,
    });

    const res = await request(app).get('/api/analytics/summary').set(AUTH);
    expect(res.body.graceAvailable).toBe(false);
    expect(res.body.graceUsed).toBe(true);
  });
});
