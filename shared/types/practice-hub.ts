import type { PracticeSession } from './practice';

export interface PracticeWeekDay {
  date: string; // YYYY-MM-DD
  day_label: string; // 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  has_session: boolean;
  duration_min: number;
}

export interface QuickLogPayload {
  date: string;
  duration_min: number;
  notes?: string;
  confidence?: 1 | 2 | 3;
}

export interface SessionGroup {
  week_label: string;
  sessions: PracticeSession[];
}
