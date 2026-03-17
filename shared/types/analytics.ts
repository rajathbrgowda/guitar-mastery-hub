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
  // Retention loop fields
  totalHours7d: number;
  totalHours30d: number;
  totalHoursAllTime: number;
  totalSessionsAllTime: number;
  avgSessionMin30d: number;
  graceAvailable: boolean;
  graceUsed: boolean;
}

export interface AnalyticsHistoryEntry {
  date: string;
  duration_min: number;
}

export interface StreakResponse {
  streak: number;
}

export interface SkillInsight {
  skill_id: string;
  skill_key: string;
  skill_title: string;
  skill_category: string;
  avg_confidence: number | null; // null = never rated
  practice_count: number; // rated sessions in last 14 days
  last_practiced_at: string | null;
}

export interface WeeklyDigest {
  week_start: string; // YYYY-MM-DD (7 days ago)
  sessions_count: number;
  total_mins: number;
  days_practiced: number;
  top_skill_title: string | null;
}

export interface InsightsSummary {
  weakSkills: SkillInsight[]; // avg_confidence < 1.7
  strongSkills: SkillInsight[]; // avg_confidence > 2.5 AND count >= 3
  weeklyDigest: WeeklyDigest;
  focusSkill: SkillInsight | null; // top weak skill for plan prioritisation
}

export interface SkillAnalytics {
  skill_id: string;
  skill_key: string;
  skill_title: string;
  skill_category: string;
  total_duration_min: number;
  avg_confidence: number | null;
  practice_count: number;
  last_5_ratings: number[]; // 1|2|3, most recent last
}

export interface AnalyticsSkillsResponse {
  skills: SkillAnalytics[];
  by_category: Record<string, number>; // category key → total_duration_min
}

export interface WeeklyHeatmapDay {
  date: string; // YYYY-MM-DD
  duration_min: number;
  week: number; // 0-51 (column in 52-week grid)
  day_of_week: number; // 0=Sun … 6=Sat
}

export interface ConfidenceTrendPoint {
  date: string; // YYYY-MM-DD
  avg_confidence: number; // 1-3
  session_count: number;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_practiced: string | null; // YYYY-MM-DD
  at_risk: boolean; // true if practiced yesterday but NOT today yet
}

export interface InsightCard {
  type: 'best_day' | 'most_practiced' | 'consistency' | 'milestone';
  title: string;
  body: string;
  value: string | number | null;
}
