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

const mockFrom = vi.mocked(supabase.from);

beforeEach(() => {
  mockFrom.mockReset();
});

function mockStatsRoute(
  userCount: number,
  sessionCount: number,
  sessions: { duration_min: number | null }[],
) {
  // Call 1: users count
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({ count: userCount, error: null }),
  } as never);

  // Call 2: sessions count
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({ count: sessionCount, error: null }),
  } as never);

  // Call 3: sessions duration_min
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockResolvedValue({ data: sessions, error: null }),
  } as never);
}

describe('GET /api/public/stats', () => {
  it('returns stats without authentication', async () => {
    mockStatsRoute(42, 150, [{ duration_min: 30 }, { duration_min: 20 }, { duration_min: null }]);

    const res = await request(app).get('/api/public/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total_users');
    expect(res.body).toHaveProperty('total_sessions');
    expect(res.body).toHaveProperty('total_practice_minutes');
  });

  it('returns zero stats when tables are empty', async () => {
    mockStatsRoute(0, 0, []);

    const res = await request(app).get('/api/public/stats');
    expect(res.status).toBe(200);
    expect(res.body.total_users).toBe(0);
    expect(res.body.total_sessions).toBe(0);
    expect(res.body.total_practice_minutes).toBe(0);
  });

  it('handles null duration_min gracefully', async () => {
    mockStatsRoute(5, 3, [{ duration_min: null }, { duration_min: null }, { duration_min: 25 }]);

    const res = await request(app).get('/api/public/stats');
    expect(res.status).toBe(200);
    expect(res.body.total_practice_minutes).toBe(25);
  });

  it('does not require Authorization header', async () => {
    mockStatsRoute(10, 50, [{ duration_min: 15 }]);

    // No Authorization header
    const res = await request(app).get('/api/public/stats');
    expect(res.status).not.toBe(401);
  });
});
