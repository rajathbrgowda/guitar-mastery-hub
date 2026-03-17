/**
 * Public milestone endpoint — CARD-497
 * GET /api/public/milestones/:userId/latest
 * No auth required. Returns non-PII fields only.
 * Cache-Control: max-age=60
 * Rate limit: 10 req/min per IP (in-memory)
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import type { PublicMilestoneResponse } from '@gmh/shared/types/milestones';

const router = Router();

// In-memory rate limiter: IP → { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// Periodically purge expired entries to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

router.get('/:userId/latest', async (req: Request, res: Response) => {
  const clientIp =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
    req.socket.remoteAddress ??
    'unknown';

  if (isRateLimited(clientIp)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }

  const { userId } = req.params;
  if (!userId || typeof userId !== 'string' || userId.length > 64) {
    res.status(400).json({ error: 'Invalid userId' });
    return;
  }

  // 1. Get user's current_phase and curriculum key
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('current_phase, selected_curriculum_key')
    .eq('id', userId)
    .single();

  if (userErr || !user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const currentPhase: number = user.current_phase ?? 1;
  const curriculumKey: string = user.selected_curriculum_key ?? 'best_of_all';

  // current_phase = the phase the user is ON; phases before it are completed
  if (currentPhase <= 1) {
    res.status(404).json({ error: 'No completed phases yet' });
    return;
  }

  const latestCompletedPhaseNum = currentPhase - 1;

  // 2. Get curriculum source for name
  const { data: currSource } = await supabase
    .from('curriculum_sources')
    .select('id, name')
    .eq('key', curriculumKey)
    .eq('is_active', true)
    .single();

  const curriculumName: string = currSource?.name ?? 'Guitar Mastery Hub';
  const curriculumId: string | null = currSource?.id ?? null;

  // 3. Get phase title and skill count from curriculum_skill_entries
  let phaseTitle = `Phase ${latestCompletedPhaseNum}`;
  let skillsCount = 0;

  if (curriculumId) {
    const { data: entries } = await supabase
      .from('curriculum_skill_entries')
      .select('phase_title')
      .eq('curriculum_id', curriculumId)
      .eq('phase_number', latestCompletedPhaseNum);

    if (entries && entries.length > 0) {
      phaseTitle = (entries[0] as { phase_title: string }).phase_title ?? phaseTitle;
      skillsCount = entries.length;
    }
  }

  // 4. Get completed_at — latest completed_at for skills in this phase from skill_progress
  // Use curriculum_skill_entries → skill_id join
  let completedAt: string | null = null;

  if (curriculumId) {
    const { data: skillEntries } = await supabase
      .from('curriculum_skill_entries')
      .select('skill_id')
      .eq('curriculum_id', curriculumId)
      .eq('phase_number', latestCompletedPhaseNum);

    if (skillEntries && skillEntries.length > 0) {
      const skillIds = (skillEntries as Array<{ skill_id: string }>)
        .map((e) => e.skill_id)
        .filter(Boolean);

      if (skillIds.length > 0) {
        const { data: progressRows } = await supabase
          .from('skill_progress')
          .select('completed_at')
          .eq('user_id', userId)
          .eq('curriculum_key', curriculumKey)
          .eq('completed', true)
          .in('skill_id', skillIds)
          .order('completed_at', { ascending: false })
          .limit(1);

        completedAt =
          (progressRows?.[0] as { completed_at: string } | undefined)?.completed_at ?? null;
      }
    }
  }

  const response: PublicMilestoneResponse = {
    phase_number: latestCompletedPhaseNum,
    phase_title: phaseTitle,
    curriculum_name: curriculumName,
    skills_count: skillsCount,
    completed_at: completedAt,
  };

  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json(response);
});

export default router;
