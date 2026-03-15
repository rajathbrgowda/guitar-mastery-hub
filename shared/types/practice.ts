export interface PracticeSection {
  name: string;
  duration_min: number;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  date: string;
  duration_min: number;
  sections: PracticeSection[] | null;
  notes: string | null;
  confidence: 1 | 2 | 3 | null;
  created_at: string;
}

export interface NewSession {
  date: string;
  duration_min: number;
  sections?: PracticeSection[];
  notes?: string;
  confidence?: 1 | 2 | 3;
}
