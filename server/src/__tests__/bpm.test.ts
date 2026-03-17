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
    data: { user: { id: 'user-bpm', email: 'bpm@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
});

describe('POST /api/analytics/bpm', () => {
  it('201 on valid BPM log', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: 'log-1',
        skill_key: 'pentatonic_scale',
        bpm: 120,
        logged_at: '2026-03-16T00:00:00Z',
      },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    mockFrom.mockReturnValue({ insert } as never);

    const res = await request(app)
      .post('/api/analytics/bpm')
      .set(AUTH)
      .send({ skill_key: 'pentatonic_scale', bpm: 120 });

    expect(res.status).toBe(201);
    expect(res.body.bpm).toBe(120);
  });

  it('400 on bpm=0', async () => {
    const res = await request(app)
      .post('/api/analytics/bpm')
      .set(AUTH)
      .send({ skill_key: 'test_skill', bpm: 0 });
    expect(res.status).toBe(400);
  });

  it('400 on bpm=400', async () => {
    const res = await request(app)
      .post('/api/analytics/bpm')
      .set(AUTH)
      .send({ skill_key: 'test_skill', bpm: 400 });
    expect(res.status).toBe(400);
  });

  it('400 on invalid skill_key', async () => {
    const res = await request(app)
      .post('/api/analytics/bpm')
      .set(AUTH)
      .send({ skill_key: 'INVALID-KEY', bpm: 80 });
    expect(res.status).toBe(400);
  });

  it('401 without auth', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no' } } as never);
    const res = await request(app).post('/api/analytics/bpm').send({ skill_key: 'test', bpm: 80 });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/analytics/bpm', () => {
  it('returns logs array for valid skill_key', async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [
        { id: 'l1', bpm: 80, logged_at: '2026-03-10T00:00:00Z' },
        { id: 'l2', bpm: 100, logged_at: '2026-03-15T00:00:00Z' },
      ],
      error: null,
    });
    const order = vi.fn().mockReturnValue({ limit });
    const eq: ReturnType<typeof vi.fn> = vi.fn();
    eq.mockReturnValue({ eq, order });
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue({ eq }) } as never);

    const res = await request(app).get('/api/analytics/bpm?skill_key=pentatonic_scale').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.skill_key).toBe('pentatonic_scale');
    expect(res.body.logs).toHaveLength(2);
    expect(res.body.min_bpm).toBe(80);
    expect(res.body.max_bpm).toBe(100);
    expect(res.body.latest_bpm).toBe(100);
  });

  it('returns empty logs when no data', async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const order = vi.fn().mockReturnValue({ limit });
    const eq: ReturnType<typeof vi.fn> = vi.fn();
    eq.mockReturnValue({ eq, order });
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue({ eq }) } as never);

    const res = await request(app).get('/api/analytics/bpm?skill_key=chord_em').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.logs).toEqual([]);
    expect(res.body.min_bpm).toBeNull();
  });

  it('400 without skill_key param', async () => {
    const res = await request(app).get('/api/analytics/bpm').set(AUTH);
    expect(res.status).toBe(400);
  });
});
