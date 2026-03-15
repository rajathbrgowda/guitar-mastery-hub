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
    data: { user: { id: 'user-123', email: 'test@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
});

// ─────────────────────────────────────────────────────────────
// GET /api/progress
// ─────────────────────────────────────────────────────────────
describe('GET /api/progress', () => {
  it('returns only skills for the selected curriculum_key', async () => {
    const skill = {
      id: 'sp-1',
      phase_index: 0,
      skill_index: 1,
      completed: true,
      completed_at: '2026-03-15T10:00:00Z',
    };

    // Call 1: users table — fetch current_phase + selected_curriculum_key
    const userSingle = vi.fn().mockResolvedValue({
      data: { current_phase: 1, selected_curriculum_key: 'best_of_all' },
      error: null,
    });
    const userEq = vi.fn().mockReturnValue({ single: userSingle });
    const userSelect = vi.fn().mockReturnValue({ eq: userEq });

    // Call 2: skill_progress — filtered by user_id + curriculum_key
    // The last .eq() call must return a promise (thenable) so await resolves it correctly.
    const skillsEqCurriculum = vi.fn().mockResolvedValue({ data: [skill], error: null });
    const skillsEqUser = vi.fn().mockReturnValue({ eq: skillsEqCurriculum });
    const skillsSelect = vi.fn().mockReturnValue({ eq: skillsEqUser });

    mockFrom
      .mockReturnValueOnce({ select: userSelect } as never)
      .mockReturnValueOnce({ select: skillsSelect } as never);

    const res = await request(app).get('/api/progress').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('skills');
    expect(res.body).toHaveProperty('currentPhase');
    expect(Array.isArray(res.body.skills)).toBe(true);
    expect(res.body.skills).toHaveLength(1);
    expect(res.body.skills[0].id).toBe('sp-1');
    expect(res.body.currentPhase).toBe(1);

    // Verify the skill_progress query was filtered by curriculum_key
    expect(skillsEqCurriculum).toHaveBeenCalledWith('curriculum_key', 'best_of_all');
  });

  it('returns empty skills array when none exist for the curriculum', async () => {
    const userSingle = vi.fn().mockResolvedValue({
      data: { current_phase: 0, selected_curriculum_key: 'nitsuj_method' },
      error: null,
    });
    const userEq = vi.fn().mockReturnValue({ single: userSingle });
    const userSelect = vi.fn().mockReturnValue({ eq: userEq });

    const skillsEqCurriculum = vi.fn().mockResolvedValue({ data: [], error: null });
    const skillsEqUser = vi.fn().mockReturnValue({ eq: skillsEqCurriculum });
    const skillsSelect = vi.fn().mockReturnValue({ eq: skillsEqUser });

    mockFrom
      .mockReturnValueOnce({ select: userSelect } as never)
      .mockReturnValueOnce({ select: skillsSelect } as never);

    const res = await request(app).get('/api/progress').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.skills).toHaveLength(0);
    // Verify the correct curriculum key was applied
    expect(skillsEqCurriculum).toHaveBeenCalledWith('curriculum_key', 'nitsuj_method');
  });
});

// ─────────────────────────────────────────────────────────────
// PATCH /api/progress/skill
// ─────────────────────────────────────────────────────────────
describe('PATCH /api/progress/skill', () => {
  it('includes curriculum_key in the upsert payload', async () => {
    const upsertedRow = {
      id: 'sp-99',
      user_id: 'user-123',
      curriculum_key: 'best_of_all',
      phase_index: 0,
      skill_index: 2,
      completed: true,
      completed_at: '2026-03-15T10:00:00Z',
    };

    // Call 1: fetch curriculum_key from users
    const userSingle = vi
      .fn()
      .mockResolvedValue({ data: { selected_curriculum_key: 'best_of_all' }, error: null });
    const userEq = vi.fn().mockReturnValue({ single: userSingle });
    const userSelect = vi.fn().mockReturnValue({ eq: userEq });

    // Call 2: skill_progress upsert
    const rowSingle = vi.fn().mockResolvedValue({ data: upsertedRow, error: null });
    const rowSelect = vi.fn().mockReturnValue({ single: rowSingle });
    const upsert = vi.fn().mockReturnValue({ select: rowSelect });

    // Calls 3-6: DI-010 phase completion check (completed=true triggers this)
    // Call 3: users — fetch current_phase for phase completion check
    const phaseUserSingle = vi.fn().mockResolvedValue({
      data: { current_phase: 0, selected_curriculum_key: 'best_of_all' },
      error: null,
    });
    const phaseUserEq = vi.fn().mockReturnValue({ single: phaseUserSingle });
    const phaseUserSelect = vi.fn().mockReturnValue({ eq: phaseUserEq });

    // Call 4: curriculum_sources
    const currSingle = vi.fn().mockResolvedValue({ data: { id: 'curr-1' }, error: null });
    const currEq2 = vi.fn().mockReturnValue({ single: currSingle });
    const currEq1 = vi.fn().mockReturnValue({ eq: currEq2 });
    const currSelect = vi.fn().mockReturnValue({ eq: currEq1 });

    // Call 5: count total skills in phase (curriculum_skill_entries — 2 eq calls)
    const totalEq2 = vi.fn().mockReturnValue(Promise.resolve({ count: 10, error: null }));
    const totalEq1 = vi.fn().mockReturnValue({ eq: totalEq2 });
    const totalSelect = vi.fn().mockReturnValue({ eq: totalEq1 });

    // Call 6: count completed skills (skill_progress — 4 eq calls), 9 < 10 so no advance
    const doneEq4 = vi.fn().mockReturnValue(Promise.resolve({ count: 9, error: null }));
    const doneEq3 = vi.fn().mockReturnValue({ eq: doneEq4 });
    const doneEq2 = vi.fn().mockReturnValue({ eq: doneEq3 });
    const doneEq1 = vi.fn().mockReturnValue({ eq: doneEq2 });
    const doneSelect = vi.fn().mockReturnValue({ eq: doneEq1 });

    mockFrom
      .mockReturnValueOnce({ select: userSelect } as never)
      .mockReturnValueOnce({ upsert } as never)
      .mockReturnValueOnce({ select: phaseUserSelect } as never)
      .mockReturnValueOnce({ select: currSelect } as never)
      .mockReturnValueOnce({ select: totalSelect } as never)
      .mockReturnValueOnce({ select: doneSelect } as never);

    const res = await request(app)
      .patch('/api/progress/skill')
      .set(AUTH)
      .send({ phase_index: 0, skill_index: 2, completed: true });

    expect(res.status).toBe(200);
    expect(res.body.curriculum_key).toBe('best_of_all');

    // Verify upsert was called with curriculum_key in the payload and onConflict
    const upsertPayload = upsert.mock.calls[0][0] as Record<string, unknown>;
    expect(upsertPayload).toMatchObject({ curriculum_key: 'best_of_all' });
    const upsertOptions = upsert.mock.calls[0][1] as { onConflict: string };
    expect(upsertOptions.onConflict).toContain('curriculum_key');
  });

  it('returns 400 for missing phase_index', async () => {
    const res = await request(app)
      .patch('/api/progress/skill')
      .set(AUTH)
      .send({ skill_index: 1, completed: true });

    expect(res.status).toBe(400);
  });
});
