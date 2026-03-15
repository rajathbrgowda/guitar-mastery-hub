export interface PublicStats {
  total_users: number;
  total_sessions: number;
  total_practice_minutes: number;
  active_streaks: number;
}

export interface PublicStatsResponse {
  stats: PublicStats;
  generated_at: string;
}
