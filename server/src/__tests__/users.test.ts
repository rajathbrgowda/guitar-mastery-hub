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

const USER_PROFILE = {
  id: 'user-123',
  email: 'test@test.com',
  display_name: 'Raj',
  guitar_type: 'acoustic',
  years_playing: 1,
  daily_goal_min: 20,
  practice_days_target: 5,
  timezone: 'UTC',
  avatar_url: null,
  current_phase: 0,
  theme_color: 'helix',
  selected_curriculum_key: 'nitsuj_method',
  onboarding_completed: true,
  created_at: '2026-03-15T00:00:00Z',
};

beforeEach(() => {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-123', email: 'test@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
});

// ─────────────────────────────────────────────────────────────
// PUT /api/users/me/curriculum
// ─────────────────────────────────────────────────────────────
describe('PUT /api/users/me/curriculum', () => {
  it("returns 200 and deletes today's plan after a successful switch", async () => {
    // Call 1: curriculum_sources lookup
    const currSingle = vi.fn().mockResolvedValue({ data: { key: 'nitsuj_method' }, error: null });
    const currEq2 = vi.fn().mockReturnValue({ single: currSingle });
    const currEq1 = vi.fn().mockReturnValue({ eq: currEq2 });
    const currSelect = vi.fn().mockReturnValue({ eq: currEq1 });

    // Call 2: users update
    const userSingle = vi.fn().mockResolvedValue({ data: USER_PROFILE, error: null });
    const userSelect = vi.fn().mockReturnValue({ single: userSingle });
    const userEq = vi.fn().mockReturnValue({ select: userSelect });
    const userUpdate = vi.fn().mockReturnValue({ eq: userEq });

    // Call 3: daily_practice_plans delete
    const deletePlanEq2 = vi.fn().mockResolvedValue({ data: null, error: null });
    const deletePlanEq1 = vi.fn().mockReturnValue({ eq: deletePlanEq2 });
    const planDelete = vi.fn().mockReturnValue({ eq: deletePlanEq1 });

    mockFrom
      .mockReturnValueOnce({ select: currSelect } as never)
      .mockReturnValueOnce({ update: userUpdate } as never)
      .mockReturnValueOnce({ delete: planDelete } as never);

    const res = await request(app)
      .put('/api/users/me/curriculum')
      .set(AUTH)
      .send({ curriculum_key: 'nitsuj_method' });

    expect(res.status).toBe(200);
    expect(res.body.selected_curriculum_key).toBe('nitsuj_method');

    // Verify today's plan was deleted
    expect(planDelete).toHaveBeenCalled();
  });

  it('returns 422 for unknown curriculum_key', async () => {
    const currSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
    const currEq2 = vi.fn().mockReturnValue({ single: currSingle });
    const currEq1 = vi.fn().mockReturnValue({ eq: currEq2 });
    const currSelect = vi.fn().mockReturnValue({ eq: currEq1 });

    mockFrom.mockReturnValueOnce({ select: currSelect } as never);

    const res = await request(app)
      .put('/api/users/me/curriculum')
      .set(AUTH)
      .send({ curriculum_key: 'does_not_exist' });

    expect(res.status).toBe(422);
  });

  it('returns 400 when curriculum_key is missing', async () => {
    const res = await request(app).put('/api/users/me/curriculum').set(AUTH).send({});

    expect(res.status).toBe(400);
  });
});
