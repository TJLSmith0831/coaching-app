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

// ---------- Seed content ----------
export interface Sport { id: SportId; name: string; emoji: string; coreEquipment: string[]; sort: number }
export interface EquipmentType { id: string; name: string; emoji: string; sportIds: SportId[] }
export interface DrillContent extends Drill { name: string; instructions: string; imageUrl?: string; videoUrl?: string }
export interface PositionContent extends Position { name: string; ageMin: number; ageMax: number; sort: number; blurb: string }
export type BadgeRule =
  | { type: "sessions"; n: number }
  | { type: "streak"; n: number }
  | { type: "goldUnit" }
  | { type: "spots"; n: number }
  | { type: "gearScan" }
  | { type: "trackDrills"; sportId: SportId; skillTrackId: string; n: number }
  | { type: "familyQuests"; n: number };
export interface Badge { id: string; name: string; description: string; emoji: string; rule: BadgeRule }
export type QuestRule =
  | { type: "xp"; n: number }
  | { type: "levels"; n: number }
  | { type: "scan" }
  | { type: "drillsInTrack"; skillTrackId?: string; n: number };
export interface QuestTemplate { id: string; kind: "daily" | "family"; title: string; rule: QuestRule; xpReward: number }
export interface SeedBundle {
  sports: Sport[]; tracks: SkillTrack[]; positions: PositionContent[]; drills: DrillContent[];
  equipment: EquipmentType[]; badges: Badge[]; questTemplates: QuestTemplate[];
}

// ---------- Per-child progress (single JSON blob; same reducer on device and server) ----------
export interface Quest {
  id: string; templateId: string; kind: "daily" | "family"; title: string; rule: QuestRule; lastParentCheckin?: string;
  periodStart: string; target: number; progress: number; parentProgress?: number; parentTarget?: number;
  xpReward: number; completedAt: string | null;
}
export interface PathProgress {
  skeleton: PathSkeleton;
  current: { unit: number; level: number }; // indexes into skeleton.units[u].levels[l]
  stars: Record<string, number>;             // key `${unit}:${level}` -> 1..3
  chestsOpened: Record<string, number>;      // key -> xp
}
export interface ChildProgress {
  totalXp: number;
  streak: Streak;
  dailyXp: Record<string, number>;           // YYYY-MM-DD -> xp
  dailyGoalXp: number;
  badges: string[];
  quests: Quest[];
  paths: Partial<Record<SportId, PathProgress>>;
  recentDrillIds: string[];
  counters: { sessions: number; spots: number; gearScans: number; familyQuests: number; trackDrills: Record<string, number> };
}
export interface CompleteSessionInput {
  sportId: SportId; unit: number; level: number; results: DrillResult[]; replay: boolean; today: string; // local date
  positionIds?: string[];
}
export interface SessionSummary {
  xpEarned: number; stars: 1 | 2 | 3; streak: Streak; levelBefore: number; levelAfter: number;
  badgesEarned: string[]; questsCompleted: string[]; unitCompleted: boolean; nextIsChest: boolean;
}
