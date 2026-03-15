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

// Simulate a valid authenticated user on every request
beforeEach(() => {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-123', email: 'test@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
});

const AUTH = { Authorization: 'Bearer valid-token' };

describe('POST /api/practice', () => {
  it('returns 201 with session data for a valid body', async () => {
    const created = {
      id: 'sess-1',
      user_id: 'user-123',
      date: '2026-03-15',
      duration_min: 30,
      sections: null,
      notes: null,
      created_at: '2026-03-15T10:00:00Z',
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: created, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    mockFrom.mockReturnValue({ insert: mockInsert } as never);

    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({ date: '2026-03-15', duration_min: 30 });

    expect(res.status).toBe(201);
    expect(res.body.date).toBe('2026-03-15');
    expect(res.body.duration_min).toBe(30);
  });

  it('returns 400 when duration_min is missing', async () => {
    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({ date: '2026-03-15' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when date format is invalid', async () => {
    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({ date: '15-03-2026', duration_min: 30 });

    expect(res.status).toBe(400);
  });

  it('returns 400 when duration_min is zero or negative', async () => {
    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({ date: '2026-03-15', duration_min: 0 });

    expect(res.status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /api/practice', () => {
  it('returns 200 with an array', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockGte = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder, gte: mockGte });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect } as never);

    const res = await request(app)
      .get('/api/practice')
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
