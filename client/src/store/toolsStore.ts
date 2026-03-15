import { create } from 'zustand';
import api from '../services/api';
import type { Tool, ToolsResponse } from '@gmh/shared/types';

interface ToolsStoreState {
  all: Tool[];
  my_toolkit: Tool[];
  recommended: Tool[];
  isLoading: boolean;
  error: string | null;
  fetchTools: () => Promise<void>;
  addTool: (key: string) => Promise<void>;
  removeTool: (key: string) => Promise<void>;
  reset: () => void;
}

export const useToolsStore = create<ToolsStoreState>((set) => ({
  all: [],
  my_toolkit: [],
  recommended: [],
  isLoading: false,
  error: null,

  fetchTools: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<ToolsResponse>('/api/tools');
      set({
        all: data.all,
        my_toolkit: data.my_toolkit,
        recommended: data.recommended,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: 'Could not load tools.' });
    }
  },

  addTool: async (key: string) => {
    const { data } = await api.post<ToolsResponse>(`/api/tools/${key}`);
    set({ all: data.all, my_toolkit: data.my_toolkit, recommended: data.recommended });
  },

  removeTool: async (key: string) => {
    const { data } = await api.delete<ToolsResponse>(`/api/tools/${key}`);
    set({ all: data.all, my_toolkit: data.my_toolkit, recommended: data.recommended });
  },

  reset: () => set({ all: [], my_toolkit: [], recommended: [], isLoading: false, error: null }),
}));
