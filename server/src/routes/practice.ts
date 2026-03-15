import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();
router.use(requireAuth);

const sectionSchema = z.object({
  name: z.string().min(1),
  duration_min: z.number().int().positive(),
});

const logSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  duration_min: z.number().int().positive(),
  sections: z.array(sectionSchema).optional(),
  notes: z.string().max(1000).optional(),
});

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
  if (typeof to === 'string')   query = query.lte('date', to);

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

  const { date, duration_min, sections, notes } = parsed.data;

  const { data, error } = await supabase
    .from('practice_sessions')
    .insert({ user_id: req.user!.id, date, duration_min, sections: sections ?? null, notes: notes ?? null })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

export default router;
