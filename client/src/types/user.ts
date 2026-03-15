export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  guitar_type: 'acoustic' | 'electric' | 'classical' | 'bass' | 'other';
  years_playing: number;
  daily_goal_min: number;
  practice_days_target: number;
  timezone: string;
  avatar_url: string | null;
  current_phase: number;
  created_at: string;
}
