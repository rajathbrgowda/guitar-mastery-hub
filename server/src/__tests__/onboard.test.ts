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

const VALID_BODY = {
  experience_level: 'beginner',
  curriculum_key: 'best_of_all',
  daily_goal_min: 20,
  practice_days_target: 5,
};

const ONBOARDED_PROFILE = {
  id: 'user-123',
  email: 'test@test.com',
  display_name: 'Raj',
  guitar_type: 'acoustic',
  years_playing: 0,
  daily_goal_min: 20,
  practice_days_target: 5,
  timezone: 'UTC',
  avatar_url: null,
  current_phase: 0,
  theme_color: 'helix',
  selected_curriculum_key: 'best_of_all',
  onboarding_completed: true,
  created_at: '2026-03-15T00:00:00Z',
};

describe('POST /api/users/me/onboard', () => {
  it('returns 200 with onboarding_completed=true for a valid body', async () => {
    // First call: curriculum lookup
    const mockCurrSingle = vi.fn().mockResolvedValue({ data: { key: 'best_of_all' }, error: null });
    const mockCurrEq2 = vi.fn().mockReturnValue({ single: mockCurrSingle });
    const mockCurrEq1 = vi.fn().mockReturnValue({ eq: mockCurrEq2 });
    const mockCurrSelect = vi.fn().mockReturnValue({ eq: mockCurrEq1 });

    // Second call: users update
    const mockUserSingle = vi.fn().mockResolvedValue({ data: ONBOARDED_PROFILE, error: null });
    const mockUserSelect = vi.fn().mockReturnValue({ single: mockUserSingle });
    const mockUserEq = vi.fn().mockReturnValue({ select: mockUserSelect });
    const mockUserUpdate = vi.fn().mockReturnValue({ eq: mockUserEq });

    mockFrom
      .mockReturnValueOnce({ select: mockCurrSelect } as never)
      .mockReturnValueOnce({ update: mockUserUpdate } as never);

    const res = await request(app).post('/api/users/me/onboard').set(AUTH).send(VALID_BODY);

    expect(res.status).toBe(200);
    expect(res.body.onboarding_completed).toBe(true);
    expect(res.body.current_phase).toBe(0); // beginner → phase 0
  });

  it('maps intermediate experience_level to current_phase 2', async () => {
    const mockCurrSingle = vi.fn().mockResolvedValue({ data: { key: 'best_of_all' }, error: null });
    const mockCurrEq2 = vi.fn().mockReturnValue({ single: mockCurrSingle });
    const mockCurrEq1 = vi.fn().mockReturnValue({ eq: mockCurrEq2 });
    const mockCurrSelect = vi.fn().mockReturnValue({ eq: mockCurrEq1 });

    const profile = { ...ONBOARDED_PROFILE, current_phase: 2 };
    const mockUserSingle = vi.fn().mockResolvedValue({ data: profile, error: null });
    const mockUserSelect = vi.fn().mockReturnValue({ single: mockUserSingle });
    const mockUserEq = vi.fn().mockReturnValue({ select: mockUserSelect });
    const mockUserUpdate = vi.fn().mockReturnValue({ eq: mockUserEq });

    mockFrom
      .mockReturnValueOnce({ select: mockCurrSelect } as never)
      .mockReturnValueOnce({ update: mockUserUpdate } as never);

    const res = await request(app)
      .post('/api/users/me/onboard')
      .set(AUTH)
      .send({ ...VALID_BODY, experience_level: 'intermediate' });

    expect(res.status).toBe(200);
    expect(res.body.current_phase).toBe(2);
  });

  it('returns 400 when experience_level is missing', async () => {
    const res = await request(app)
      .post('/api/users/me/onboard')
      .set(AUTH)
      .send({ curriculum_key: 'best_of_all', daily_goal_min: 20, practice_days_target: 5 });

    expect(res.status).toBe(400);
  });

  it('returns 400 when daily_goal_min is below minimum', async () => {
    const res = await request(app)
      .post('/api/users/me/onboard')
      .set(AUTH)
      .send({ ...VALID_BODY, daily_goal_min: 2 });

    expect(res.status).toBe(400);
  });

  it('returns 400 when curriculum_key is unknown or inactive', async () => {
    // curriculum_sources returns no row → inactive/unknown
    const mockCurrSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'no rows' } });
    const mockCurrEq2 = vi.fn().mockReturnValue({ single: mockCurrSingle });
    const mockCurrEq1 = vi.fn().mockReturnValue({ eq: mockCurrEq2 });
    const mockCurrSelect = vi.fn().mockReturnValue({ eq: mockCurrEq1 });

    mockFrom.mockReturnValueOnce({ select: mockCurrSelect } as never);

    const res = await request(app)
      .post('/api/users/me/onboard')
      .set(AUTH)
      .send({ ...VALID_BODY, curriculum_key: 'nonexistent_curriculum' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/curriculum/i);
  });
});
