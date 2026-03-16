/**
 * CARD-217/218: Test that switching curriculum resets all dependent stores.
 * CARD-389: Test that switching also re-fetches roadmap, progress, and profile.
 *
 * We test the store logic in isolation — no React rendering required.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted — factory must only use vi.fn() inline, no external variables
// Export both named (api) and default so stores using either import form are covered.
vi.mock('../services/api', () => {
  const mockApi = { put: vi.fn(), get: vi.fn() };
  return { api: mockApi, default: mockApi };
});

import { useProgressStore } from '../store/progressStore';
import { usePracticePlanStore } from '../store/practicePlanStore';
import { useInsightsStore } from '../store/insightsStore';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useRoadmapStore } from '../store/roadmapStore';
import { useUserStore } from '../store/userStore';
import { useCurriculumStore } from '../store/curriculumStore';
import { api } from '../services/api';

// Cast to vi.Mock so we can use mockResolvedValueOnce etc.
const mockApiPut = api.put as ReturnType<typeof vi.fn>;
const mockApiGet = api.get as ReturnType<typeof vi.fn>;

/** Default mock: returns well-shaped empty data per endpoint so stores don't break on fetch. */
function defaultGetMock(url: string) {
  if (url === '/api/progress') return Promise.resolve({ data: { skills: [], currentPhase: 0 } });
  if (url === '/api/roadmap')
    return Promise.resolve({
      data: { phases: [], current_phase: 1, curriculum_key: 'nitsuj_method' },
    });
  if (url === '/api/users/me')
    return Promise.resolve({ data: { id: 'u1', selected_curriculum_key: 'nitsuj_method' } });
  return Promise.resolve({ data: {} });
}

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
  useRoadmapStore.setState({
    data: { phases: [], current_phase: 1, curriculum_key: 'best_of_all' } as never,
    loading: false,
    error: '',
  });
  useUserStore.setState({
    profile: { id: 'u1', selected_curriculum_key: 'best_of_all' } as never,
    loading: false,
  });

  // Curriculum store: pre-populate so fetchCurriculumDetail can see the list
  useCurriculumStore.setState({
    curricula: [{ key: 'nitsuj_method', name: 'Nitsuj Method' } as never],
    activeCurriculum: { key: 'best_of_all' } as never,
    isLoadingList: false,
    isLoadingDetail: false,
    isSwitching: false,
    listError: null,
    detailError: null,
  });
});

describe('curriculumStore.switchCurriculum', () => {
  it('resets progressStore after a successful curriculum switch', async () => {
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockImplementation(defaultGetMock);

    expect(useProgressStore.getState().skills).toHaveLength(1);

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(useProgressStore.getState().skills).toHaveLength(0);
    expect(useProgressStore.getState().currentPhase).toBe(0);
  });

  it('resets practicePlanStore error state after a successful curriculum switch', async () => {
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockImplementation(defaultGetMock);

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(usePracticePlanStore.getState().error).toBeNull();
  });

  it('resets insightsStore after a successful curriculum switch', async () => {
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockImplementation(defaultGetMock);

    expect(useInsightsStore.getState().data).not.toBeNull();

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(useInsightsStore.getState().data).toBeNull();
    expect(useInsightsStore.getState().fetchedAt).toBeNull();
  });

  it('resets analyticsStore after a successful curriculum switch', async () => {
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockImplementation(defaultGetMock);

    expect(useAnalyticsStore.getState().skillsData).not.toBeNull();

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(useAnalyticsStore.getState().skillsData).toBeNull();
    expect(useAnalyticsStore.getState().activityHistory).toHaveLength(0);
  });

  it('calls fetchRoadmap after switch so roadmap reflects new curriculum immediately', async () => {
    const roadmapData = {
      phases: [{ phase_number: 1, skills: [] }],
      current_phase: 1,
      curriculum_key: 'nitsuj_method',
    };
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockResolvedValue({ data: roadmapData, status: 200 });

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(useRoadmapStore.getState().data).toEqual(roadmapData);
  });

  it('calls fetchProgress after switch so progress reflects new curriculum immediately', async () => {
    const newSkill = {
      id: 'sp-new',
      phase_index: 0,
      skill_index: 0,
      completed: false,
      completed_at: null,
    };
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockImplementation((url: string) => {
      if (url === '/api/progress')
        return Promise.resolve({ data: { skills: [newSkill], currentPhase: 1 } });
      return Promise.resolve({ data: {} });
    });

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(useProgressStore.getState().skills).toHaveLength(1);
    expect(useProgressStore.getState().skills[0].id).toBe('sp-new');
  });

  it('force-refreshes profile after switch so selected_curriculum_key updates in UI', async () => {
    const updatedProfile = { id: 'u1', selected_curriculum_key: 'nitsuj_method' };
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockImplementation((url: string) => {
      if (url === '/api/users/me') return Promise.resolve({ data: updatedProfile });
      return Promise.resolve({ data: {} });
    });

    expect(useUserStore.getState().profile?.selected_curriculum_key).toBe('best_of_all');

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(useUserStore.getState().profile?.selected_curriculum_key).toBe('nitsuj_method');
  });

  it('clears isSwitching flag after switch completes', async () => {
    mockApiPut.mockResolvedValueOnce({ data: {}, status: 200 });
    mockApiGet.mockImplementation(defaultGetMock);

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    expect(useCurriculumStore.getState().isSwitching).toBe(false);
  });

  it('clears isSwitching flag even when switch fails', async () => {
    mockApiPut.mockRejectedValueOnce(new Error('network error'));

    await expect(useCurriculumStore.getState().switchCurriculum('bad_key')).rejects.toThrow(
      'Failed to switch curriculum',
    );

    expect(useCurriculumStore.getState().isSwitching).toBe(false);
  });

  it('ignores a second concurrent switch call while one is in progress', async () => {
    mockApiPut.mockResolvedValue({ data: {}, status: 200 });
    mockApiGet.mockImplementation(defaultGetMock);

    // Set isSwitching mid-flight
    useCurriculumStore.setState({ isSwitching: true });

    await useCurriculumStore.getState().switchCurriculum('nitsuj_method');

    // api.put should NOT have been called — guard blocked the second attempt
    expect(mockApiPut).not.toHaveBeenCalled();
  });

  it('throws when the api call fails', async () => {
    mockApiPut.mockRejectedValueOnce(new Error('network error'));

    await expect(useCurriculumStore.getState().switchCurriculum('bad_key')).rejects.toThrow(
      'Failed to switch curriculum',
    );
  });
});
