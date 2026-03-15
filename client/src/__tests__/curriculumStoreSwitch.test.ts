/**
 * CARD-217/218: Test that switching curriculum resets all dependent stores.
 *
 * We test the store logic in isolation — no React rendering required.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted — factory must only use vi.fn() inline, no external variables
vi.mock('../services/api', () => ({
  api: {
    put: vi.fn(),
    get: vi.fn(),
  },
}));

import { useProgressStore } from '../store/progressStore';
import { usePracticePlanStore } from '../store/practicePlanStore';
import { useInsightsStore } from '../store/insightsStore';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useCurriculumStore } from '../store/curriculumStore';
import { api } from '../services/api';

// Cast to vi.Mock so we can use mockResolvedValueOnce etc.
const mockApiPut = api.put as ReturnType<typeof vi.fn>;
const mockApiGet = api.get as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();

  // Seed each store with non-empty data so we can verify it was cleared
  useProgressStore.setState({
    skills: [{ id: 'sp-1', phase_index: 0, skill_index: 0, completed: true, completed_at: null }],
    currentPhase: 2,
    loading: false,
    error: null,
  });
  usePracticePlanStore.setState({
    todaysPlan: { id: 'plan-1', items: [] } as never,
    noplan: false,
    isLoading: false,
    error: null,
  });
  useInsightsStore.setState({
    data: { weakSkills: [] } as never,
    fetchedAt: Date.now(),
    isLoading: false,
    error: null,
  });
  useAnalyticsStore.setState({
    skillsData: { skills: [], by_category: {} },
    activityHistory: [],
    loading: false,
    error: '',
  });

  // Curriculum store: pre-populate so fetchCurriculumDetail can see the list
  useCurriculumStore.setState({
    curricula: [{ key: 'nitsuj_method', name: 'Nitsuj Method' } as never],
    activeCurriculum: { key: 'best_of_all' } as never,
    isLoadingList: false,
    isLoadingDetail: false,
    listError: null,
    detailError: null,
  });
});

describe('curriculumStore.switchCurriculum', () => {
  it('resets progressStore after a successful curriculum switch', async () => {
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockResolvedValue({ data: {}, status: 200 });

    expect(useProgressStore.getState().skills).toHaveLength(1);

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(useProgressStore.getState().skills).toHaveLength(0);
    expect(useProgressStore.getState().currentPhase).toBe(0);
  });

  it('resets practicePlanStore error state after a successful curriculum switch', async () => {
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockResolvedValue({ data: {}, status: 200 });

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(usePracticePlanStore.getState().error).toBeNull();
  });

  it('resets insightsStore after a successful curriculum switch', async () => {
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockResolvedValue({ data: {}, status: 200 });

    expect(useInsightsStore.getState().data).not.toBeNull();

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(useInsightsStore.getState().data).toBeNull();
    expect(useInsightsStore.getState().fetchedAt).toBeNull();
  });

  it('resets analyticsStore after a successful curriculum switch', async () => {
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockResolvedValue({ data: {}, status: 200 });

    expect(useAnalyticsStore.getState().skillsData).not.toBeNull();

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(useAnalyticsStore.getState().skillsData).toBeNull();
    expect(useAnalyticsStore.getState().activityHistory).toHaveLength(0);
  });

  it('throws when the api call fails', async () => {
    mockApiPut.mockRejectedValueOnce(new Error('network error'));

    await expect(useCurriculumStore.getState().switchCurriculum('bad_key')).rejects.toThrow(
      'Failed to switch curriculum',
    );
  });
});
