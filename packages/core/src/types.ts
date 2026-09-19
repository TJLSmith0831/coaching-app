export type SportId = "soccer" | "basketball" | "football" | "tennis" | "baseball";
export type AgeBand = "8-10" | "11-13";
export type Space = "small" | "medium" | "large";
export type Level = "beginner" | "some" | "team";
export type Feedback = "too_easy" | "ok" | "too_hard";

export interface SkillTrack { id: string; sportId: SportId; name: string; sort: number }

export interface Position {
  id: string;
  sportId: SportId;
  /** trackId -> weight (0..3) */
  trackWeights: Record<string, number>;
}

export interface Drill {
  id: string;
  sportId: SportId;
  skillTrackId: string;
  durationSec: number;
  difficulty: number; // 1..5
  ageMin: number;
  ageMax: number;
  minSpace: Space;
  needsWall: boolean;
  needsGoalOrHoop: boolean;
  equipmentRequired: string[];
  equipmentOptional: string[];
  positionIds: string[]; // empty = all
  xp: number;
  isShadow: boolean;
}

export interface Spot { space: Space; fixtures: string[] } // fixtures: wall|hoop|goal|fence

export type NodeKind = "level" | "chest" | "review";
export interface PathLevel { sort: number; kind: NodeKind; targetDifficulty: number }
export interface PathUnit { skillTrackId: string; isGoal: boolean; levels: PathLevel[] }
export interface PathSkeleton { sportId: SportId; units: PathUnit[]; personalizationHash: string }

export interface SkeletonInput {
  sportId: SportId;
  tracks: SkillTrack[];
  positions: Position[];
  goalTrackIds: string[];
  level: Level;
  difficultyCap: number;
}

export interface FillInput {
  drills: Drill[];
  sportId: SportId;
  skillTrackId: string | null; // null = review (any track in reviewTrackIds)
  reviewTrackIds?: string[];
  targetDifficulty: number;
  timeBudgetSec: number;
  age: number;
  positionIds: string[];
  equipment: string[];
  spot: Spot | null;
  recentDrillIds: string[];
}

export interface DrillResult { drillId: string; status: "done" | "skipped"; feedback?: Feedback }

export interface Streak { current: number; longest: number; lastActivityDate: string | null; freezesAvailable: number }
