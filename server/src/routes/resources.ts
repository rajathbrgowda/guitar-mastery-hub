import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import { resourcesResponseSchema } from '../schemas/resources';

const router = Router();
router.use(requireAuth);

// GET /api/resources — all resources enriched with user completion + recommended flag
router.get('/', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  // Get user's current phase for recommended flag
  const { data: user } = await supabase
    .from('users')
    .select('current_phase')
    .eq('id', userId)
    .single();
  const currentPhase = user?.current_phase ?? 1;

  // Get all resources
  const { data: resources, error } = await supabase
    .from('resources')
    .select('*')
    .order('phase_index', { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Get user's completions
  const { data: completions } = await supabase
    .from('resource_completions')
    .select('resource_id, completion, status')
    .eq('user_id', userId);

  const completionMap = new Map<string, { completion: number; status: string }>();
  for (const c of completions ?? []) {
    completionMap.set(c.resource_id, {
      completion: c.completion,
      status: c.status ?? 'not_started',
    });
  }

  const enriched = (resources ?? []).map((r: Record<string, unknown>) => {
    const comp = completionMap.get(r.id as string);
    return {
      ...r,
      completion: comp?.completion ?? 0,
      status: comp?.status ?? 'not_started',
      is_recommended: (r.phase_index as number) === currentPhase,
    };
  });

  const recommended = enriched.filter(
    (r) => r.is_recommended && (r as Record<string, unknown>).is_featured,
  );
  // Cap recommended at 3
  const top3Recommended = recommended.slice(0, 3);

  const payload = { recommended: top3Recommended, all: enriched };
  const parsed = resourcesResponseSchema.safeParse(payload);
  if (!parsed.success) {
    res.status(500).json({ error: 'Resource data shape invalid', details: parsed.error.flatten() });
    return;
  }

  res.json(parsed.data);
});

// PUT /api/resources/:id/completion
router.put('/:id/completion', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const resourceId = req.params.id;

  // Validate body
  const schema = z.object({
    completion: z.number().int().min(0).max(100),
    status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  // Auto-derive status if not provided
  const status =
    parsed.data.status ??
    (parsed.data.completion === 0
      ? 'not_started'
      : parsed.data.completion >= 100
        ? 'completed'
        : 'in_progress');

  const { error } = await supabase
    .from('resource_completions')
    .upsert(
      { user_id: userId, resource_id: resourceId, completion: parsed.data.completion, status },
      { onConflict: 'user_id,resource_id' },
    );

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ success: true });
});

export default router;
