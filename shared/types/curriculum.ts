export interface CurriculumSource {
  id: string;
  key: string;
  name: string;
  author: string | null;
  description: string | null;
  style: string | null;
  website_url: string | null;
  is_default: boolean;
  sort_order: number;
}

export interface Skill {
  id: string;
  key: string;
  category: 'chord' | 'scale' | 'technique' | 'theory' | 'song' | 'warmup';
  title: string;
  description: string | null;
  difficulty: number;
  chord_diagram_key: string | null;
}

export interface CurriculumSkillEntry extends Skill {
  phase_number: number;
  phase_title: string;
  sort_order: number;
  video_youtube_id: string | null;
  video_title: string | null;
  practice_tip: string | null;
  common_mistake: string | null;
  practice_exercise: string | null;
}

export interface CurriculumPhase {
  phase_number: number;
  phase_title: string;
  skills: CurriculumSkillEntry[];
}

export interface CurriculumDetail extends CurriculumSource {
  phases: CurriculumPhase[];
}
