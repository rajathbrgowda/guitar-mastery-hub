import type { ConfidenceRating } from './practice-plan';

export type MasteryState = 'not_started' | 'learning' | 'mastered' | 'rusty';

export interface MasteryNode {
  skill_key: string;
  title: string;
  phase_index: number;
  skill_index: number;
  mastery_state: MasteryState;
  last_practiced_at: string | null;
  confidence_history: ConfidenceRating[];
  youtube_id: string | null;
  practice_tip: string | null;
}

export interface PhaseNodes {
  phase_index: number;
  phase_title: string;
  nodes: MasteryNode[];
}

export interface MasteryMapResponse {
  phases: PhaseNodes[];
  rusty_count: number;
}

export interface RustyCheckResponse {
  updated_count: number;
}
