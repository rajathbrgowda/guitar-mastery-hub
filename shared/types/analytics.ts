export interface AnalyticsDay {
  date: string;
  duration_min: number;
}

export interface WeakSpot {
  skill_key: string;
  skill_title: string;
  skill_category: string;
  practice_count_last7: number;
}

export interface AnalyticsSummary {
  totalMins: number;
  totalSessions: number;
  streak: number;
  currentPhase: number;
  last7: AnalyticsDay[];
  weakSpots: WeakSpot[];
}

export interface AnalyticsHistoryEntry {
  date: string;
  duration_min: number;
}

export interface StreakResponse {
  streak: number;
}
