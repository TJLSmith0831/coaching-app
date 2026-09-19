import { buildSkeleton } from "./generator";
import { completeSession, ensurePath, ensureQuests, newChildProgress, openChest, parentCheckin, recordScan } from "./progress";
import { seed } from "./seed";
import type { ChildProgress, DrillResult } from "./types";

const soccerTracks = seed.tracks.filter((t) => t.sportId === "soccer");
const forward = seed.positions.find((p) => p.id === "soccer_forward")!;
const skel = () => buildSkeleton({ sportId: "soccer", tracks: soccerTracks, positions: [forward], goalTrackIds: [], level: "beginner", difficultyCap: 3 });
const firstTrack = () => skel().units[0]!.skillTrackId;
const drillsFor = (trackId: string) => seed.drills.filter((d) => d.skillTrackId === trackId).slice(0, 2);
const allDone = (trackId: string): DrillResult[] => drillsFor(trackId).map((d) => ({ drillId: d.id, status: "done" }));

const fresh = (goal = 40): ChildProgress => ensurePath(newChildProgress(goal), "soccer", skel());
const play = (p: ChildProgress, today: string, replay = false) => {
  const cur = p.paths.soccer!.current;
  const track = p.paths.soccer!.skeleton.units[cur.unit]!.skillTrackId;
  return completeSession(p, { sportId: "soccer", unit: cur.unit, level: cur.level, results: allDone(track), replay, today }, seed);
};

describe("ensurePath", () => {
  it("adds a path, keeps progress when skeleton changes hash", () => {
    let p = fresh();
    expect(p.paths.soccer!.current).toEqual({ unit: 0, level: 0 });
    p = play(p, "2026-09-19").progress;
    const other = buildSkeleton({ sportId: "soccer", tracks: soccerTracks, positions: [forward], goalTrackIds: [firstTrack()], level: "team", difficultyCap: 5 });
    const re = ensurePath(p, "soccer", other);
    expect(re.paths.soccer!.skeleton.personalizationHash).toBe(other.personalizationHash);
    expect(re.paths.soccer!.current).toEqual({ unit: 0, level: 1 });
    expect(Object.keys(re.paths.soccer!.stars)).toEqual(["0:0"]);
  });
});

describe("completeSession", () => {
  it("awards xp, stars, advances current, and streaks when goal met", () => {
    const { progress: p, summary } = play(fresh(20), "2026-09-19");
    expect(summary.stars).toBe(3);
    expect(summary.xpEarned).toBeGreaterThan(20);
    expect(p.totalXp).toBeGreaterThanOrEqual(summary.xpEarned);
    expect(p.paths.soccer!.stars["0:0"]).toBe(3);
    expect(p.paths.soccer!.current).toEqual({ unit: 0, level: 1 });
    expect(p.streak.current).toBe(1);
    expect(summary.badgesEarned).toContain("first_whistle");
    expect(p.dailyXp["2026-09-19"]).toBeGreaterThan(0);
  });

  it("does not streak when daily goal unmet, does not advance on replay", () => {
    const { progress: p } = play(fresh(1000), "2026-09-19");
    expect(p.streak.current).toBe(0);
    const before = p.paths.soccer!.current;
    const { progress: q, summary } = completeSession(p, { sportId: "soccer", unit: 0, level: 0, results: allDone(firstTrack()), replay: true, today: "2026-09-19" }, seed);
    expect(q.paths.soccer!.current).toEqual(before);
    expect(summary.xpEarned).toBeLessThan(play(fresh(), "2026-09-19").summary.xpEarned);
  });

  it("scripted week: 3 sessions -> hat_trick, chest appears after 3rd level and opening advances", () => {
    let p = fresh(20);
    for (const d of ["2026-09-14", "2026-09-15", "2026-09-16"]) {
      p = play(p, d).progress;
    }
    expect(p.badges).toContain("hat_trick");
    expect(p.streak.current).toBe(3);
    expect(p.paths.soccer!.skeleton.units[0]!.levels[p.paths.soccer!.current.level]!.kind).toBe("chest");
    const xp = p.totalXp;
    p = openChest(p, "soccer", 0, p.paths.soccer!.current.level, 35);
    expect(p.totalXp).toBe(xp + 35);
    expect(p.paths.soccer!.current).toEqual({ unit: 0, level: 4 });
    const again = openChest(p, "soccer", 0, 3, 35);
    expect(again).toEqual(p);
  });

  it("moves to next unit and reports unitCompleted; stays on last node at the very end", () => {
    let p = fresh(20);
    const units = p.paths.soccer!.skeleton.units;
    let summary;
    let day = 1;
    let guard = 0;
    while (p.paths.soccer!.current.unit === 0 && guard++ < 20) {
      const cur = p.paths.soccer!.current;
      const node = units[0]!.levels[cur.level]!;
      if (node.kind === "chest") { p = openChest(p, "soccer", 0, cur.level, 20); continue; }
      ({ progress: p, summary } = play(p, `2026-10-${String(day++).padStart(2, "0")}`));
    }
    expect(summary!.unitCompleted).toBe(true);
    expect(p.paths.soccer!.current).toEqual({ unit: 1, level: 0 });
    // fast-forward to the end
    const lastU = units.length - 1, lastL = units[lastU]!.levels.length - 1;
    p = { ...p, paths: { soccer: { ...p.paths.soccer!, current: { unit: lastU, level: lastL } } } };
    p = play(p, "2026-11-01").progress;
    expect(p.paths.soccer!.current).toEqual({ unit: lastU, level: lastL });
  });

  it("is deterministic", () => {
    expect(play(fresh(), "2026-09-19")).toEqual(play(fresh(), "2026-09-19"));
  });
});

