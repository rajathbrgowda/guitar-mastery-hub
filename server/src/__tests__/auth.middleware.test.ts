import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock supabase before app imports so the env-var guard never runs
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import app from '../app';
import { supabase } from '../lib/supabase';

const mockGetUser = vi.mocked(supabase.auth.getUser);

beforeEach(() => {
  mockGetUser.mockReset();
});

describe('Auth middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/practice');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Missing or invalid/i);
  });

  it('returns 401 when Authorization header does not start with Bearer', async () => {
    const res = await request(app)
      .get('/api/practice')
      .set('Authorization', 'Token abc123');
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid token' } } as never);
    const res = await request(app)
      .get('/api/practice')
      .set('Authorization', 'Bearer bad-token');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Invalid or expired/i);
  });

  it('passes through to the route handler when token is valid', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@test.com' } },
      error: null,
    } as never);

    // Mock the supabase query chain for GET /api/practice
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockLte = vi.fn().mockReturnValue({ order: mockOrder });
    const mockGte = vi.fn().mockReturnValue({ lte: mockLte, order: mockOrder });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder, gte: mockGte });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

    const res = await request(app)
      .get('/api/practice')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
  });
});
