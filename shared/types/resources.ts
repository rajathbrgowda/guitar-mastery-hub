export type ResourceType = 'video' | 'tab' | 'article' | 'exercise' | 'tool';
export type ResourceStatus = 'not_started' | 'in_progress' | 'completed';

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  phase_index: number;
  is_featured: boolean;
  description: string | null;
}

export interface ResourceWithCompletion extends Resource {
  completion: number; // 0-100
  status: ResourceStatus;
  is_recommended: boolean; // true if phase_index matches user's current_phase
}

export interface ResourcesResponse {
  recommended: ResourceWithCompletion[];
  all: ResourceWithCompletion[];
}

export interface UpdateCompletionBody {
  completion: number; // 0-100
  status?: ResourceStatus;
}
