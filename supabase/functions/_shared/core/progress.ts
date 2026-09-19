import { advanceStreak, dailyGoalMet, dayNum, playerLevel, scoreStars, sessionXp } from "./game.ts";
import type {
  Badge, ChildProgress, CompleteSessionInput, DrillResult, PathProgress, PathSkeleton, Quest, QuestTemplate, SeedBundle,
  SessionSummary, SportId,
} from "./types.ts";

export type { DrillResult };

const key = (u: number, l: number) => `${u}:${l}`;
const mondayOf = (iso: string) => {
  const d = dayNum(iso);
  const m = d - ((d + 3) % 7);
  return new Date(m * 86_400_000).toISOString().slice(0, 10);
};
const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };

export function newChildProgress(dailyGoalXp: number): ChildProgress {
  return {
    totalXp: 0, streak: { current: 0, longest: 0, lastActivityDate: null, freezesAvailable: 1 }, dailyXp: {}, dailyGoalXp,
    badges: [], quests: [], paths: {}, recentDrillIds: [],
    counters: { sessions: 0, spots: 0, gearScans: 0, familyQuests: 0, trackDrills: {} },
  };
}

export function ensurePath(p: ChildProgress, sportId: SportId, skeleton: PathSkeleton): ChildProgress {
  const existing = p.paths[sportId];
  if (existing && existing.skeleton.personalizationHash === skeleton.personalizationHash) return p;
  const cur = existing?.current ?? { unit: 0, level: 0 };
  const unit = Math.min(cur.unit, skeleton.units.length - 1);
  const level = Math.min(cur.level, skeleton.units[unit]!.levels.length - 1);
  const path: PathProgress = { skeleton, current: { unit, level }, stars: existing?.stars ?? {}, chestsOpened: existing?.chestsOpened ?? {} };
  return { ...p, paths: { ...p.paths, [sportId]: path } };
}

function advance(pp: PathProgress): { current: PathProgress["current"]; unitCompleted: boolean } {
  const { unit, level } = pp.current;
  const units = pp.skeleton.units;
  if (level + 1 < units[unit]!.levels.length) return { current: { unit, level: level + 1 }, unitCompleted: false };
  if (unit + 1 < units.length) return { current: { unit: unit + 1, level: 0 }, unitCompleted: true };
  return { current: { unit, level }, unitCompleted: false };
}

export const drillXpMap = (seed: SeedBundle): Record<string, number> => Object.fromEntries(seed.drills.map((d) => [d.id, d.xp]));

function addXp(p: ChildProgress, xp: number, today: string): ChildProgress {
  return { ...p, totalXp: p.totalXp + xp, dailyXp: { ...p.dailyXp, [today]: (p.dailyXp[today] ?? 0) + xp } };
}

// ---- quests ----
type QuestEvent = { xp?: number; levels?: number; scan?: boolean; drills?: Record<string, number> };

function bumpQuests(p: ChildProgress, ev: QuestEvent, today: string): { p: ChildProgress; completed: string[] } {
  const completed: string[] = [];
  let bonus = 0;
  const quests = p.quests.map((q) => {
    if (q.completedAt) return q;
    const rule = q.rule;
    let inc = 0;
    if (rule.type === "xp") inc = ev.xp ?? 0;
    else if (rule.type === "levels") inc = ev.levels ?? 0;
    else if (rule.type === "scan") inc = ev.scan ? 1 : 0;
    else if (rule.type === "drillsInTrack") inc = Object.entries(ev.drills ?? {}).filter(([k]) => !rule.skillTrackId || k.endsWith(`:${rule.skillTrackId}`)).reduce((s, [, n]) => s + n, 0);
    if (!inc) return q;
    const progress = Math.min(q.target, q.progress + inc);
    const kidDone = progress >= q.target;
    const parentDone = q.kind !== "family" || (q.parentProgress ?? 0) >= (q.parentTarget ?? 0);
    if (kidDone && parentDone) { completed.push(q.id); bonus += q.xpReward; }
    return { ...q, progress, completedAt: kidDone && parentDone ? today : null };
  });
  let next = { ...p, quests };
  if (bonus) next = addXp(next, bonus, today);
  if (completed.some((id) => quests.find((q) => q.id === id)?.kind === "family")) next = { ...next, counters: { ...next.counters, familyQuests: next.counters.familyQuests + 1 } };
  return { p: next, completed };
}

