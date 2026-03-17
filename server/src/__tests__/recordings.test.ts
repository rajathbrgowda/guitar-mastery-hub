import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
    storage: { from: vi.fn() },
  },
}));

import app from '../app';
import { supabase } from '../lib/supabase';

const mockGetUser = vi.mocked(supabase.auth.getUser);
const mockFrom = vi.mocked(supabase.from);
const mockStorageFrom = vi.mocked(supabase.storage.from);

const AUTH = { Authorization: 'Bearer valid-token' };

beforeEach(() => {
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-rec', email: 'rec@test.com' } },
    error: null,
  } as never);
  mockFrom.mockReset();
  mockStorageFrom.mockReset();
});

describe('POST /api/skills/:key/recordings', () => {
  it('201 with valid body — returns recording_id and upload_url', async () => {
    // Mock users query
    const userSingle = vi.fn().mockResolvedValue({
      data: { selected_curriculum_key: 'best_of_all' },
      error: null,
    });
    // Mock storage.createSignedUploadUrl
    mockStorageFrom.mockReturnValue({
      createSignedUploadUrl: vi.fn().mockResolvedValue({
        data: { signedUrl: 'https://storage.example.com/upload?token=xyz' },
        error: null,
      }),
    } as never);

    // Mock DB insert
    const insertSingle = vi.fn().mockResolvedValue({
      data: { id: 'rec-1' },
      error: null,
    });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // users
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ single: userSingle }),
          }),
        } as never;
      }
      // skill_recordings insert
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ single: insertSingle }),
        }),
      } as never;
    });

    const res = await request(app)
      .post('/api/skills/pentatonic_scale/recordings')
      .set(AUTH)
      .send({ content_type: 'audio/webm' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('recording_id');
    expect(res.body).toHaveProperty('upload_url');
  });

  it('400 on invalid content_type', async () => {
    const res = await request(app)
      .post('/api/skills/chord_em/recordings')
      .set(AUTH)
      .send({ content_type: 'text/plain' });
    expect(res.status).toBe(400);
  });

  it('400 on invalid skill_key', async () => {
    const res = await request(app)
      .post('/api/skills/INVALID-KEY/recordings')
      .set(AUTH)
      .send({ content_type: 'audio/webm' });
    expect(res.status).toBe(400);
  });

  it('401 without auth', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no' } } as never);
    const res = await request(app)
      .post('/api/skills/chord_em/recordings')
      .send({ content_type: 'audio/webm' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/skills/:key/recordings', () => {
  it('returns recordings array with signed URLs', async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'r1',
          skill_key: 'chord_em',
          curriculum_key: 'best_of_all',
          storage_path: 'user-rec/chord_em/123.webm',
          duration_sec: 30,
          notes: 'first try',
          content_type: 'audio/webm',
          recorded_at: '2026-03-16T00:00:00Z',
        },
      ],
      error: null,
    });
    const order = vi.fn().mockReturnValue({ limit });
    const eq: ReturnType<typeof vi.fn> = vi.fn();
    eq.mockReturnValue({ eq, order });
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue({ eq }) } as never);

    mockStorageFrom.mockReturnValue({
      createSignedUrl: vi.fn().mockResolvedValue({
        data: { signedUrl: 'https://storage.example.com/play?token=abc' },
        error: null,
      }),
    } as never);

    const res = await request(app).get('/api/skills/chord_em/recordings').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.recordings).toHaveLength(1);
    expect(res.body.recordings[0]).toHaveProperty('playback_url');
  });

  it('returns empty array when no recordings', async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const order = vi.fn().mockReturnValue({ limit });
    const eq: ReturnType<typeof vi.fn> = vi.fn();
    eq.mockReturnValue({ eq, order });
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnValue({ eq }) } as never);

    const res = await request(app).get('/api/skills/chord_em/recordings').set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.recordings).toEqual([]);
  });
});

describe('DELETE /api/skills/:key/recordings/:id', () => {
  it('204 when owner deletes', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: 'r1', user_id: 'user-rec', storage_path: 'user-rec/chord_em/123.webm' },
      error: null,
    });
    const deleteEq = vi.fn().mockResolvedValue({ error: null });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // SELECT recording
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ single }),
          }),
        } as never;
      }
      // DELETE row
      return {
        delete: vi.fn().mockReturnValue({ eq: deleteEq }),
      } as never;
    });

    mockStorageFrom.mockReturnValue({
      remove: vi.fn().mockResolvedValue({ error: null }),
    } as never);

    const res = await request(app).delete('/api/skills/chord_em/recordings/r1').set(AUTH);
    expect(res.status).toBe(204);
  });

  it('403 when not owner', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: 'r1', user_id: 'other-user', storage_path: 'other/path.webm' },
      error: null,
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single }),
      }),
    } as never);

    const res = await request(app).delete('/api/skills/chord_em/recordings/r1').set(AUTH);
    expect(res.status).toBe(403);
  });
});
