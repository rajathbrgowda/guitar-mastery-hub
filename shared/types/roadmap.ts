import type { ConfidenceRating } from './practice-plan';

export interface RoadmapSkill {
  skill_id: string;
  skill_key: string;
  skill_title: string;
  skill_category: string;
  practice_tip: string | null;
  video_youtube_id: string | null;
  completed: boolean;
  confidence: ConfidenceRating | null; // from skill_progress.confidence
  last_practiced_at: string | null; // from practice_sessions
}

export interface RoadmapPhase {
  phase_number: number;
  skills: RoadmapSkill[];
  total_skills: number;
  completed_skills: number;
  completion_pct: number; // 0-100
}

export interface RoadmapResponse {
  phases: RoadmapPhase[];
  current_phase: number;
  curriculum_key: string;
}
