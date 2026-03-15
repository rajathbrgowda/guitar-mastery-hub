export type { PracticeSection, PracticeSession, NewSession } from './practice';

export type {
  AnalyticsDay,
  AnalyticsSummary,
  AnalyticsHistoryEntry,
  StreakResponse,
  WeakSpot,
} from './analytics';

export type {
  CurriculumSource,
  Skill,
  CurriculumSkillEntry,
  CurriculumPhase,
  CurriculumDetail,
} from './curriculum';

export type {
  PracticePlanItem,
  DailyPracticePlan,
  CompletePlanItemBody,
  SkipPlanBody,
} from './practice-plan';

export type {
  SkillProgress,
  ProgressResponse,
  ToggleSkillBody,
  SetPhaseBody,
  Skill as LegacySkill,
  Phase,
} from './progress';

export type { Resource, ResourceWithCompletion, UpdateCompletionBody } from './resources';

export type { ThemeKey, GuitarType, UserProfile, UpdateProfileBody } from './user';
