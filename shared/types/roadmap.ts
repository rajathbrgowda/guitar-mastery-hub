import type { ConfidenceRating } from './practice-plan';

export interface RoadmapSkill {
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
  confidence: ConfidenceRating | null;
  last_practiced_at: string | null;
  is_song?: boolean;
}

export interface RoadmapPhase {
  phase_number: number;
  phase_title: string;
  skills: RoadmapSkill[];
  total_skills: number;
  completed_skills: number;
  completion_pct: number; // 0-100
  started_at: string | null; // earliest practice date for a skill in this phase
  completed_at: string | null; // when all skills in phase were completed (null if incomplete)
  focus_skill: RoadmapSkill | null; // lowest-confidence incomplete skill (current phase only)
}

export interface RoadmapResponse {
  phases: RoadmapPhase[];
  current_phase: number;
  curriculum_key: string;
  curriculum_name: string;
  curriculum_style: string | null; // 'structured' | 'song-first' | null
  skills_per_week: number | null; // 4-week lookback average; null if < 7 days of data
}
