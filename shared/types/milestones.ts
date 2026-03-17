export interface Milestone {
  key: string;
  title: string;
  description: string;
  category: 'sessions' | 'streak' | 'time' | 'plans';
  earned: boolean;
  earned_at: string | null; // YYYY-MM-DD approximate, null if can't determine
}

export interface MilestonesResponse {
  milestones: Milestone[];
  earned_count: number;
  total_count: number;
}

/** Returned by GET /api/public/milestones/:userId/latest — no PII */
export interface PublicMilestoneResponse {
  phase_number: number;
  phase_title: string;
  curriculum_name: string;
  skills_count: number;
  completed_at: string | null;
}
