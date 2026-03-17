import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();
router.use(requireAuth);

const skillKeyPattern = /^[a-z0-9_]+$/;
const BUCKET = 'skill-recordings';

const createSchema = z.object({
  duration_sec: z.number().int().min(0).max(600).optional(),
  notes: z.string().max(500).nullable().optional(),
  content_type: z.string().regex(/^(audio|video)\//, 'Must be audio/* or video/*'),
});

// POST /api/skills/:key/recordings — get presigned upload URL
router.post('/:key/recordings', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const skillKey = req.params.key as string;

  if (!skillKeyPattern.test(skillKey)) {
    res.status(400).json({ error: 'Invalid skill key format' });
    return;
  }

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Validation error' });
    return;
  }

  const { duration_sec, notes, content_type } = parsed.data;

  // Get user's curriculum
  const { data: user } = await supabase
    .from('users')
    .select('selected_curriculum_key')
    .eq('id', userId)
    .single();
  const curriculumKey = user?.selected_curriculum_key ?? 'best_of_all';

  // Generate storage path: {user_id}/{skill_key}/{timestamp}.ext
  const ext = content_type.startsWith('video/') ? 'webm' : 'webm';
  const storagePath = `${userId}/${skillKey}/${Date.now()}.${ext}`;

  // Create presigned upload URL
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath);

  if (uploadError) {
    res.status(500).json({ error: 'Failed to create upload URL: ' + uploadError.message });
    return;
  }

  // Insert recording row
  const { data: recording, error: dbError } = await supabase
    .from('skill_recordings')
    .insert({
      user_id: userId,
      skill_key: skillKey,
      curriculum_key: curriculumKey,
      storage_path: storagePath,
      duration_sec: duration_sec ?? null,
      notes: notes ?? null,
      content_type,
    })
    .select('id')
    .single();

  if (dbError) {
    res.status(500).json({ error: dbError.message });
    return;
  }

  res.status(201).json({
    recording_id: recording.id,
    upload_url: uploadData.signedUrl,
  });
});

// GET /api/skills/:key/recordings — list recordings with signed playback URLs
router.get('/:key/recordings', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const skillKey = req.params.key as string;

  if (!skillKeyPattern.test(skillKey)) {
    res.status(400).json({ error: 'Invalid skill key format' });
    return;
  }

  const { data, error } = await supabase
    .from('skill_recordings')
    .select(
      'id, skill_key, curriculum_key, storage_path, duration_sec, notes, content_type, recorded_at',
    )
    .eq('user_id', userId)
    .eq('skill_key', skillKey)
    .order('recorded_at', { ascending: false })
    .limit(10);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Generate signed playback URLs (1 hour expiry)
  const recordings = await Promise.all(
    (data ?? []).map(async (row) => {
      const { data: signedData } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(row.storage_path as string, 3600);
      return {
        id: row.id,
        skill_key: row.skill_key,
        curriculum_key: row.curriculum_key,
        duration_sec: row.duration_sec,
        notes: row.notes,
        content_type: row.content_type,
        recorded_at: row.recorded_at,
        playback_url: signedData?.signedUrl ?? null,
      };
    }),
  );

  res.json({ recordings });
});

// DELETE /api/skills/:key/recordings/:id
router.delete('/:key/recordings/:id', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const recordingId = req.params.id as string;

  // Fetch recording, verify ownership
  const { data: recording } = await supabase
    .from('skill_recordings')
    .select('id, user_id, storage_path')
    .eq('id', recordingId)
    .single();

  if (!recording) {
    res.status(404).json({ error: 'Recording not found' });
    return;
  }

  if ((recording.user_id as string) !== userId) {
    res.status(403).json({ error: 'Not authorized to delete this recording' });
    return;
  }

  // Delete from storage
  await supabase.storage.from(BUCKET).remove([recording.storage_path as string]);

  // Delete from DB
  await supabase.from('skill_recordings').delete().eq('id', recordingId);

  res.status(204).send();
});

export default router;