const questFrom = (t: QuestTemplate, periodStart: string): Quest => ({
  id: `${t.id}:${periodStart}`, templateId: t.id, kind: t.kind, title: t.title, rule: t.rule, periodStart,
  target: "n" in t.rule ? t.rule.n : 1, progress: 0, xpReward: t.xpReward, completedAt: null,
  ...(t.kind === "family" ? { parentProgress: 0, parentTarget: 3 } : {}),
});

export function ensureQuests(p: ChildProgress, today: string, seed: SeedBundle): ChildProgress {
  const week = mondayOf(today);
  const kept = p.quests.filter((q) => (q.kind === "daily" ? q.periodStart === today : q.periodStart === week));
  const dailies = seed.questTemplates.filter((t) => t.kind === "daily");
  const start = hashStr(today) % dailies.length;
  const wantDaily = [0, 1, 2].map((i) => dailies[(start + i) % dailies.length]!);
  const families = seed.questTemplates.filter((t) => t.kind === "family");
  const wantFamily = families[hashStr(week) % families.length];
  const out = [...kept];
  for (const t of wantDaily) if (!out.some((q) => q.templateId === t.id)) out.push(questFrom(t, today));
  if (wantFamily && !out.some((q) => q.kind === "family")) out.push(questFrom(wantFamily, week));
  return out.length === p.quests.length && out.every((q, i) => q === p.quests[i]) ? p : { ...p, quests: out };
}

export function parentCheckin(p: ChildProgress, today: string): ChildProgress {
  let newlyDone = false;
  const quests = p.quests.map((q) => {
    if (q.kind !== "family" || q.completedAt || q.lastParentCheckin === today) return q;
    const parentProgress = Math.min(q.parentTarget ?? 3, (q.parentProgress ?? 0) + 1);
    const done = parentProgress >= (q.parentTarget ?? 3) && q.progress >= q.target;
    if (done) newlyDone = true;
    return { ...q, parentProgress, lastParentCheckin: today, completedAt: done ? today : null };
  });
  let next = { ...p, quests };
  if (newlyDone) {
    const reward = quests.filter((q) => q.kind === "family" && q.completedAt === today).reduce((s, q) => s + q.xpReward, 0);
    next = addXp(next, reward, today);
    next = { ...next, counters: { ...next.counters, familyQuests: next.counters.familyQuests + 1 } };
  }
  return evalBadges(next).p;
}

// ---- badges ----
function goldUnit(p: ChildProgress): boolean {
  return Object.values(p.paths).some((pp) =>
    pp!.skeleton.units.some((u, ui) => u.levels.filter((l) => l.kind !== "chest").every((l) => pp!.stars[key(ui, l.sort)] === 3)),
  );
}

function badgeMet(b: Badge, p: ChildProgress): boolean {
  const r = b.rule;
  switch (r.type) {
    case "sessions": return p.counters.sessions >= r.n;
    case "streak": return p.streak.current >= r.n || p.streak.longest >= r.n;
    case "goldUnit": return goldUnit(p);
    case "spots": return p.counters.spots >= r.n;
    case "gearScan": return p.counters.gearScans >= 1;
    case "trackDrills": return (p.counters.trackDrills[`${r.sportId}:${r.skillTrackId}`] ?? 0) >= r.n;
    case "familyQuests": return p.counters.familyQuests >= r.n;
  }
}

let badgeSeed: Badge[] | null = null;
function evalBadges(p: ChildProgress, seed?: SeedBundle): { p: ChildProgress; earned: string[] } {
  if (seed) badgeSeed = seed.badges;
  const earned = (badgeSeed ?? []).filter((b) => !p.badges.includes(b.id) && badgeMet(b, p)).map((b) => b.id);
  return earned.length ? { p: { ...p, badges: [...p.badges, ...earned] }, earned } : { p, earned };
}

