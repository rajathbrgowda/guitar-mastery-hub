export interface BpmLog {
  id: string;
  skill_key: string;
  bpm: number;
  logged_at: string;
}

export interface BpmHistoryResponse {
  skill_key: string;
  logs: BpmLog[];
  min_bpm: number | null;
  max_bpm: number | null;
  latest_bpm: number | null;
}

export interface ConfidenceTrendEntry {
  skill_key: string;
  skill_title: string;
  ratings: { date: string; confidence: number }[];
}

export interface ConfidenceTrendsResponse {
  skills: ConfidenceTrendEntry[];
}
