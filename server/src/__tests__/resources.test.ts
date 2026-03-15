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

// Build a chain that resolves with single()
function singleChain(resolved: { data: unknown; error: null | { message: string } }) {
  const single = vi.fn().mockResolvedValue(resolved);
  const eq: ReturnType<typeof vi.fn> = vi.fn();
  eq.mockReturnValue({ single, eq });
  const select = vi.fn().mockReturnValue({ eq });
  return { select };
}

// Build a chain for resources that resolves with order()
function orderChain(resolved: { data: unknown; error: null | { message: string } }) {
  const order = vi.fn().mockResolvedValue(resolved);
  const select = vi.fn().mockReturnValue({ order });
  return { select };
}

// Build a chain that resolves directly from eq()
function eqChain(resolved: { data: unknown; error: null | { message: string } }) {
  const eq: ReturnType<typeof vi.fn> = vi.fn();
  eq.mockResolvedValue(resolved);
  const select = vi.fn().mockReturnValue({ eq });
  return { select };
}

describe('GET /api/resources', () => {
  it('returns { recommended, all } shape with enriched resources', async () => {
    // 1st from: users.select('current_phase').eq(...).single()
    const usersChain = singleChain({ data: { current_phase: 1 }, error: null });

    // 2nd from: resources.select('*').order(...)
    const resourcesChain = orderChain({
      data: [
        {
          id: 'res-1',
          title: 'JustinGuitar Grade 2',
          url: 'https://www.justinguitar.com',
          type: 'video',
          phase_index: 1,
          is_featured: true,
          description: 'Beginner course',
        },
        {
          id: 'res-2',
          title: 'F Chord Masterclass',
          url: 'https://www.justinguitar.com/fchord',
          type: 'video',
          phase_index: 2,
          is_featured: true,
          description: 'Barre chord',
        },
      ],
      error: null,
    });

    // 3rd from: resource_completions.select(...).eq(...)
    const completionsChain = eqChain({
      data: [{ resource_id: 'res-1', completion: 50, status: 'in_progress' }],
      error: null,
    });

    mockFrom
      .mockReturnValueOnce(usersChain as never)
      .mockReturnValueOnce(resourcesChain as never)
      .mockReturnValueOnce(completionsChain as never);

    const res = await request(app).get('/api/resources').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('recommended');
    expect(res.body).toHaveProperty('all');
    expect(Array.isArray(res.body.recommended)).toBe(true);
    expect(Array.isArray(res.body.all)).toBe(true);
    expect(res.body.all).toHaveLength(2);
  });

  it('returns empty recommended when no phase match', async () => {
    const usersChain = singleChain({ data: { current_phase: 5 }, error: null });
    const resourcesChain = orderChain({
      data: [
        {
          id: 'res-1',
          title: 'JustinGuitar Grade 2',
          url: 'https://www.justinguitar.com',
          type: 'video',
          phase_index: 1,
          is_featured: true,
          description: null,
        },
      ],
      error: null,
    });
    const completionsChain = eqChain({ data: [], error: null });

    mockFrom
      .mockReturnValueOnce(usersChain as never)
      .mockReturnValueOnce(resourcesChain as never)
      .mockReturnValueOnce(completionsChain as never);

    const res = await request(app).get('/api/resources').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.recommended).toHaveLength(0);
    expect(res.body.all).toHaveLength(1);
  });
});

describe('PUT /api/resources/:id/completion', () => {
  it('returns 200 with { success: true } for valid body', async () => {
    const upsertChain = (() => {
      const upsert = vi.fn().mockResolvedValue({ error: null });
      const from = { upsert };
      return from;
    })();

    mockFrom.mockReturnValueOnce(upsertChain as never);

    const res = await request(app)
      .put('/api/resources/res-1/completion')
      .set(AUTH)
      .send({ completion: 100 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('returns 400 when completion is out of range', async () => {
    const res = await request(app)
      .put('/api/resources/res-1/completion')
      .set(AUTH)
      .send({ completion: 150 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
