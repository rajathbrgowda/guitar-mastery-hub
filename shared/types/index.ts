export type { PracticeSection, PracticeSession, NewSession } from './practice';

export type {
  AnalyticsDay,
  AnalyticsSummary,
  AnalyticsHistoryEntry,
  StreakResponse,
  WeakSpot,
  SkillInsight,
  WeeklyDigest,
  InsightsSummary,
  SkillAnalytics,
  AnalyticsSkillsResponse,
  WeeklyHeatmapDay,
  ConfidenceTrendPoint,
  StreakData,
  InsightCard,
} from './analytics';

export type {
  CurriculumSource,
  Skill,
  CurriculumSkillEntry,
  CurriculumPhase,
  CurriculumDetail,
} from './curriculum';

export type {
  ConfidenceRating,
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

export type {
  ResourceType,
  ResourceStatus,
  Resource,
  ResourceWithCompletion,
  ResourcesResponse,
  UpdateCompletionBody,
} from './resources';

export type {
  ThemeKey,
  ThemeMode,
  GuitarType,
  UserProfile,
  UpdateProfileBody,
  OnboardingBody,
  ExperienceLevel,
} from './user';

export type { Milestone, MilestonesResponse } from './milestones';

export type { RoadmapSkill, RoadmapPhase, RoadmapResponse } from './roadmap';

export type { PracticeWeekDay, QuickLogPayload, SessionGroup } from './practice-hub';

export type {
  MasteryState,
  MasteryNode,
  PhaseNodes,
  MasteryMapResponse,
  RustyCheckResponse,
} from './mastery';

export type { ToolCategory, ToolPrice, Tool, UserTool, ToolsResponse } from './tools';

export type { PublicStats, PublicStatsResponse } from './public-stats';

export type {
  BpmLog,
  BpmHistoryResponse,
  ConfidenceTrendEntry,
  ConfidenceTrendsResponse,
} from './bpm';
