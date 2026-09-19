import { buildSkeleton, fillSession, adaptDifficulty } from "./generator";
import type { Drill, Position, SkillTrack, Spot } from "./types";

const tracks: SkillTrack[] = ["control", "passing", "dribbling", "shooting", "position"].map((id, i) => ({
  id, sportId: "soccer", name: id, sort: i,
}));
const forward: Position = { id: "forward", sportId: "soccer", trackWeights: { shooting: 3, dribbling: 2 } };
const keeper: Position = { id: "gk", sportId: "soccer", trackWeights: { position: 3, control: 1 } };

const drill = (o: Partial<Drill> & { id: string }): Drill => ({
  sportId: "soccer", skillTrackId: "control", durationSec: 120, difficulty: 2, ageMin: 8, ageMax: 13,
  minSpace: "small", needsWall: false, needsGoalOrHoop: false, equipmentRequired: ["soccer_ball"],
  equipmentOptional: [], positionIds: [], xp: 10, isShadow: false, ...o,
});

describe("buildSkeleton", () => {
  const base = { sportId: "soccer" as const, tracks, level: "beginner" as const, difficultyCap: 3 };

  it("orders units by position weight + goals, every track present once", () => {
    const s = buildSkeleton({ ...base, positions: [forward], goalTrackIds: ["passing"] });
    expect(s.units.map((u) => u.skillTrackId)).toEqual(["shooting", "passing", "dribbling", "control", "position"]);
    expect(new Set(s.units.map((u) => u.skillTrackId)).size).toBe(tracks.length);
  });

  it("goal units get 7 levels, others 5, each with review last and chest every 3rd", () => {
    const s = buildSkeleton({ ...base, positions: [forward], goalTrackIds: ["passing"] });
    const goal = s.units.find((u) => u.skillTrackId === "passing")!;
    const other = s.units.find((u) => u.skillTrackId === "control")!;
    expect(goal.isGoal).toBe(true);
    expect(goal.levels.filter((l) => l.kind === "level").length).toBe(7);
    expect(other.levels.filter((l) => l.kind === "level").length).toBe(5);
    expect(other.levels.at(-1)!.kind).toBe("review");
    expect(other.levels.filter((l) => l.kind === "chest").length).toBe(Math.floor(5 / 3));
  });

  it("caps target difficulty and ramps from level base", () => {
    const s = buildSkeleton({ ...base, positions: [forward], goalTrackIds: [], level: "team", difficultyCap: 3 });
    const diffs = s.units[0]!.levels.filter((l) => l.kind === "level").map((l) => l.targetDifficulty);
    expect(diffs[0]).toBe(3);
    expect(Math.max(...diffs)).toBeLessThanOrEqual(3);
    const b = buildSkeleton({ ...base, positions: [forward], goalTrackIds: [], difficultyCap: 5 });
    const bd = b.units[0]!.levels.filter((l) => l.kind === "level").map((l) => l.targetDifficulty);
    expect(bd[0]).toBe(1);
    expect(bd.at(-1)).toBeGreaterThan(bd[0]!);
  });

  it("is deterministic and hash changes only with personalization", () => {
    const a = buildSkeleton({ ...base, positions: [forward], goalTrackIds: ["passing"] });
    const b = buildSkeleton({ ...base, positions: [forward], goalTrackIds: ["passing"] });
    const c = buildSkeleton({ ...base, positions: [keeper], goalTrackIds: ["passing"] });
    expect(a).toEqual(b);
    expect(a.personalizationHash).not.toBe(c.personalizationHash);
  });
});

describe("fillSession", () => {
  const drills: Drill[] = [
    drill({ id: "toe", difficulty: 1, durationSec: 120 }),
    drill({ id: "wall", difficulty: 2, durationSec: 180, needsWall: true }),
    drill({ id: "cones", difficulty: 2, durationSec: 180, equipmentRequired: ["soccer_ball", "cones"] }),
    drill({ id: "juggle", difficulty: 3, durationSec: 240 }),
    drill({ id: "big", difficulty: 2, durationSec: 300, minSpace: "large" }),
    drill({ id: "old", difficulty: 5, durationSec: 120, ageMin: 11 }),
    drill({ id: "shadow", difficulty: 1, durationSec: 120, equipmentRequired: [], isShadow: true }),
    drill({ id: "passing1", skillTrackId: "passing", difficulty: 2, durationSec: 120 }),
  ];
  const base = {
    drills, sportId: "soccer" as const, skillTrackId: "control", targetDifficulty: 2, timeBudgetSec: 600,
    age: 9, positionIds: ["forward"], equipment: ["soccer_ball"], spot: { space: "small", fixtures: [] } as Spot,
    recentDrillIds: [] as string[],
  };

  it("filters by equipment, space, wall, age and track, packs to time budget", () => {
    const ids = fillSession(base);
    expect(ids).not.toContain("cones");
    expect(ids).not.toContain("big");
    expect(ids).not.toContain("wall");
    expect(ids).not.toContain("old");
    expect(ids).not.toContain("passing1");
    const total = ids.reduce((s, id) => s + drills.find((d) => d.id === id)!.durationSec, 0);
    expect(total).toBeLessThanOrEqual(600);
    expect(ids.length).toBeGreaterThanOrEqual(2);
  });

  it("prefers drills near target difficulty and penalizes recent ones", () => {
    const ids = fillSession({ ...base, recentDrillIds: ["toe"] });
    expect(ids.indexOf("toe")).toBeGreaterThan(0);
  });

  it("unlocks wall drills when spot has a wall", () => {
    expect(fillSession({ ...base, spot: { space: "medium", fixtures: ["wall"] } })).toContain("wall");
  });

  it("never returns empty: falls back to shadow drills with no gear", () => {
    const ids = fillSession({ ...base, equipment: [], timeBudgetSec: 300 });
    expect(ids.length).toBeGreaterThan(0);
    expect(ids).toContain("shadow");
  });

  it("review mixes tracks", () => {
    const ids = fillSession({ ...base, skillTrackId: null, reviewTrackIds: ["control", "passing"], timeBudgetSec: 900 });
    expect(ids).toContain("passing1");
  });
});

describe("adaptDifficulty", () => {
  it("moves +0.5 on two too_easy, -0.5 on two too_hard, bounded by cap and 1", () => {
    expect(adaptDifficulty(2, ["too_easy", "too_easy", "ok"], 3)).toBe(2.5);
    expect(adaptDifficulty(2, ["too_hard", "too_hard"], 3)).toBe(1.5);
    expect(adaptDifficulty(3, ["too_easy", "too_easy"], 3)).toBe(3);
    expect(adaptDifficulty(1, ["too_hard", "too_hard"], 3)).toBe(1);
    expect(adaptDifficulty(2, ["too_easy"], 3)).toBe(2);
  });
});
