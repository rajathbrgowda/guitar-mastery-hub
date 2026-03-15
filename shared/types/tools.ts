export type ToolCategory = 'learning' | 'tuning' | 'practice' | 'theory' | 'recording';
export type ToolPrice = 'free' | 'freemium' | 'paid';
export type ToolPlatform =
  | 'web'
  | 'ios'
  | 'android'
  | 'desktop'
  | 'web+app'
  | 'ios+android'
  | 'mac+ios'
  | 'mac+windows';

export interface Tool {
  key: string;
  name: string;
  url: string;
  description: string;
  category: ToolCategory;
  price: ToolPrice;
  stars: number; // 1–5
  platform: string;
  is_using: boolean;
}

export interface UserTool {
  user_id: string;
  tool_key: string;
  is_using: boolean;
  notes: string | null;
  added_at: string;
}

export interface ToolsResponse {
  my_toolkit: Tool[];
  recommended: Tool[];
  all: Tool[];
}
