import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();
router.use(requireAuth);

// GET /api/resources — all resources joined with user's completion %
router.get('/', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const [resourcesRes, completionsRes] = await Promise.all([
    supabase
      .from('resources')
      .select('id, phase_index, title, url, description, type, is_featured, sort_order')
      .order('phase_index', { ascending: true })
      .order('sort_order', { ascending: true }),
    supabase
      .from('resource_completions')
      .select('resource_id, completion')
      .eq('user_id', userId),
  ]);

  if (resourcesRes.error) {
    res.status(500).json({ error: resourcesRes.error.message });
    return;
  }

  const completionMap: Record<string, number> = {};
  (completionsRes.data ?? []).forEach((c) => {
    completionMap[c.resource_id] = c.completion;
  });

  const data = (resourcesRes.data ?? []).map((r) => ({
    ...r,
    completion: completionMap[r.id] ?? 0,
  }));

  res.json(data);
});

// PATCH /api/resources/:id — upsert completion %
const completionSchema = z.object({
  completion: z.number().int().min(0).max(100),
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const parsed = completionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userId = req.user!.id;
  const resourceId = req.params.id;

  const { data, error } = await supabase
    .from('resource_completions')
    .upsert(
      { user_id: userId, resource_id: resourceId, completion: parsed.data.completion },
      { onConflict: 'user_id,resource_id' }
    )
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

export default router;
