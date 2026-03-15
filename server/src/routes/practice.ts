import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import { logSessionSchema } from '../schemas/practice';

const router = Router();
router.use(requireAuth);

// GET /api/practice?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { from, to } = req.query;

  let query = supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (typeof from === 'string') query = query.gte('date', from);
  if (typeof to === 'string') query = query.lte('date', to);

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// POST /api/practice
router.post('/', async (req: AuthRequest, res) => {
  const parsed = logSessionSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { date, duration_min, sections, notes, confidence } = parsed.data;

  const { data, error } = await supabase
    .from('practice_sessions')
    .insert({
      user_id: req.user!.id,
      date,
      duration_min,
      sections: sections ?? null,
      notes: notes ?? null,
      confidence: confidence ?? null,
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

export default router;
