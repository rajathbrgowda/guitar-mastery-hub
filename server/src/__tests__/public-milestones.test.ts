/**
 * public-milestones.test.ts — CARD-497
 * Tests for GET /api/public/milestones/:userId/latest
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

const mockFrom = vi.mocked(supabase.from);

beforeEach(() => {
  mockFrom.mockReset();
});

/** Build a Supabase-like fluent chain that resolves with `resolvedValue` when awaited.
 *  Uses lazy mockImplementation so thenable() is only called when a method is actually invoked. */
function makeChain(resolvedValue: unknown) {
  const promise = Promise.resolve(resolvedValue);

  function thenable(): Record<string, unknown> {
    const obj: Record<string, unknown> = {
      // Make the chain itself awaitable
      then: (onfulfilled: unknown, onrejected: unknown) =>
        promise.then(onfulfilled as never, onrejected as never),
      catch: (onrejected: unknown) => promise.catch(onrejected as never),
    };
    // Chainable methods — lazily create the next thenable on each call
    for (const m of ['select', 'eq', 'in', 'not', 'order']) {
      obj[m] = vi.fn().mockImplementation(() => thenable());
    }
    // Terminal methods
    obj['single'] = vi.fn().mockResolvedValue(resolvedValue);
    obj['limit'] = vi.fn().mockResolvedValue(resolvedValue);
    return obj;
  }

  return thenable();
}

interface SetupOpts {
  user?: { current_phase: number; selected_curriculum_key: string } | null;
  currSource?: { id: string; name: string } | null;
  entries?: Array<{ phase_title: string }>;
  skillEntries?: Array<{ skill_id: string }>;
  progressRows?: Array<{ completed_at: string }>;
}

function setupMocks(opts: SetupOpts) {
  let cseCallCount = 0;
  mockFrom.mockImplementation((table: string) => {
    if (table === 'users') {
      const userResult =
        opts.user == null
          ? { data: null, error: { message: 'not found' } }
          : { data: opts.user, error: null };
      return makeChain(userResult) as never;
    }

    if (table === 'curriculum_sources') {
      return makeChain({ data: opts.currSource ?? null, error: null }) as never;
    }

    if (table === 'curriculum_skill_entries') {
      cseCallCount++;
      if (cseCallCount === 1) {
        return makeChain({ data: opts.entries ?? [], error: null }) as never;
      } else {
        return makeChain({ data: opts.skillEntries ?? [], error: null }) as never;
      }
    }

    if (table === 'skill_progress') {
      return makeChain({ data: opts.progressRows ?? [], error: null }) as never;
    }

    return makeChain({ data: null, error: null }) as never;
  });
}

describe('GET /api/public/milestones/:userId/latest', () => {
  it('returns 404 when user not found', async () => {
    setupMocks({ user: null });
    const res = await request(app).get('/api/public/milestones/nonexistent/latest');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });

  it('returns 404 when user has no completed phases (current_phase = 1)', async () => {
    setupMocks({
      user: { current_phase: 1, selected_curriculum_key: 'best_of_all' },
    });
    const res = await request(app).get('/api/public/milestones/user-123/latest');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No completed phases/i);
  });

  it('returns 400 for invalid userId length', async () => {
    const longId = 'a'.repeat(65);
    const res = await request(app).get(`/api/public/milestones/${longId}/latest`);
    expect(res.status).toBe(400);
  });

  it('returns milestone data when user has current_phase > 1', async () => {
    setupMocks({
      user: { current_phase: 2, selected_curriculum_key: 'best_of_all' },
      currSource: { id: 'cur-1', name: 'Best of All' },
      entries: [
        { phase_title: 'Getting Started' },
        { phase_title: 'Getting Started' },
        { phase_title: 'Getting Started' },
      ],
      skillEntries: [{ skill_id: 's-1' }, { skill_id: 's-2' }],
      progressRows: [{ completed_at: '2026-03-10' }],
    });

    const res = await request(app).get('/api/public/milestones/user-123/latest');
    expect(res.status).toBe(200);
    expect(res.body.phase_number).toBe(1);
    expect(res.body.phase_title).toBe('Getting Started');
    expect(res.body.curriculum_name).toBe('Best of All');
    expect(res.body.skills_count).toBe(3);
  });

  it('sets Cache-Control max-age=60', async () => {
    setupMocks({
      user: { current_phase: 3, selected_curriculum_key: 'best_of_all' },
      currSource: { id: 'cur-1', name: 'Best of All' },
      entries: [{ phase_title: 'Intermediate' }],
      skillEntries: [],
      progressRows: [],
    });

    const res = await request(app).get('/api/public/milestones/user-abc/latest');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toMatch(/max-age=60/);
  });

  it('returns 404 for missing userId segment', async () => {
    const res = await request(app).get('/api/public/milestones//latest');
    // Express treats // as a 404 route
    expect(res.status).toBe(404);
  });

  it('returns completed_at from skill_progress', async () => {
    setupMocks({
      user: { current_phase: 2, selected_curriculum_key: 'best_of_all' },
      currSource: { id: 'cur-1', name: 'Best of All' },
      entries: [{ phase_title: 'Phase 1' }],
      skillEntries: [{ skill_id: 's-1' }],
      progressRows: [{ completed_at: '2026-02-28' }],
    });

    const res = await request(app).get('/api/public/milestones/user-xyz/latest');
    expect(res.status).toBe(200);
    expect(res.body.completed_at).toBe('2026-02-28');
  });
});