// ---- events ----
export function completeSession(p0: ChildProgress, input: CompleteSessionInput, seed: SeedBundle): { progress: ChildProgress; summary: SessionSummary } {
  const { sportId, unit, level, results, replay, today } = input;
  const pp = p0.paths[sportId];
  if (!pp) throw new Error(`no path for ${sportId}`);
  const stars = scoreStars(results);
  const xpEarned = sessionXp(results, drillXpMap(seed), { stars, replay });
  const levelBefore = playerLevel(p0.totalXp);

  let p = addXp(p0, xpEarned, today);
  if (dailyGoalMet(p.dailyXp[today] ?? 0, p.dailyGoalXp)) p = { ...p, streak: advanceStreak(p.streak, today) };

  const k = key(unit, level);
  let path: PathProgress = { ...pp, stars: { ...pp.stars, [k]: Math.max(pp.stars[k] ?? 0, stars) } };
  let unitCompleted = false;
  const isCurrent = pp.current.unit === unit && pp.current.level === level;
  if (!replay && isCurrent) ({ current: path.current, unitCompleted } = advance(path));
  const nextNode = path.skeleton.units[path.current.unit]!.levels[path.current.level]!;
  p = { ...p, paths: { ...p.paths, [sportId]: path } };

  const doneIds = results.filter((r) => r.status === "done").map((r) => r.drillId);
  const recentDrillIds = [...doneIds, ...p.recentDrillIds.filter((id) => !doneIds.includes(id))].slice(0, 12);
  const trackDrills = { ...p.counters.trackDrills };
  const drillEv: Record<string, number> = {};
  for (const id of doneIds) {
    const d = seed.drills.find((x) => x.id === id);
    if (!d) continue;
    const tk = `${sportId}:${d.skillTrackId}`;
    trackDrills[tk] = (trackDrills[tk] ?? 0) + 1;
    drillEv[tk] = (drillEv[tk] ?? 0) + 1;
  }
  p = { ...p, recentDrillIds, counters: { ...p.counters, sessions: p.counters.sessions + 1, trackDrills } };

  const q = bumpQuests(p, { xp: xpEarned, levels: replay ? 0 : 1, drills: drillEv }, today);
  const b = evalBadges(q.p, seed);
  return {
    progress: b.p,
    summary: {
      xpEarned, stars, streak: b.p.streak, levelBefore, levelAfter: playerLevel(b.p.totalXp),
      badgesEarned: b.earned, questsCompleted: q.completed, unitCompleted, nextIsChest: nextNode.kind === "chest" && !replay && isCurrent,
    },
  };
}

export function openChest(p: ChildProgress, sportId: SportId, unit: number, level: number, xp: number): ChildProgress {
  const pp = p.paths[sportId];
  if (!pp) return p;
  const k = key(unit, level);
  if (pp.chestsOpened[k] !== undefined) return p;
  let path: PathProgress = { ...pp, chestsOpened: { ...pp.chestsOpened, [k]: xp } };
  if (pp.current.unit === unit && pp.current.level === level) path = { ...path, current: advance(path).current };
  const lastDay = p.streak.lastActivityDate ?? Object.keys(p.dailyXp).sort().at(-1) ?? new Date().toISOString().slice(0, 10);
  return { ...addXp(p, xp, lastDay), paths: { ...p.paths, [sportId]: path } };
}

export function recordScan(p: ChildProgress, mode: "spot" | "gear", today: string, seed: SeedBundle): ChildProgress {
  const counters = { ...p.counters, [mode === "spot" ? "spots" : "gearScans"]: p.counters[mode === "spot" ? "spots" : "gearScans"] + 1 };
  const q = bumpQuests({ ...p, counters }, { scan: true }, today);
  return evalBadges(q.p, seed).p;
}
