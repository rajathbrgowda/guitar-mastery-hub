import { Router } from 'express';
import type { Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import type { Tool, ToolsResponse } from '@gmh/shared/types';
import { STATIC_TOOLS, PHASE_TOOL_RECOMMENDATIONS, TOOL_KEYS } from '../config/tools';

const router = Router();
router.use(requireAuth);

// GET /api/tools — static list enriched with user's is_using, with recommended for their phase
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // Fetch user's current phase + which tools they've marked
  const [{ data: userRow }, { data: userToolRows }] = await Promise.all([
    supabase.from('users').select('current_phase').eq('id', userId).single(),
    supabase.from('user_tools').select('tool_key, is_using').eq('user_id', userId),
  ]);

  const currentPhase: number = (userRow as { current_phase?: number } | null)?.current_phase ?? 0;
  const usingSet = new Set(
    ((userToolRows ?? []) as { tool_key: string; is_using: boolean }[])
      .filter((r) => r.is_using)
      .map((r) => r.tool_key),
  );

  // Build enriched tool list
  const all: Tool[] = STATIC_TOOLS.map((t) => ({ ...t, is_using: usingSet.has(t.key) }));
  const my_toolkit = all.filter((t) => t.is_using);

  // Recommended: phase-mapped tools not already in toolkit (max 2)
  const phaseIdx = Math.max(0, currentPhase - 1);
  const recommendedKeys = PHASE_TOOL_RECOMMENDATIONS[phaseIdx] ?? PHASE_TOOL_RECOMMENDATIONS[0];
  const recommended = all.filter((t) => recommendedKeys.includes(t.key) && !t.is_using);

  res.json({ my_toolkit, recommended, all } satisfies ToolsResponse);
});

// POST /api/tools/:key — add tool to user's toolkit
router.post('/:key', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;

  if (!TOOL_KEYS.has(key)) {
    res.status(404).json({ error: 'Unknown tool key' });
    return;
  }

  const { error } = await supabase
    .from('user_tools')
    .upsert({ user_id: userId, tool_key: key, is_using: true }, { onConflict: 'user_id,tool_key' });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  await sendToolsResponse(userId, res);
});

// DELETE /api/tools/:key — remove tool from user's toolkit
router.delete('/:key', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;

  if (!TOOL_KEYS.has(key)) {
    res.status(404).json({ error: 'Unknown tool key' });
    return;
  }

  await supabase.from('user_tools').delete().eq('user_id', userId).eq('tool_key', key);

  await sendToolsResponse(userId, res);
});

async function sendToolsResponse(userId: string, res: Response) {
  const [{ data: userRow }, { data: userToolRows }] = await Promise.all([
    supabase.from('users').select('current_phase').eq('id', userId).single(),
    supabase.from('user_tools').select('tool_key, is_using').eq('user_id', userId),
  ]);

  const currentPhase: number = (userRow as { current_phase?: number } | null)?.current_phase ?? 0;
  const usingSet = new Set(
    ((userToolRows ?? []) as { tool_key: string; is_using: boolean }[])
      .filter((r) => r.is_using)
      .map((r) => r.tool_key),
  );

  const all: Tool[] = STATIC_TOOLS.map((t) => ({ ...t, is_using: usingSet.has(t.key) }));
  const my_toolkit = all.filter((t) => t.is_using);
  const phaseIdx = Math.max(0, currentPhase - 1);
  const recommendedKeys = PHASE_TOOL_RECOMMENDATIONS[phaseIdx] ?? PHASE_TOOL_RECOMMENDATIONS[0];
  const recommended = all.filter((t) => recommendedKeys.includes(t.key) && !t.is_using);

  res.json({ my_toolkit, recommended, all } satisfies ToolsResponse);
}

export default router;
