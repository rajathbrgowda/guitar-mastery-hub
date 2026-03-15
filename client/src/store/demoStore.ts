/**
 * demoStore — pre-hydrated read-only store for /demo route.
 * No API calls. Mirrors the shape of practiceStore + progressStore.
 * Used by Demo.tsx to render a realistic dashboard without auth.
 */

import { create } from 'zustand';
import type { PracticeSession } from '../types/practice';
import type { SkillProgress } from '../types/progress';

// ── Seed data ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const DEMO_SESSIONS: PracticeSession[] = [
  { id: 'd1', user_id: 'demo', date: daysAgo(0),  duration_min: 22, notes: 'F chord finally clicking.', sections: [{ name: 'Warm-up', duration_min: 5 }, { name: 'Chords', duration_min: 12 }, { name: 'Song', duration_min: 5 }], created_at: daysAgo(0) },
  { id: 'd2', user_id: 'demo', date: daysAgo(1),  duration_min: 18, notes: 'Worked on chord changes, smoother now.', sections: [{ name: 'Chords', duration_min: 10 }, { name: 'Fingerpicking', duration_min: 8 }], created_at: daysAgo(1) },
  { id: 'd3', user_id: 'demo', date: daysAgo(2),  duration_min: 30, notes: 'Long session. JG Grade 1 full run.', sections: [{ name: 'Warm-up', duration_min: 5 }, { name: 'Chords', duration_min: 12 }, { name: 'Theory', duration_min: 8 }, { name: 'Song', duration_min: 5 }], created_at: daysAgo(2) },
  { id: 'd4', user_id: 'demo', date: daysAgo(3),  duration_min: 15, notes: 'Short session, just scales.', sections: [{ name: 'Scales', duration_min: 15 }], created_at: daysAgo(3) },
  { id: 'd5', user_id: 'demo', date: daysAgo(4),  duration_min: 25, notes: 'Strumming patterns — getting more natural.', sections: [{ name: 'Strumming', duration_min: 15 }, { name: 'Song', duration_min: 10 }], created_at: daysAgo(4) },
  { id: 'd6', user_id: 'demo', date: daysAgo(6),  duration_min: 20, notes: 'Skipped yesterday but back at it.', sections: [{ name: 'Warm-up', duration_min: 5 }, { name: 'Chords', duration_min: 15 }], created_at: daysAgo(6) },
  { id: 'd7', user_id: 'demo', date: daysAgo(7),  duration_min: 28, notes: 'Nailed the intro to Wonderwall.', sections: [{ name: 'Chords', duration_min: 10 }, { name: 'Song', duration_min: 18 }], created_at: daysAgo(7) },
];

// Summary stats
export const DEMO_SUMMARY = {
  totalMins: 1_240,
  totalSessions: 47,
  streak: 14,
  currentPhase: 1, // Beginner (0-indexed)
  last7: [
    { date: daysAgo(6), duration_min: 20 },
    { date: daysAgo(5), duration_min: 0  },
    { date: daysAgo(4), duration_min: 25 },
    { date: daysAgo(3), duration_min: 15 },
    { date: daysAgo(2), duration_min: 30 },
    { date: daysAgo(1), duration_min: 18 },
    { date: daysAgo(0), duration_min: 22 },
  ],
};

// 22 skills completed across phases 0 and 1
const DEMO_SKILLS: SkillProgress[] = [
  // Phase 0 Foundation — all 11 done
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `demo-0-${i}`,
    phase_index: 0,
    skill_index: i,
    completed: true,
    completed_at: daysAgo(60 - i * 5),
  })),
  // Phase 1 Beginner — 11 of 9 done (9 available, 9 done = full) — actually 9 skills, all done
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `demo-1-${i}`,
    phase_index: 1,
    skill_index: i,
    completed: i < 6, // 6 of 9 done — in progress
    completed_at: i < 6 ? daysAgo(30 - i * 4) : null,
  })),
];

// ── Store ─────────────────────────────────────────────────────────────────────

interface DemoStoreState {
  sessions: PracticeSession[];
  skills: SkillProgress[];
  currentPhase: number;
  summary: typeof DEMO_SUMMARY;
}

export const useDemoStore = create<DemoStoreState>(() => ({
  sessions: DEMO_SESSIONS,
  skills: DEMO_SKILLS,
  currentPhase: DEMO_SUMMARY.currentPhase,
  summary: DEMO_SUMMARY,
}));
