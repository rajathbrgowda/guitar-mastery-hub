import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();
router.use(requireAuth);

const skillKeyPattern = /^[a-z0-9_]+$/;

const postBpmSchema = z.object({
  skill_key: z.string().min(1).max(100).regex(skillKeyPattern, 'Invalid skill key'),
  bpm: z.number().int().min(1).max(399),
});

// POST /api/analytics/bpm — log a BPM reading
router.post('/', async (req: AuthRequest, res) => {
  const parsed = postBpmSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Validation error' });
    return;
  }

  const { skill_key, bpm } = parsed.data;
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from('bpm_logs')
    .insert({ user_id: userId, skill_key, bpm })
    .select('id, skill_key, bpm, logged_at')
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

const getBpmSchema = z.object({
  skill_key: z.string().min(1).max(100).regex(skillKeyPattern, 'Invalid skill key'),
});

// GET /api/analytics/bpm?skill_key=X — BPM history for a skill
router.get('/', async (req: AuthRequest, res) => {
  const parsed = getBpmSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'skill_key query parameter is required' });
    return;
  }

  const { skill_key } = parsed.data;
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from('bpm_logs')
    .select('id, bpm, logged_at')
    .eq('user_id', userId)
    .eq('skill_key', skill_key)
    .order('logged_at', { ascending: true })
    .limit(50);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const logs = data ?? [];
  const bpms = logs.map((l) => l.bpm as number);
  const minBpm = bpms.length > 0 ? Math.min(...bpms) : null;
  const maxBpm = bpms.length > 0 ? Math.max(...bpms) : null;
  const latestBpm = bpms.length > 0 ? bpms[bpms.length - 1] : null;

  res.json({ skill_key, logs, min_bpm: minBpm, max_bpm: maxBpm, latest_bpm: latestBpm });
});

export default router;
