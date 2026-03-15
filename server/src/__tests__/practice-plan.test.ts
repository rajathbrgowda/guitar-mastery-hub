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

/** Build a mock chain: from → select → eq → single */
function mockItemOwnershipChain(item: object | null, plan: object | null) {
  let callCount = 0;
  mockFrom.mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      // daily_practice_plan_items lookup
      const single = vi
        .fn()
        .mockResolvedValue({ data: item, error: item ? null : { message: 'not found' } });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      return { select } as never;
    }
    if (callCount === 2) {
      // daily_practice_plans ownership check
      const single = vi
        .fn()
        .mockResolvedValue({ data: plan, error: plan ? null : { message: 'not found' } });
      const eq3 = vi.fn().mockReturnValue({ single });
      const eq2 = vi.fn().mockReturnValue({ eq: eq3 });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const select = vi.fn().mockReturnValue({ eq: eq1 });
      return { select } as never;
    }
    // subsequent calls: update + remaining-items check + plan status update
    const resolved = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue(resolved);
    const update = vi.fn().mockReturnValue({ eq });
    const select = vi
      .fn()
      .mockReturnValue({
        eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }),
      });
    return { update, select } as never;
  });
}

describe('POST /api/practice/plan/today/items/:id/complete', () => {
  it('returns 200 and accepts confidence_rating', async () => {
    const item = { id: 'item-1', plan_id: 'plan-1', completed: false };
    const plan = { id: 'plan-1', status: 'pending' };
    mockItemOwnershipChain(item, plan);

    const res = await request(app)
      .post('/api/practice/plan/today/items/item-1/complete')
      .set(AUTH)
      .send({ confidence_rating: 3, actual_duration_min: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 200 without confidence_rating (optional field)', async () => {
    const item = { id: 'item-1', plan_id: 'plan-1', completed: false };
    const plan = { id: 'plan-1', status: 'pending' };
    mockItemOwnershipChain(item, plan);

    const res = await request(app)
      .post('/api/practice/plan/today/items/item-1/complete')
      .set(AUTH)
      .send({ actual_duration_min: 5 });

    expect(res.status).toBe(200);
  });

  it('returns 400 when confidence_rating is out of range', async () => {
    const res = await request(app)
      .post('/api/practice/plan/today/items/item-1/complete')
      .set(AUTH)
      .send({ confidence_rating: 5 });

    expect(res.status).toBe(400);
  });

  it('returns 404 when item does not exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
        }),
      }),
    } as never);

    const res = await request(app)
      .post('/api/practice/plan/today/items/bad-id/complete')
      .set(AUTH)
      .send({ confidence_rating: 2 });

    expect(res.status).toBe(404);
  });
});
