import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// GET /api/health — basic liveness (used by Render keep-alive ping)
router.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/health/db — verifies Supabase connection by querying resources table
router.get('/db', async (_req, res) => {
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, phase_index')
    .limit(3);

  if (error) {
    res.status(503).json({ status: 'error', message: error.message });
    return;
  }

  res.json({ status: 'ok', sample: data });
});

export default router;
