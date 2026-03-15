export type ThemeKey = 'helix' | 'ocean' | 'forest' | 'violet' | 'rose';

export type GuitarType = 'acoustic' | 'electric' | 'classical' | 'bass' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  guitar_type: GuitarType;
  years_playing: number;
  daily_goal_min: number;
  practice_days_target: number;
  timezone: string;
  avatar_url: string | null;
  current_phase: number;
  theme_color: ThemeKey;
  created_at: string;
}

export interface UpdateProfileBody {
  display_name?: string | null;
  guitar_type?: GuitarType;
  years_playing?: number;
  daily_goal_min?: number;
  practice_days_target?: number;
  timezone?: string;
  avatar_url?: string | null;
  theme_color?: ThemeKey;
}