describe("quests", () => {
  it("ensures 3 daily + 1 family quest, rolls dailies over, keeps completed same-day", () => {
    let p = ensureQuests(fresh(20), "2026-09-16", seed);
    expect(p.quests.filter((q) => q.kind === "daily").length).toBe(3);
    const fam = p.quests.find((q) => q.kind === "family")!;
    expect(fam.periodStart).toBe("2026-09-14");
    expect(fam.parentTarget).toBe(3);
    const again = ensureQuests(p, "2026-09-16", seed);
    expect(again.quests).toEqual(p.quests);
    p = ensureQuests(p, "2026-09-17", seed);
    expect(p.quests.filter((q) => q.kind === "daily").every((q) => q.periodStart === "2026-09-17")).toBe(true);
    expect(p.quests.filter((q) => q.kind === "family").length).toBe(1);
  });

  it("session progresses xp/levels quests and grants reward", () => {
    let p = ensureQuests(fresh(20), "2026-09-16", seed);
    const { progress: q, summary } = play(p, "2026-09-16");
    const levels = q.quests.find((x) => x.kind === "daily" && x.templateId.includes("level"));
    if (levels) expect(levels.progress).toBeGreaterThanOrEqual(1);
    const done = q.quests.filter((x) => x.completedAt);
    expect(summary.questsCompleted).toEqual(done.map((x) => x.id));
  });

  it("scan progresses scan quests and counts spots/gear", () => {
    let p = ensureQuests(fresh(), "2026-09-16", seed);
    p = recordScan(p, "spot", "2026-09-16", seed);
    p = recordScan(p, "gear", "2026-09-16", seed);
    expect(p.counters.spots).toBe(1);
    expect(p.counters.gearScans).toBe(1);
    expect(p.badges).toContain("gear_head");
    const scan = p.quests.find((q) => q.kind === "daily" && q.templateId.includes("scan"));
    if (scan) expect(scan.progress).toBe(scan.target);
  });

  it("family quest completes only when kid and parent sides are both done", () => {
    let p = ensureQuests(fresh(20), "2026-09-14", seed);
    const fam = () => p.quests.find((q) => q.kind === "family")!;
    for (let i = 0; i < fam().target; i++) {
      const cur = p.paths.soccer!.current;
      const node = p.paths.soccer!.skeleton.units[cur.unit]!.levels[cur.level]!;
      if (node.kind === "chest") { p = openChest(p, "soccer", cur.unit, cur.level, 20); i--; continue; }
      p = play(p, `2026-09-1${4 + i}`).progress;
    }
    expect(fam().progress).toBeGreaterThanOrEqual(fam().target);
    expect(fam().completedAt).toBeNull();
    p = parentCheckin(p, "2026-09-14");
    p = parentCheckin(p, "2026-09-14"); // same day ignored
    expect(fam().parentProgress).toBe(1);
    p = parentCheckin(p, "2026-09-15");
    p = parentCheckin(p, "2026-09-16");
    expect(fam().completedAt).not.toBeNull();
    expect(p.counters.familyQuests).toBe(1);
    expect(p.badges).toContain("family_1");
  });
});
