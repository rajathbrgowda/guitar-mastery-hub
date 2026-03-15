export interface AnalyticsDay {
  date: string;
  duration_min: number;
}

export interface AnalyticsSummary {
  totalMins: number;
  totalSessions: number;
  streak: number;
  currentPhase: number;
  last7: AnalyticsDay[];
}

export interface AnalyticsHistoryEntry {
  date: string;
  duration_min: number;
}

export interface StreakResponse {
  streak: number;
}
