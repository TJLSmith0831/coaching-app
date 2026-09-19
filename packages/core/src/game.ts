import type { DrillResult, Streak } from "./types";

export const SESSION_BONUS = 10;
export const THREE_STAR_BONUS = 15;

export function scoreStars(results: DrillResult[]): 1 | 2 | 3 {
  if (!results.length) return 1;
  const done = results.filter((r) => r.status === "done");
  const tooHard = done.some((r) => r.feedback === "too_hard");
  if (done.length === results.length && !tooHard) return 3;
  if (done.length / results.length >= 0.7) return 2;
  return 1;
}

export function sessionXp(
  results: DrillResult[],
  xpByDrillId: Record<string, number>,
  o: { stars: 1 | 2 | 3; replay: boolean },
): number {
  const drills = results.filter((r) => r.status === "done").reduce((s, r) => s + (xpByDrillId[r.drillId] ?? 0), 0);
  const total = drills + SESSION_BONUS + (o.stars === 3 ? THREE_STAR_BONUS : 0);
  return o.replay ? Math.floor(total / 2) : total;
}

export const playerLevel = (totalXp: number) => Math.floor(Math.sqrt(Math.max(0, totalXp) / 50));

export const dailyGoalMet = (xpToday: number, goal: number) => xpToday >= goal;

const dayNum = (iso: string) => Math.floor(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86_400_000);
// ISO week: Monday start. 1970-01-01 was a Thursday (dayNum 0 → weekday 3 with Mon=0).
const weekNum = (iso: string) => Math.floor((dayNum(iso) + 3) / 7);

/** Call once per completed session with the device-local date (YYYY-MM-DD). Idempotent within a day. */
export function advanceStreak(s: Streak, today: string): Streak {
  if (s.lastActivityDate === today) return s;
  const newWeek = s.lastActivityDate !== null && weekNum(today) > weekNum(s.lastActivityDate);
  let freezes = newWeek ? 1 : s.freezesAvailable;
  let current: number;
  if (s.lastActivityDate === null) current = 1;
  else {
    const gap = dayNum(today) - dayNum(s.lastActivityDate);
    if (gap === 1) current = s.current + 1;
    else if (gap === 2 && freezes > 0) { freezes -= 1; current = s.current + 1; }
    else current = 1;
  }
  return { current, longest: Math.max(s.longest, current), lastActivityDate: today, freezesAvailable: freezes };
}

const CHEST_TABLE: { xp: 20 | 35 | 50; p: number }[] = [{ xp: 20, p: 0.6 }, { xp: 35, p: 0.3 }, { xp: 50, p: 0.1 }];

/** Server-side only in production; seed = session id so retries roll the same chest. */
export function rollChest(seed: string): { xp: 20 | 35 | 50 } {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const r = (h >>> 0) / 0x1_0000_0000;
  let acc = 0;
  for (const row of CHEST_TABLE) { acc += row.p; if (r < acc) return { xp: row.xp }; }
  return { xp: 20 };
}
