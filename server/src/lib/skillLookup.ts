/**
 * skillLookup.ts — maps between skill_progress coordinates and skill_id UUIDs.
 *
 * DATA INTEGRITY NOTE (DI-003)
 * ─────────────────────────────────────────────────────────────────────────────
 * Two parallel skill identification systems exist in this DB:
 *
 *   skill_progress.skill_index  — 0-based integer position within a phase.
 *                                  Written by the Roadmap/SkillTree toggleSkill flow.
 *
 *   daily_practice_plan_items.skill_id  — UUID FK to skills table.
 *                                         Written by the practice-plan generation flow.
 *
 * These cannot be directly joined. The bridge is curriculum_skill_entries:
 *   - Ordered by sort_order within a (curriculum_id, phase_number) group
 *   - The Nth entry (0-based) corresponds to skill_index = N
 *   - curriculum_skill_entries.skill_id is the UUID used in plan items
 *
 * ASSUMPTION: The curriculum was seeded so that curriculum_skill_entries rows
 * for a given phase are sorted by sort_order in the same order as the legacy
 * hardcoded CURRICULUM/SKILL_NAMES arrays. Migration 008 seeds them in order.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from './supabase';

/**
 * Returns the skill_id UUID for a given (curriculumKey, phaseIndex, skillIndex).
 * skillIndex is 0-based — it matches the array index in Roadmap/SkillTree phase.skills[].
 *
 * Returns null if the curriculum, phase, or skill position does not exist.
 */
export async function lookupSkillId(
  curriculumKey: string,
  phaseIndex: number,
  skillIndex: number,
): Promise<string | null> {
  // 1. Resolve curriculum UUID from key
  const { data: source } = await supabase
    .from('curriculum_sources')
    .select('id')
    .eq('key', curriculumKey)
    .eq('is_active', true)
    .single();

  if (!source?.id) return null;

  // 2. Fetch all skill entries for this phase ordered by sort_order
  //    Then pick the Nth entry (skillIndex = 0-based position)
  const { data: entries } = await supabase
    .from('curriculum_skill_entries')
    .select('skill_id')
    .eq('curriculum_id', source.id)
    .eq('phase_number', phaseIndex)
    .order('sort_order', { ascending: true });

  if (!entries || entries.length <= skillIndex) return null;

  return (entries[skillIndex] as { skill_id: string }).skill_id ?? null;
}

/**
 * Reverse lookup: given a skill_id UUID, returns the (phaseIndex, skillIndex)
 * coordinates used in skill_progress for the specified curriculum.
 *
 * Returns null if the skill is not found in the curriculum.
 */
export async function lookupSkillCoordinates(
  curriculumKey: string,
  skillId: string,
): Promise<{ phaseIndex: number; skillIndex: number } | null> {
  const { data: source } = await supabase
    .from('curriculum_sources')
    .select('id')
    .eq('key', curriculumKey)
    .eq('is_active', true)
    .single();

  if (!source?.id) return null;

  // Fetch all entries for this curriculum ordered by phase + sort_order
  const { data: entries } = await supabase
    .from('curriculum_skill_entries')
    .select('phase_number, skill_id')
    .eq('curriculum_id', source.id)
    .order('phase_number', { ascending: true })
    .order('sort_order', { ascending: true });

  if (!entries) return null;

  // Group by phase and find the 0-based index of the matching skill
  const byPhase = new Map<number, string[]>();
  for (const entry of entries as { phase_number: number; skill_id: string }[]) {
    const list = byPhase.get(entry.phase_number) ?? [];
    list.push(entry.skill_id);
    byPhase.set(entry.phase_number, list);
  }

  for (const [phase, skillIds] of byPhase) {
    const idx = skillIds.indexOf(skillId);
    if (idx !== -1) {
      return { phaseIndex: phase, skillIndex: idx };
    }
  }

  return null;
}
