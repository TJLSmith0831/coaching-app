import type { Drill, Feedback, FillInput, PathLevel, PathSkeleton, SkeletonInput, Space } from "./types.ts";

const LEVEL_BASE = { beginner: 1, some: 2, team: 3 } as const;
const SPACE_RANK: Record<Space, number> = { small: 0, medium: 1, large: 2 };
const GOAL_LEVELS = 7;
const GOAL_BONUS = 5; // beats any single position weight ≤2 (×2), loses to weight 3 (6)
const NORMAL_LEVELS = 5;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// ponytail: FNV-1a string hash; not crypto, only for change detection
function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16);
}

export function buildSkeleton(input: SkeletonInput): PathSkeleton {
  const { tracks, positions, goalTrackIds, level, difficultyCap } = input;
  const goals = new Set(goalTrackIds);
  const score = (trackId: string) =>
    positions.reduce((s, p) => s + (p.trackWeights[trackId] ?? 0), 0) * 2 + (goals.has(trackId) ? GOAL_BONUS : 0);

  const ordered = [...tracks].sort((a, b) => score(b.id) - score(a.id) || a.sort - b.sort);
  const base = LEVEL_BASE[level];

  const units = ordered.map((t) => {
    const isGoal = goals.has(t.id);
    const n = isGoal ? GOAL_LEVELS : NORMAL_LEVELS;
    const levels: PathLevel[] = [];
    for (let k = 0; k < n; k++) {
      const targetDifficulty = clamp(base + k * 0.5, 1, difficultyCap);
      levels.push({ sort: levels.length, kind: "level", targetDifficulty });
      if ((k + 1) % 3 === 0) levels.push({ sort: levels.length, kind: "chest", targetDifficulty });
    }
    levels.push({ sort: levels.length, kind: "review", targetDifficulty: levels.at(-1)!.targetDifficulty });
    return { skillTrackId: t.id, isGoal, levels };
  });

  const personalizationHash = hash(
    JSON.stringify([positions.map((p) => p.id).sort(), [...goals].sort(), level, difficultyCap]),
  );
  return { sportId: input.sportId, units, personalizationHash };
}

function fits(d: Drill, i: FillInput, relax: 0 | 1 | 2): boolean {
  if (d.sportId !== i.sportId) return false;
  const trackOk = i.skillTrackId ? d.skillTrackId === i.skillTrackId : (i.reviewTrackIds ?? []).includes(d.skillTrackId);
  if (!trackOk) return false;
  if (i.age < d.ageMin || i.age > d.ageMax) return false;
  if (d.positionIds.length && !d.positionIds.some((p) => i.positionIds.includes(p))) return false;
  if (Math.abs(d.difficulty - i.targetDifficulty) > 1 + relax) return false;
  const eq = new Set(i.equipment);
  if (!d.equipmentRequired.every((e) => eq.has(e))) return false;
  if (relax < 2 && i.spot) {
    if (SPACE_RANK[d.minSpace] > SPACE_RANK[i.spot.space]) return false;
    if (d.needsWall && !i.spot.fixtures.includes("wall")) return false;
    if (d.needsGoalOrHoop && !i.spot.fixtures.some((f) => f === "goal" || f === "hoop")) return false;
  }
  return true;
}

function pack(candidates: Drill[], i: FillInput): string[] {
  const recent = new Set(i.recentDrillIds);
  const scored = candidates
    .map((d) => ({ d, s: -Math.abs(d.difficulty - i.targetDifficulty) * 2 - (recent.has(d.id) ? 3 : 0) - (d.isShadow ? 1 : 0) }))
    .sort((a, b) => b.s - a.s || a.d.id.localeCompare(b.d.id));
  const out: string[] = [];
  let left = i.timeBudgetSec - 30;
  for (const { d } of scored) {
    if (d.durationSec <= left) { out.push(d.id); left -= d.durationSec; }
  }
  return out;
}

/** Never returns empty (given at least one shadow drill exists for the track). */
export function fillSession(i: FillInput): string[] {
  const real = i.drills.filter((d) => !d.isShadow);
  for (const relax of [0, 1, 2] as const) {
    const ids = pack(real.filter((d) => fits(d, i, relax)), i);
    if (ids.length >= 2) return ids;
  }
  const withShadow = pack(i.drills.filter((d) => fits(d, { ...i, equipment: [...i.equipment] }, 2) || (d.isShadow && d.sportId === i.sportId)), i);
  if (withShadow.length) return withShadow;
  const any = i.drills.find((d) => d.isShadow && d.sportId === i.sportId);
  return any ? [any.id] : [];
}

export function adaptDifficulty(target: number, feedback: Feedback[], cap: number): number {
  const easy = feedback.filter((f) => f === "too_easy").length;
  const hard = feedback.filter((f) => f === "too_hard").length;
  let next = target;
  if (easy >= 2) next += 0.5;
  if (hard >= 2) next -= 0.5;
  return clamp(next, 1, cap);
}
