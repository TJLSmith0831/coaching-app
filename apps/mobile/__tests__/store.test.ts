import { seed } from "@coaching/core";
import { useApp } from "@/lib/store";

const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();

beforeEach(() => useApp.setState({ children: [], activeChildId: null, rewards: [], claims: [], checkins: {}, pending: [] }));

function setupChild() {
  const c = useApp.getState().addChild({ nickname: "Ava", birthMonth: 1, birthYear: new Date().getFullYear() - 10, avatar: { emoji: "🦊", color: "#fff" },
    sports: [{ sportId: "soccer", level: "beginner", positionIds: ["soccer_forward"], goalTrackIds: ["soccer_shooting"], isFocus: true }], equipment: ["soccer_ball"] });
  useApp.getState().regeneratePaths(c.id);
  return useApp.getState().child(c.id)!;
}

test("regeneratePaths builds a soccer path with shooting as the first (goal) unit", () => {
  const c = setupChild();
  const path = c.progress.paths.soccer!;
  expect(path.skeleton.units[0]!.skillTrackId).toBe("soccer_shooting");
  expect(path.skeleton.units[0]!.isGoal).toBe(true);
  expect(path.current).toEqual({ unit: 0, level: 0 });
  expect(c.progress.quests.filter((q) => q.kind === "daily")).toHaveLength(3);
});

test("completing the first level awards XP, a badge, stars, and advances the node optimistically", () => {
  const c = setupChild();
  const drill = seed.drills.find((d) => d.sportId === "soccer" && d.skillTrackId === "soccer_shooting")!;
  const summary = useApp.getState().completeSession(c.id, "s1", {
    sportId: "soccer", unit: 0, level: 0, replay: false, today, results: [{ drillId: drill.id, status: "done", feedback: "ok" }],
  });
  const after = useApp.getState().child(c.id)!;
  expect(summary.stars).toBe(3);
  expect(summary.xpEarned).toBe(drill.xp + 10 + 15);
  expect(summary.badgesEarned).toContain("first_whistle");
  expect(after.progress.paths.soccer!.current).toEqual({ unit: 0, level: 1 });
  expect(after.progress.paths.soccer!.stars["0:0"]).toBe(3);
  expect(after.progress.totalXp).toBeGreaterThanOrEqual(summary.xpEarned);
});

test("parent check-in counts once per day and reward claim flows to approval", () => {
  const c = setupChild();
  useApp.getState().parentCheckin(c.id, "viewed");
  useApp.getState().parentCheckin(c.id, "viewed");
  const fam = useApp.getState().child(c.id)!.progress.quests.find((q) => q.kind === "family")!;
  expect(fam.parentProgress).toBe(1);
  useApp.getState().addReward({ childId: null, title: "Pick dinner", costXp: 0, milestoneLevel: null });
  const r = useApp.getState().rewards[0]!;
  useApp.getState().claimReward(r.id, c.id);
  const claim = useApp.getState().claims[0]!;
  useApp.getState().resolveClaim(claim.id, "approved");
  expect(useApp.getState().claims[0]!.status).toBe("approved");
});

test("demo mode (no Supabase env) never queues network calls", () => {
  setupChild();
  expect(useApp.getState().pending).toHaveLength(0);
});
