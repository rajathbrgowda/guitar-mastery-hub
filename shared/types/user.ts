export type ThemeKey = 'helix' | 'ocean' | 'forest' | 'violet' | 'rose';

export type ThemeMode = 'light' | 'dark';

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
  theme_mode: ThemeMode;
  selected_curriculum_key: string;
  onboarding_completed: boolean;
  streak_grace_week_used: number;
  streak_grace_week_start: string | null;
  created_at: string;
}

export type ExperienceLevel = 'beginner' | 'some' | 'intermediate';

export interface OnboardingBody {
  experience_level: ExperienceLevel;
  curriculum_key: string;
  daily_goal_min: number;
  practice_days_target: number;
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
  theme_mode?: ThemeMode;
}
