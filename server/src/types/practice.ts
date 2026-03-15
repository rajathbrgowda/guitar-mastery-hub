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
  created_at: string;
}
