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
