export interface Resource {
  id: string;
  phase_index: number;
  title: string;
  url: string | null;
  description: string | null;
  type: 'video' | 'course' | 'tool' | 'article' | 'link';
  is_featured: boolean;
  sort_order: number;
}

export interface ResourceWithCompletion extends Resource {
  completion: number;
}

export interface UpdateCompletionBody {
  completion: number;
}
