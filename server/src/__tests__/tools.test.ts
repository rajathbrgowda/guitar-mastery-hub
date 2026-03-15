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

// ── helpers ───────────────────────────────────────────────────────────────────

function mockGetToolsRoute(userTools: { tool_key: string; is_using: boolean }[] = []) {
  // Call 1: users.select('current_phase')
  const single1 = vi.fn().mockResolvedValue({ data: { current_phase: 1 }, error: null });
  const eq1 = vi.fn().mockReturnValue({ single: single1 });
  const select1 = vi.fn().mockReturnValue({ eq: eq1 });

  // Call 2: user_tools.select('tool_key, is_using')
  const eq2 = vi.fn().mockResolvedValue({ data: userTools, error: null });
  const select2 = vi.fn().mockReturnValue({ eq: eq2 });

  mockFrom
    .mockReturnValueOnce({ select: select1 } as never)
    .mockReturnValueOnce({ select: select2 } as never);
}

// ── GET /api/tools ─────────────────────────────────────────────────────────────

describe('GET /api/tools', () => {
  it('returns enriched tool list with is_using=false when no user tools', async () => {
    mockGetToolsRoute([]);

    const res = await request(app).get('/api/tools').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('all');
    expect(res.body).toHaveProperty('my_toolkit');
    expect(res.body).toHaveProperty('recommended');
    expect(Array.isArray(res.body.all)).toBe(true);
    expect(res.body.all.length).toBeGreaterThan(0);
    expect(res.body.my_toolkit).toHaveLength(0);
    // All tools should have is_using=false
    expect(res.body.all.every((t: { is_using: boolean }) => !t.is_using)).toBe(true);
  });

  it('marks tool as is_using=true when in user_tools', async () => {
    mockGetToolsRoute([{ tool_key: 'justinguitar', is_using: true }]);

    const res = await request(app).get('/api/tools').set(AUTH);

    expect(res.status).toBe(200);
    const jg = res.body.all.find((t: { key: string }) => t.key === 'justinguitar');
    expect(jg?.is_using).toBe(true);
    expect(res.body.my_toolkit).toHaveLength(1);
    expect(res.body.my_toolkit[0].key).toBe('justinguitar');
  });

  it('excludes is_using tools from recommended', async () => {
    // justinguitar is recommended for phase 1 — if already using, should not appear in recommended
    mockGetToolsRoute([{ tool_key: 'justinguitar', is_using: true }]);

    const res = await request(app).get('/api/tools').set(AUTH);

    expect(res.status).toBe(200);
    const recKeys = res.body.recommended.map((t: { key: string }) => t.key);
    expect(recKeys).not.toContain('justinguitar');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/tools');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/tools/:key ───────────────────────────────────────────────────────

describe('POST /api/tools/:key', () => {
  it('returns 404 for unknown tool key', async () => {
    const res = await request(app).post('/api/tools/not-a-real-tool').set(AUTH);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Unknown tool key');
  });

  it('adds tool and returns updated ToolsResponse', async () => {
    // upsert call
    const upsertFn = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValueOnce({ upsert: upsertFn } as never);
    // response calls
    mockGetToolsRoute([{ tool_key: 'justinguitar', is_using: true }]);

    const res = await request(app).post('/api/tools/justinguitar').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.my_toolkit.some((t: { key: string }) => t.key === 'justinguitar')).toBe(true);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/tools/justinguitar');
    expect(res.status).toBe(401);
  });
});

// ── DELETE /api/tools/:key ─────────────────────────────────────────────────────

describe('DELETE /api/tools/:key', () => {
  it('returns 404 for unknown tool key', async () => {
    const res = await request(app).delete('/api/tools/not-a-real-tool').set(AUTH);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Unknown tool key');
  });

  it('removes tool and returns updated ToolsResponse with empty my_toolkit', async () => {
    // delete chain
    const eq2 = vi.fn().mockResolvedValue({ error: null });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const deleteFn = vi.fn().mockReturnValue({ eq: eq1 });
    mockFrom.mockReturnValueOnce({ delete: deleteFn } as never);
    // response calls
    mockGetToolsRoute([]);

    const res = await request(app).delete('/api/tools/justinguitar').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.my_toolkit).toHaveLength(0);
  });
});
