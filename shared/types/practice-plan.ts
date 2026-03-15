/** 1 = hard, 2 = okay, 3 = easy */
export type ConfidenceRating = 1 | 2 | 3;

export interface PracticePlanItem {
  id: string;
  plan_id: string;
  skill_id: string | null;
  skill_title: string;
  skill_category: string;
  duration_min: number;
  sort_order: number;
  video_youtube_id: string | null;
  practice_tip: string | null;
  completed: boolean;
  completed_at: string | null;
  actual_duration_min: number | null;
  confidence_rating: ConfidenceRating | null;
}

export interface DailyPracticePlan {
  id: string;
  user_id: string;
  plan_date: string;
  curriculum_key: string;
  total_duration_min: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  generated_at: string;
  started_at: string | null;
  completed_at: string | null;
  items: PracticePlanItem[];
}

export interface CompletePlanItemBody {
  actual_duration_min?: number;
  confidence_rating?: ConfidenceRating;
}

export interface SkipPlanBody {
  reason?: string;
}
