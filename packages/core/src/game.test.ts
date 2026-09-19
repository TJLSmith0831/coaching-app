import { scoreStars, sessionXp, playerLevel, advanceStreak, rollChest, dailyGoalMet } from "./game";
import type { DrillResult, Streak } from "./types";

const done = (id: string, feedback?: DrillResult["feedback"]): DrillResult => ({ drillId: id, status: "done", feedback });
const skip = (id: string): DrillResult => ({ drillId: id, status: "skipped" });

describe("scoreStars", () => {
  it("3 = all done, no too_hard; 2 = >=70% done; 1 otherwise", () => {
    expect(scoreStars([done("a"), done("b"), done("c")])).toBe(3);
    expect(scoreStars([done("a"), done("b", "too_hard"), done("c")])).toBe(2);
    expect(scoreStars([done("a"), done("b"), done("c"), skip("d")])).toBe(2);
    expect(scoreStars([done("a"), skip("b"), skip("c")])).toBe(1);
    expect(scoreStars([])).toBe(1);
  });
});

describe("sessionXp", () => {
  it("sums drill xp for done drills + 10 completion + 15 for three stars, halves on replay", () => {
    const xpById = { a: 10, b: 15 };
    expect(sessionXp([done("a"), done("b")], xpById, { stars: 3, replay: false })).toBe(50);
    expect(sessionXp([done("a"), skip("b")], xpById, { stars: 1, replay: false })).toBe(20);
    expect(sessionXp([done("a"), done("b")], xpById, { stars: 3, replay: true })).toBe(25);
  });
});

describe("playerLevel", () => {
  it("floor(sqrt(xp/50))", () => {
    expect(playerLevel(0)).toBe(0);
    expect(playerLevel(50)).toBe(1);
    expect(playerLevel(199)).toBe(1);
    expect(playerLevel(200)).toBe(2);
    expect(playerLevel(5000)).toBe(10);
  });
});

describe("advanceStreak", () => {
  const s0: Streak = { current: 0, longest: 0, lastActivityDate: null, freezesAvailable: 1 };

  it("starts and increments on consecutive days, no double count same day", () => {
    let s = advanceStreak(s0, "2026-09-19");
    expect(s.current).toBe(1);
    s = advanceStreak(s, "2026-09-19");
    expect(s.current).toBe(1);
    s = advanceStreak(s, "2026-09-20");
    expect(s).toMatchObject({ current: 2, longest: 2 });
  });

  it("uses a freeze on one missed day, breaks after two", () => {
    const s = { ...s0, current: 5, longest: 5, lastActivityDate: "2026-09-10" };
    const oneMiss = advanceStreak(s, "2026-09-12");
    expect(oneMiss).toMatchObject({ current: 6, freezesAvailable: 0 });
    const noFreeze = advanceStreak({ ...s, freezesAvailable: 0 }, "2026-09-12");
    expect(noFreeze.current).toBe(1);
    const twoMiss = advanceStreak(s, "2026-09-13");
    expect(twoMiss).toMatchObject({ current: 1, longest: 5 });
  });

  it("refills one freeze on a new ISO week", () => {
    const sun = { ...s0, current: 3, longest: 3, lastActivityDate: "2026-09-20", freezesAvailable: 0 };
    expect(advanceStreak(sun, "2026-09-21").freezesAvailable).toBe(1); // Sun → Mon: new ISO week refills
    const sat = { ...sun, lastActivityDate: "2026-09-19" };
    expect(advanceStreak(sat, "2026-09-20").freezesAvailable).toBe(0); // Sat → Sun: same week
    expect(advanceStreak(sat, "2026-09-21")).toMatchObject({ current: 4, freezesAvailable: 0 }); // refilled then spent on missed Sun
  });
});

describe("dailyGoalMet", () => {
  it("compares xp to goal", () => {
    expect(dailyGoalMet(40, 40)).toBe(true);
    expect(dailyGoalMet(39, 40)).toBe(false);
  });
});

describe("rollChest", () => {
  it("is deterministic for a seed and follows the 60/30/10 table", () => {
    const counts = { 20: 0, 35: 0, 50: 0 };
    for (let i = 0; i < 3000; i++) counts[rollChest(`seed-${i}`).xp as 20 | 35 | 50]++;
    expect(counts[20] / 3000).toBeCloseTo(0.6, 1);
    expect(counts[35] / 3000).toBeCloseTo(0.3, 1);
    expect(counts[50] / 3000).toBeCloseTo(0.1, 1);
    expect(rollChest("x")).toEqual(rollChest("x"));
  });
});
