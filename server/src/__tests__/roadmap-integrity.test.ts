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
    data: { user: { id: 'user-abc', email: 'test@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
});

// ── GET /api/roadmap — curriculum fallback ────────────────────────────────────
describe('GET /api/roadmap — curriculum fallback', () => {
  it('falls back to best_of_all when user curriculum is inactive', async () => {
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      callCount++;
      if (table === 'users') {
        const single = vi.fn().mockResolvedValue({
          data: { current_phase: 1, selected_curriculum_key: 'marty_music' },
          error: null,
        });
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
          }),
        } as never;
      }
      if (table === 'curriculum_sources') {
        const single = vi.fn().mockResolvedValue(
          // First call: marty_music inactive → null. Second call: best_of_all → data
          callCount === 2
            ? { data: null, error: { message: 'not found' } }
            : { data: { id: 'fallback-uuid' }, error: null },
        );
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
          }),
        } as never;
      }
      if (table === 'curriculum_skill_entries') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
          }),
        } as never;
      }
      if (table === 'skill_progress') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi
              .fn()
              .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }),
          }),
        } as never;
      }
      if (table === 'practice_sessions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        } as never;
      }
      return {
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null }) }),
      } as never;
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    // Should not return 404 — should fall back gracefully
    expect(res.status).not.toBe(404);
  });

  it('returns 503 when no curriculum at all is available', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        const single = vi.fn().mockResolvedValue({
          data: { current_phase: 1, selected_curriculum_key: 'best_of_all' },
          error: null,
        });
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
        } as never;
      }
      if (table === 'curriculum_sources') {
        // All curricula inactive
        const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
          }),
        } as never;
      }
      return {
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null }) }),
      } as never;
    });

    const res = await request(app).get('/api/roadmap').set(AUTH);
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/no active curriculum/i);
  });
});

// ── PATCH /api/roadmap/skill/:key/confidence — validation ─────────────────────
describe('PATCH /api/roadmap/skill/:key/confidence — validation', () => {
  function mockUserAndSkill(skillData: object | null) {
    let spCallCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        const single = vi.fn().mockResolvedValue({
          data: { selected_curriculum_key: 'best_of_all' },
          error: null,
        });
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
        } as never;
      }
      if (table === 'skills') {
        const single = vi.fn().mockResolvedValue({
          data: skillData,
          error: skillData ? null : { message: 'not found' },
        });
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
        } as never;
      }
      if (table === 'skill_progress') {
        spCallCount++;
        if (spCallCount === 1) {
          // SELECT existing row
          const single = vi.fn().mockResolvedValue({
            data: { id: 'sp-1', phase_index: 0, skill_index: 0 },
            error: null,
          });
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
              }),
            }),
          } as never;
        }
        // UPDATE
        return {
          update: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        } as never;
      }
      return {
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null }) }),
      } as never;
    });
  }

  it('returns 400 when confidence is not 1, 2, or 3', async () => {
    mockUserAndSkill({ id: 'skill-uuid' });
    const res = await request(app)
      .patch('/api/roadmap/skill/chord_em/confidence')
      .set(AUTH)
      .send({ confidence: 5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/1.*2.*3|confidence/i);
  });

  it('returns 400 when confidence is 0', async () => {
    mockUserAndSkill({ id: 'skill-uuid' });
    const res = await request(app)
      .patch('/api/roadmap/skill/chord_em/confidence')
      .set(AUTH)
      .send({ confidence: 0 });
    expect(res.status).toBe(400);
  });

  it('returns 422 when skill key contains invalid characters', async () => {
    const res = await request(app)
      .patch('/api/roadmap/skill/chord-em-INVALID/confidence')
      .set(AUTH)
      .send({ confidence: 2 });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/invalid skill key/i);
  });

  it('returns 422 when skill key does not exist in skills table', async () => {
    mockUserAndSkill(null); // skill not found
    const res = await request(app)
      .patch('/api/roadmap/skill/nonexistent_skill/confidence')
      .set(AUTH)
      .send({ confidence: 2 });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/does not exist/i);
  });

  it('returns 200 when valid skill key and confidence 1', async () => {
    mockUserAndSkill({ id: 'skill-uuid' });
    const res = await request(app)
      .patch('/api/roadmap/skill/chord_em/confidence')
      .set(AUTH)
      .send({ confidence: 1 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 200 when valid skill key and confidence 3', async () => {
    mockUserAndSkill({ id: 'skill-uuid' });
    const res = await request(app)
      .patch('/api/roadmap/skill/chord_em/confidence')
      .set(AUTH)
      .send({ confidence: 3 });
    expect(res.status).toBe(200);
  });

  it('returns 404 when skill has no progress row (must complete first)', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        const single = vi
          .fn()
          .mockResolvedValue({ data: { selected_curriculum_key: 'best_of_all' }, error: null });
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
        } as never;
      }
      if (table === 'skills') {
        const single = vi.fn().mockResolvedValue({ data: { id: 'skill-uuid' }, error: null });
        return {
          select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
        } as never;
      }
      if (table === 'skill_progress') {
        // No progress row exists
        const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
            }),
          }),
        } as never;
      }
      return {
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null }) }),
      } as never;
    });

    const res = await request(app)
      .patch('/api/roadmap/skill/chord_em/confidence')
      .set(AUTH)
      .send({ confidence: 2 });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/complete this skill/i);
  });
});
