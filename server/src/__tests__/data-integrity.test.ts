/**
 * data-integrity.test.ts
 * Integration tests covering DI-001 through DI-010 fixes.
 */
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
// DI-009: POST /api/practice date validation
// ─────────────────────────────────────────────────────────────
describe('DI-009: POST /api/practice date validation', () => {
  it('rejects a future date with 400', async () => {
    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({ date: '2099-01-01', duration_min: 30 });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toMatch(/future/i);
  });

  it('rejects a date older than 365 days with 400', async () => {
    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({ date: '2020-01-01', duration_min: 30 });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toMatch(/365/i);
  });

  it('rejects a badly formatted date with 400', async () => {
    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({ date: '15/03/2026', duration_min: 30 });

    expect(res.status).toBe(400);
  });

  it('accepts a valid date within the past year', async () => {
    // Use today's date — always valid
    const today = new Date().toISOString().split('T')[0];
    const created = {
      id: 'sess-di',
      user_id: 'user-123',
      date: today,
      duration_min: 20,
      sections: null,
      notes: null,
      confidence: null,
      created_at: new Date().toISOString(),
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: created, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    mockFrom.mockReturnValue({ insert: mockInsert } as never);

    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({ date: today, duration_min: 20 });

    expect(res.status).toBe(201);
  });
});

// ─────────────────────────────────────────────────────────────
// DI-005: POST /api/practice persists confidence field
// ─────────────────────────────────────────────────────────────
describe('DI-005: POST /api/practice confidence field', () => {
  it('accepts confidence=3 (Easy) and inserts it', async () => {
    const today = new Date().toISOString().split('T')[0];
    const created = {
      id: 'sess-conf',
      user_id: 'user-123',
      date: today,
      duration_min: 30,
      sections: null,
      notes: null,
      confidence: 3,
      created_at: new Date().toISOString(),
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: created, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    mockFrom.mockReturnValue({ insert: mockInsert } as never);

    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({ date: today, duration_min: 30, confidence: 3 });

    expect(res.status).toBe(201);

    // Verify confidence was included in the insert payload
    const insertPayload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(insertPayload.confidence).toBe(3);
  });

  it('rejects confidence=4 (out of range) with 400', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({ date: today, duration_min: 30, confidence: 4 });

    expect(res.status).toBe(400);
  });

  it('accepts omitted confidence (nullable)', async () => {
    const today = new Date().toISOString().split('T')[0];
    const created = {
      id: 'sess-noconf',
      user_id: 'user-123',
      date: today,
      duration_min: 15,
      sections: null,
      notes: null,
      confidence: null,
      created_at: new Date().toISOString(),
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: created, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    mockFrom.mockReturnValue({ insert: mockInsert } as never);

    const res = await request(app)
      .post('/api/practice')
      .set(AUTH)
      .send({ date: today, duration_min: 15 });

    expect(res.status).toBe(201);
    const insertPayload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(insertPayload.confidence).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// DI-004: PATCH /api/progress/skill sets completed_at correctly
// ─────────────────────────────────────────────────────────────
describe('DI-004: PATCH /api/progress/skill sets completed_at', () => {
  it('sets completed_at when completed=true', async () => {
    const upsertedRow = {
      id: 'sp-1',
      user_id: 'user-123',
      curriculum_key: 'best_of_all',
      phase_index: 0,
      skill_index: 1,
      completed: true,
      completed_at: '2026-03-15T10:00:00Z',
      phase_completed: false,
      new_phase: null,
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

    // Call 3: fetch current_phase + selected_curriculum_key (phase completion check)
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

    // Call 5: count total skills in phase
    const totalCountResult = vi.fn().mockResolvedValue({ count: 10, error: null });
    const totalEq3 = vi.fn().mockReturnValue(totalCountResult());
    const totalEq2 = vi.fn().mockReturnValue({ eq: totalEq3 });
    const totalEq1 = vi.fn().mockReturnValue({ eq: totalEq2 });
    const totalSelect = vi.fn().mockReturnValue({ eq: totalEq1 });

    // Call 6: count completed skills in phase
    const doneCountResult = vi.fn().mockResolvedValue({ count: 9, error: null }); // 9 < 10, not done
    const doneEq4 = vi.fn().mockReturnValue(doneCountResult());
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
      .send({ phase_index: 0, skill_index: 1, completed: true });

    expect(res.status).toBe(200);

    // Verify completed_at is in the upsert payload
    const upsertPayload = upsert.mock.calls[0][0] as Record<string, unknown>;
    expect(upsertPayload.completed_at).toBeTruthy();
    expect(upsertPayload.completed).toBe(true);
  });

  it('sets completed_at to null when completed=false', async () => {
    const upsertedRow = {
      id: 'sp-1',
      user_id: 'user-123',
      curriculum_key: 'best_of_all',
      phase_index: 0,
      skill_index: 1,
      completed: false,
      completed_at: null,
      phase_completed: false,
      new_phase: null,
    };

    const userSingle = vi.fn().mockResolvedValue({
      data: { selected_curriculum_key: 'best_of_all' },
      error: null,
    });
    const userEq = vi.fn().mockReturnValue({ single: userSingle });
    const userSelect = vi.fn().mockReturnValue({ eq: userEq });

    const rowSingle = vi.fn().mockResolvedValue({ data: upsertedRow, error: null });
    const rowSelect = vi.fn().mockReturnValue({ single: rowSingle });
    const upsert = vi.fn().mockReturnValue({ select: rowSelect });

    mockFrom
      .mockReturnValueOnce({ select: userSelect } as never)
      .mockReturnValueOnce({ upsert } as never);

    const res = await request(app)
      .patch('/api/progress/skill')
      .set(AUTH)
      .send({ phase_index: 0, skill_index: 1, completed: false });

    expect(res.status).toBe(200);

    const upsertPayload = upsert.mock.calls[0][0] as Record<string, unknown>;
    expect(upsertPayload.completed_at).toBeNull();
    expect(upsertPayload.completed).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// DI-010: Phase completion auto-advance
// ─────────────────────────────────────────────────────────────
describe('DI-010: Phase completion auto-advance', () => {
  function buildMocksForPhaseCheck(opts: {
    currentPhase: number;
    phaseIndex: number;
    totalSkills: number;
    completedSkills: number;
    maxPhase: number;
  }) {
    const { currentPhase, phaseIndex, totalSkills, completedSkills, maxPhase } = opts;

    const upsertedRow = {
      id: 'sp-advance',
      user_id: 'user-123',
      curriculum_key: 'best_of_all',
      phase_index: phaseIndex,
      skill_index: 0,
      completed: true,
      completed_at: new Date().toISOString(),
    };

    // Call 1: fetch curriculum_key
    const userSingle1 = vi
      .fn()
      .mockResolvedValue({ data: { selected_curriculum_key: 'best_of_all' }, error: null });
    const userEq1 = vi.fn().mockReturnValue({ single: userSingle1 });
    const userSelect1 = vi.fn().mockReturnValue({ eq: userEq1 });

    // Call 2: upsert
    const rowSingle = vi.fn().mockResolvedValue({ data: upsertedRow, error: null });
    const rowSelect = vi.fn().mockReturnValue({ single: rowSingle });
    const upsert = vi.fn().mockReturnValue({ select: rowSelect });

    // Call 3: fetch current_phase (phase completion check)
    const userSingle2 = vi.fn().mockResolvedValue({
      data: { current_phase: currentPhase, selected_curriculum_key: 'best_of_all' },
      error: null,
    });
    const userEq2 = vi.fn().mockReturnValue({ single: userSingle2 });
    const userSelect2 = vi.fn().mockReturnValue({ eq: userEq2 });

    // Call 4: curriculum_sources
    const currSingle = vi.fn().mockResolvedValue({ data: { id: 'curr-1' }, error: null });
    const currEq2 = vi.fn().mockReturnValue({ single: currSingle });
    const currEq1 = vi.fn().mockReturnValue({ eq: currEq2 });
    const currSelect = vi.fn().mockReturnValue({ eq: currEq1 });

    // Call 5: count total skills in phase (curriculum_skill_entries, 2 eq calls)
    // .select().eq(curriculum_id).eq(phase_number) ← last eq returns promise
    const totalEq2 = vi.fn().mockReturnValue(Promise.resolve({ count: totalSkills, error: null }));
    const totalEq1 = vi.fn().mockReturnValue({ eq: totalEq2 });
    const totalSelect = vi.fn().mockReturnValue({ eq: totalEq1 });

    // Call 6: count completed skills (skill_progress, 4 eq calls)
    // .select().eq(user_id).eq(curriculum_key).eq(phase_index).eq(completed) ← last eq returns promise
    const doneEq4 = vi
      .fn()
      .mockReturnValue(Promise.resolve({ count: completedSkills, error: null }));
    const doneEq3 = vi.fn().mockReturnValue({ eq: doneEq4 });
    const doneEq2 = vi.fn().mockReturnValue({ eq: doneEq3 });
    const doneEq1 = vi.fn().mockReturnValue({ eq: doneEq2 });
    const doneSelect = vi.fn().mockReturnValue({ eq: doneEq1 });

    // Call 7: max phase (only when phase is actually completed)
    const maxPhaseSingle = vi
      .fn()
      .mockResolvedValue({ data: { phase_number: maxPhase }, error: null });
    const maxPhaseLimit = vi.fn().mockReturnValue({ single: maxPhaseSingle });
    const maxPhaseOrder = vi.fn().mockReturnValue({ limit: maxPhaseLimit });
    const maxPhaseEq = vi.fn().mockReturnValue({ order: maxPhaseOrder });
    const maxPhaseSelect = vi.fn().mockReturnValue({ eq: maxPhaseEq });

    // Call 8: update users.current_phase (only when phase is completed and not at max)
    const updateResult = vi.fn().mockResolvedValue({ error: null });
    const updateEq = vi.fn().mockReturnValue(updateResult());
    const update = vi.fn().mockReturnValue({ eq: updateEq });

    return {
      mocks: [
        { select: userSelect1 },
        { upsert },
        { select: userSelect2 },
        { select: currSelect },
        { select: totalSelect },
        { select: doneSelect },
        { select: maxPhaseSelect },
        { update },
      ],
    };
  }

  it('returns phase_completed=true and advances phase when all skills in current phase are done', async () => {
    const { mocks } = buildMocksForPhaseCheck({
      currentPhase: 0,
      phaseIndex: 0,
      totalSkills: 5,
      completedSkills: 5, // all done
      maxPhase: 4,
    });

    mocks.forEach((m) => mockFrom.mockReturnValueOnce(m as never));

    const res = await request(app)
      .patch('/api/progress/skill')
      .set(AUTH)
      .send({ phase_index: 0, skill_index: 4, completed: true });

    expect(res.status).toBe(200);
    expect(res.body.phase_completed).toBe(true);
    expect(res.body.new_phase).toBe(1);
  });

  it('returns phase_completed=false when not all skills are done', async () => {
    const { mocks } = buildMocksForPhaseCheck({
      currentPhase: 0,
      phaseIndex: 0,
      totalSkills: 10,
      completedSkills: 7, // not all done
      maxPhase: 4,
    });

    // Only needs first 6 mocks (no max_phase or update query needed)
    mocks.slice(0, 6).forEach((m) => mockFrom.mockReturnValueOnce(m as never));

    const res = await request(app)
      .patch('/api/progress/skill')
      .set(AUTH)
      .send({ phase_index: 0, skill_index: 6, completed: true });

    expect(res.status).toBe(200);
    expect(res.body.phase_completed).toBe(false);
    expect(res.body.new_phase).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// DI-006: GET /api/analytics/history supports up to 365 days
// ─────────────────────────────────────────────────────────────
describe('DI-006: GET /api/analytics/history max days', () => {
  function buildHistoryMock(returnedRows: { date: string; duration_min: number }[]) {
    const mockOrder = vi.fn().mockResolvedValue({ data: returnedRows, error: null });
    const mockGte = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEq = vi.fn().mockReturnValue({ gte: mockGte });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect } as never);
  }

  it('returns 365 entries when days=365', async () => {
    buildHistoryMock([]);

    const res = await request(app).get('/api/analytics/history?days=365').set(AUTH);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(365);
  });

  it('caps at 365 when days=500', async () => {
    buildHistoryMock([]);

    const res = await request(app).get('/api/analytics/history?days=500').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(365);
  });

  it('defaults to 90 entries when days param is omitted', async () => {
    buildHistoryMock([]);

    const res = await request(app).get('/api/analytics/history').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(90);
  });

  it('fills zero-duration gaps for days with no sessions', async () => {
    buildHistoryMock([]); // No sessions — all days should be zero-filled

    const res = await request(app).get('/api/analytics/history?days=7').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(7);
    expect(res.body.every((d: { duration_min: number }) => d.duration_min === 0)).toBe(true);
  });
});
