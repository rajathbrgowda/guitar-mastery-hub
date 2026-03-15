export interface SkillProgress {
  id: string;
  phase_index: number;
  skill_index: number;
  completed: boolean;
  completed_at: string | null;
}

export interface ProgressResponse {
  skills: SkillProgress[];
  currentPhase: number;
}

export interface ToggleSkillBody {
  phase_index: number;
  skill_index: number;
  completed: boolean;
}

export interface SetPhaseBody {
  current_phase: number;
}

/** Static UI-only types — not persisted, defined in frontend roadmap config */
export interface Skill {
  name: string;
  description?: string;
}

export interface Phase {
  title: string;
  subtitle: string;
  skills: Skill[];
}
