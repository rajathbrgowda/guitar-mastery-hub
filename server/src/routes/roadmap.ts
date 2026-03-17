import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();
router.use(requireAuth);

// GET /api/roadmap — all phases + skills for user's active curriculum (v2)
router.get('/', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  // 1. Get user profile
  const { data: user } = await supabase
    .from('users')
    .select('current_phase, selected_curriculum_key')
    .eq('id', userId)
    .single();

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const curriculumKey: string = user.selected_curriculum_key ?? 'best_of_all';
  const currentPhase: number = user.current_phase ?? 1;

  // 2. Get curriculum source + name — fallback to best_of_all if inactive or missing
  let { data: curriculumSource } = await supabase
    .from('curriculum_sources')
    .select('id, name, style')
    .eq('key', curriculumKey)
    .eq('is_active', true)
    .single();

  if (!curriculumSource && curriculumKey !== 'best_of_all') {
    const { data: fallback } = await supabase
      .from('curriculum_sources')
      .select('id, name, style')
      .eq('key', 'best_of_all')
      .eq('is_active', true)
      .single();
    curriculumSource = fallback;
  }

  if (!curriculumSource) {
    res.status(503).json({ error: 'No active curriculum available' });
    return;
  }

  const currSource = curriculumSource as { id: string; name: string; style: string | null };
  const curriculumName: string = currSource.name;
  const curriculumStyle: string | null = currSource.style ?? null;

  // 3. Get all curriculum skill entries with skill details + phase_title
  const { data: entries, error } = await supabase
    .from('curriculum_skill_entries')
    .select(
      'phase_number, phase_title, sort_order, practice_tip, common_mistake, practice_exercise, video_youtube_id, video_title, skills ( id, key, title, category, is_song, song_artist )',
    )
    .eq('curriculum_id', curriculumSource.id)
    .order('phase_number', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // 4. Get user's skill progress (including completed_at for date tracking)
  const { data: progressRows } = await supabase
    .from('skill_progress')
    .select('skill_id, completed, confidence, completed_at')
    .eq('user_id', userId)
    .eq('curriculum_key', curriculumKey);

  type ProgressEntry = {
    completed: boolean;
    confidence: number | null;
    completed_at: string | null;
  };
  const progressMap = new Map<string, ProgressEntry>();
  for (const row of progressRows ?? []) {
    progressMap.set(row.skill_id as string, {
      completed: row.completed as boolean,
      confidence: (row.confidence as number | null) ?? null,
      completed_at: (row.completed_at as string | null) ?? null,
    });
  }

  // 5. Get last_practiced_at per skill — use practice_sessions sections matching by title
  // (sections JSONB stores { name: "Skill Title", duration_min })
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('sections, date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(90);

  const lastPracticedMap = new Map<string, string>();
  for (const session of sessions ?? []) {
    const sects = (session.sections as Array<{ name: string }>) ?? [];
    for (const s of sects) {
      if (!lastPracticedMap.has(s.name)) {
        lastPracticedMap.set(s.name, session.date as string);
      }
    }
  }

  // 6. Calculate skills_per_week (4-week lookback average)
  const { data: recentCompletions } = await supabase
    .from('skill_progress')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('curriculum_key', curriculumKey)
    .eq('completed', true)
    .not('completed_at', 'is', null);

  let skillsPerWeek: number | null = null;
  if (recentCompletions && recentCompletions.length > 0) {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentCount = recentCompletions.filter((r) => {
      const d = new Date(r.completed_at as string);
      return d >= fourWeeksAgo;
    }).length;

    // Only show pace if user has at least 7 days of data (earliest completed_at >= 7 days ago)
    const allDates = recentCompletions
      .map((r) => new Date(r.completed_at as string).getTime())
      .sort();
    const earliest = allDates[0];
    const daysSinceFirst = (Date.now() - earliest) / (1000 * 60 * 60 * 24);
    if (daysSinceFirst >= 7) {
      skillsPerWeek = Math.round((recentCount / 4) * 10) / 10; // 1 decimal
    }
  }

  // 7. Build RoadmapPhase array with v2 fields
  type EntryRow = {
    phase_number: number;
    phase_title: string;
    sort_order: number;
    practice_tip: string | null;
    common_mistake: string | null;
    practice_exercise: string | null;
    video_youtube_id: string | null;
    video_title: string | null;
    skills: {
      id: string;
      key: string;
      title: string;
      category: string;
      is_song: boolean;
      song_artist: string | null;
    } | null;
  };

  type SkillRow = {
    skill_id: string;
    skill_key: string;
    skill_title: string;
    skill_category: string;
    practice_tip: string | null;
    common_mistake: string | null;
    practice_exercise: string | null;
    video_youtube_id: string | null;
    video_title: string | null;
    completed: boolean;
    confidence: number | null;
    last_practiced_at: string | null;
    is_song: boolean;
    song_artist: string | null;
  };

  type PhaseAccumulator = {
    phase_number: number;
    phase_title: string;
    skills: SkillRow[];
    total_skills: number;
    completed_skills: number;
    completion_pct: number;
    started_at: string | null;
    completed_at: string | null;
    focus_skill: SkillRow | null;
  };

  const phases: PhaseAccumulator[] = [];
  const phaseNumbersSeen = new Set<number>();

  for (const entry of (entries ?? []) as unknown as EntryRow[]) {
    const skill = entry.skills;
    if (!skill) continue;

    const phaseNum = entry.phase_number;
    if (!phaseNumbersSeen.has(phaseNum)) {
      phaseNumbersSeen.add(phaseNum);
      phases.push({
        phase_number: phaseNum,
        phase_title: entry.phase_title,
        skills: [],
        total_skills: 0,
        completed_skills: 0,
        completion_pct: 0,
        started_at: null,
        completed_at: null,
        focus_skill: null,
      });
    }

    const phase = phases.find((p) => p.phase_number === phaseNum)!;
    const progress = progressMap.get(skill.id);
    const completed = progress?.completed ?? false;
    const confidence = progress?.confidence ?? null;

    phase.skills.push({
      skill_id: skill.id,
      skill_key: skill.key,
      skill_title: skill.title,
      skill_category: skill.category,
      practice_tip: entry.practice_tip,
      common_mistake: entry.common_mistake,
      practice_exercise: entry.practice_exercise,
      video_youtube_id: entry.video_youtube_id,
      video_title: entry.video_title,
      completed,
      confidence,
      last_practiced_at: lastPracticedMap.get(skill.title) ?? null,
      is_song: skill.is_song ?? false,
      song_artist: skill.song_artist ?? null,
    });

    phase.total_skills++;
    if (completed) phase.completed_skills++;
  }

  // 8. Compute completion_pct, started_at, completed_at, focus_skill for each phase
  for (const phase of phases) {
    phase.completion_pct =
      phase.total_skills > 0 ? Math.round((phase.completed_skills / phase.total_skills) * 100) : 0;

    // started_at = earliest completed_at among skills in this phase
    // completed_at = latest completed_at, but ONLY if all skills are completed
    const completionDates: string[] = [];
    for (const sk of phase.skills) {
      const prog = progressMap.get(sk.skill_id);
      if (prog?.completed_at) {
        completionDates.push(prog.completed_at);
      }
    }

    if (completionDates.length > 0) {
      completionDates.sort();
      phase.started_at = completionDates[0];
      if (phase.completed_skills === phase.total_skills) {
        phase.completed_at = completionDates[completionDates.length - 1];
      }
    }

    // focus_skill — only for current phase, pick lowest-confidence incomplete skill
    if (phase.phase_number === currentPhase) {
      const incompleteSkills = phase.skills.filter((s) => !s.completed);
      if (incompleteSkills.length > 0) {
        // Sort: confidence 1 (Hard) first, then 2 (Okay), then null (no rating)
        // Tiebreak: first by sort order (already in order from DB)
        const sorted = [...incompleteSkills].sort((a, b) => {
          const ca = a.confidence ?? 4; // null → treat as lowest priority
          const cb = b.confidence ?? 4;
          return ca - cb;
        });
        phase.focus_skill = sorted[0];
      }
    }
  }

  res.json({
    phases,
    current_phase: currentPhase,
    curriculum_key: curriculumKey,
    curriculum_name: curriculumName,
    curriculum_style: curriculumStyle,
    skills_per_week: skillsPerWeek,
  });
});

const confidenceSchema = z.object({
  confidence: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

const skillKeySchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9_]+$/, 'Skill key must be lowercase alphanumeric with underscores');

// PATCH /api/roadmap/skill/:key/confidence
router.patch('/skill/:key/confidence', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  // Validate skill key format
  const keyParsed = skillKeySchema.safeParse(req.params.key);
  if (!keyParsed.success) {
    res.status(422).json({ error: 'Invalid skill key format' });
    return;
  }
  const skillKey = keyParsed.data;

  const parsed = confidenceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'confidence must be 1, 2, or 3' });
    return;
  }

  // Get user curriculum
  const { data: user } = await supabase
    .from('users')
    .select('selected_curriculum_key')
    .eq('id', userId)
    .single();
  const curriculumKey: string = user?.selected_curriculum_key ?? 'best_of_all';

  // Validate skill exists in the skills table
  const { data: skill } = await supabase.from('skills').select('id').eq('key', skillKey).single();

  if (!skill) {
    res.status(422).json({ error: `Skill '${skillKey}' does not exist` });
    return;
  }

  // Update confidence on existing row, or return 404 if no row exists
  const { data: existing } = await supabase
    .from('skill_progress')
    .select('id, phase_index, skill_index')
    .eq('user_id', userId)
    .eq('skill_id', skill.id)
    .eq('curriculum_key', curriculumKey)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('skill_progress')
      .update({ confidence: parsed.data.confidence })
      .eq('id', existing.id);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
  } else {
    // Row doesn't exist yet — user must complete skill first
    res.status(404).json({ error: 'Complete this skill first before rating confidence' });
    return;
  }

  res.json({ success: true });
});

export default router;
