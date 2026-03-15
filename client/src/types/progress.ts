export interface SkillProgress {
  id: string;
  phase_index: number;
  skill_index: number;
  completed: boolean;
  completed_at: string | null;
}

export interface ProgressState {
  skills: SkillProgress[];
  currentPhase: number;
}

export interface Skill {
  name: string;
  description?: string;
}

export interface Phase {
  title: string;
  subtitle: string;
  skills: Skill[];
}
