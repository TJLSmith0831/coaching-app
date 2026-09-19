import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  buildSkeleton, seed, newChildProgress, ensurePath, completeSession, openChest, ensureQuests, recordScan, parentCheckin, rollChest,
  type ChildProgress, type CompleteSessionInput, type Level, type SessionSummary, type Space, type SportId,
} from "@coaching/core";
import { callFn, HardRejection, supabase } from "./supabase";
import { todayLocal, uuid } from "./utils";

export interface ChildSport { sportId: SportId; level: Level; positionIds: string[]; goalTrackIds: string[]; isFocus: boolean }
export interface LocalSpot { id: string; label: string; surface: string; space: Space; fixtures: string[]; confidence: number; isFavorite: boolean }
export interface Child {
  id: string; nickname: string; birthMonth: number; birthYear: number; avatar: { emoji: string; color: string };
  sports: ChildSport[]; equipment: string[]; spots: LocalSpot[]; availability: { minutesByDow: number[]; reminderTime: string };
  dailyGoalXp: number; difficultyCap: number; pin: string; onboarded: boolean; progress: ChildProgress;
}
export interface Reward { id: string; childId: string | null; title: string; costXp: number | null; milestoneLevel: number | null }
export interface Claim { id: string; rewardId: string; childId: string; status: "pending" | "approved" | "denied"; claimedAt: string }
interface Pending { id: string; name: string; body: Record<string, unknown>; childId?: string }

export const ageOf = (c: Pick<Child, "birthMonth" | "birthYear">) => {
  const d = new Date();
  return d.getFullYear() - c.birthYear - (d.getMonth() + 1 < c.birthMonth ? 1 : 0);
};

interface State {
  parent: { id: string; firstName: string; email: string } | null;
  children: Child[];
  activeChildId: string | null;
  rewards: Reward[];
  claims: Claim[];
  checkins: Record<string, true>;
  pending: Pending[];
  syncing: boolean;

  setParent(p: State["parent"]): void;
  signOut(): void;
  addChild(input: Pick<Child, "nickname" | "birthMonth" | "birthYear" | "avatar"> & Partial<Child>): Child;
  updateChild(id: string, patch: Partial<Child>): void;
  removeChild(id: string): void;
  setActiveChild(id: string | null): void;
  child(id?: string | null): Child | undefined;

  regeneratePaths(childId: string): void;
  ensureDailyQuests(childId: string): void;
  completeSession(childId: string, sessionId: string, input: CompleteSessionInput): SessionSummary;
  openChest(childId: string, sportId: SportId, unit: number, level: number): number;
  recordScan(childId: string, mode: "spot" | "gear", data: { spot?: Omit<LocalSpot, "id" | "isFavorite">; equipment?: string[] }): LocalSpot | null;
  parentCheckin(childId: string, kind: "viewed" | "cheered" | "approved"): void;

  addReward(r: Omit<Reward, "id">): void;
  removeReward(id: string): void;
  claimReward(rewardId: string, childId: string): void;
  resolveClaim(claimId: string, status: "approved" | "denied"): void;

  enqueue(name: string, body: Record<string, unknown>, childId?: string): void;
  flush(): Promise<void>;
}

function skeletonsFor(child: Child) {
  const cap = child.difficultyCap;
  return child.sports.map((cs) => ({
    sportId: cs.sportId,
    skeleton: buildSkeleton({
      sportId: cs.sportId,
      tracks: seed.tracks.filter((t) => t.sportId === cs.sportId),
      positions: seed.positions.filter((p) => cs.positionIds.includes(p.id)),
      goalTrackIds: cs.goalTrackIds, level: cs.level, difficultyCap: cap,
    }),
  }));
}

export const useApp = create<State>()(
  persist(
    (set, get) => {
      const patchChild = (id: string, fn: (c: Child) => Child) =>
        set((s) => ({ children: s.children.map((c) => (c.id === id ? fn(c) : c)) }));
      const remoteChild = (c: Child) => {
        get().enqueue("table:children", {
          id: c.id, nickname: c.nickname, birth_month: c.birthMonth, birth_year: c.birthYear, avatar: c.avatar,
          difficulty_cap: c.difficultyCap, daily_goal_xp: c.dailyGoalXp,
          sports: c.sports.map((s) => ({ child_id: c.id, sport_id: s.sportId, level: s.level, position_ids: s.positionIds, goal_track_ids: s.goalTrackIds, is_focus: s.isFocus })),
          equipment: c.equipment, availability: { child_id: c.id, minutes_by_dow: c.availability.minutesByDow, reminder_time: c.availability.reminderTime },
        }, c.id);
      };

      return {
        parent: null, children: [], activeChildId: null, rewards: [], claims: [], checkins: {}, pending: [], syncing: false,

        setParent: (parent) => set({ parent }),
        signOut: () => { supabase?.auth.signOut(); set({ parent: null, children: [], activeChildId: null, rewards: [], claims: [], checkins: {}, pending: [] }); },

        addChild: (input) => {
          const child: Child = {
            id: uuid(), sports: [], equipment: [], spots: [], availability: { minutesByDow: [0, 10, 0, 10, 0, 0, 10], reminderTime: "17:30" },
            dailyGoalXp: 40, difficultyCap: 3, pin: "", onboarded: false, progress: newChildProgress(40), ...input,
          };
          set((s) => ({ children: [...s.children, child] }));
          remoteChild(child);
          if (child.pin) get().enqueue("set-child-pin", { child_id: child.id, pin: child.pin }, child.id);
          return child;
        },
        updateChild: (id, patch) => {
          patchChild(id, (c) => ({ ...c, ...patch }));
          const c = get().child(id);
          if (!c) return;
          remoteChild(c);
          if (patch.pin) get().enqueue("set-child-pin", { child_id: id, pin: patch.pin }, id);
          if (patch.sports || patch.difficultyCap !== undefined) get().regeneratePaths(id);
        },
        removeChild: (id) => {
          set((s) => ({ children: s.children.filter((c) => c.id !== id), activeChildId: s.activeChildId === id ? null : s.activeChildId }));
          get().enqueue("table:delete-child", { id });
        },
        setActiveChild: (activeChildId) => set({ activeChildId }),
        child: (id) => { const cid = id ?? get().activeChildId; return get().children.find((c) => c.id === cid); },

        regeneratePaths: (childId) => {
          patchChild(childId, (c) => {
            let progress = c.progress;
            for (const { sportId, skeleton } of skeletonsFor(c)) progress = ensurePath(progress, sportId, skeleton);
            return { ...c, progress: ensureQuests(progress, todayLocal(), seed) };
          });
          for (const cs of get().child(childId)?.sports ?? []) get().enqueue("generate-path", { child_id: childId, sport_id: cs.sportId }, childId);
        },
        ensureDailyQuests: (childId) => patchChild(childId, (c) => ({ ...c, progress: ensureQuests(c.progress, todayLocal(), seed) })),

        completeSession: (childId, sessionId, input) => {
          const c = get().child(childId)!;
          const { progress, summary } = completeSession(c.progress, input, seed);
          patchChild(childId, (x) => ({ ...x, progress }));
          get().enqueue("complete-session", { session_id: sessionId, child_id: childId, results: input.results, today: input.today, replay: input.replay }, childId);
          return summary;
        },
        openChest: (childId, sportId, unit, level) => {
          const c = get().child(childId)!;
          const key = `${unit}:${level}`;
          const already = c.progress.paths[sportId]?.chestsOpened[key];
          if (already !== undefined) return already;
          const { xp } = rollChest(`${childId}:${sportId}:${unit}:${level}`); // same seed as server → same surprise
          patchChild(childId, (x) => ({ ...x, progress: openChest(x.progress, sportId, unit, level, xp) }));
          get().enqueue("open-chest", { child_id: childId, sport_id: sportId, unit, level }, childId);
          return xp;
        },
        recordScan: (childId, mode, data) => {
          const today = todayLocal();
          let spot: LocalSpot | null = null;
          patchChild(childId, (c) => {
            let next = { ...c, progress: recordScan(c.progress, mode, today, seed) };
            if (data.spot) { spot = { ...data.spot, id: uuid(), isFavorite: false }; next = { ...next, spots: [spot, ...c.spots].slice(0, 10) }; }
            if (data.equipment) next = { ...next, equipment: Array.from(new Set([...c.equipment, ...data.equipment])) };
            return next;
          });
          const s = spot as LocalSpot | null;
          get().enqueue("record-scan", { child_id: childId, mode, today, spot: s ? { id: s.id, label: s.label, surface: s.surface, space: s.space, fixtures: s.fixtures, confidence: s.confidence } : undefined, equipment_type_ids: data.equipment }, childId);
          if (data.equipment) get().regeneratePaths(childId);
          return spot;
        },
        parentCheckin: (childId, kind) => {
          const today = todayLocal();
          const key = `${childId}:${today}:${kind}`;
          if (get().checkins[key]) return;
          set((s) => ({ checkins: { ...s.checkins, [key]: true } }));
          patchChild(childId, (c) => ({ ...c, progress: parentCheckin(c.progress, today) }));
          get().enqueue("parent-checkin", { child_id: childId, kind, today }, childId);
        },

        addReward: (r) => { const reward = { ...r, id: uuid() }; set((s) => ({ rewards: [...s.rewards, reward] })); get().enqueue("table:rewards", reward); },
        removeReward: (id) => { set((s) => ({ rewards: s.rewards.filter((r) => r.id !== id) })); get().enqueue("table:delete-reward", { id }); },
        claimReward: (rewardId, childId) => {
          const claim: Claim = { id: uuid(), rewardId, childId, status: "pending", claimedAt: new Date().toISOString() };
          set((s) => ({ claims: [...s.claims, claim] }));
          get().enqueue("table:claims", { ...claim });
        },
        resolveClaim: (claimId, status) => {
          set((s) => ({ claims: s.claims.map((c) => (c.id === claimId ? { ...c, status } : c)) }));
          const claim = get().claims.find((c) => c.id === claimId);
          if (claim) { get().enqueue("table:claims", { ...claim, status }); get().parentCheckin(claim.childId, "approved"); }
        },

        enqueue: (name, body, childId) => {
          if (!supabase) return; // demo mode: local only
          set((s) => ({ pending: [...s.pending, { id: uuid(), name, body, childId }] }));
          void get().flush();
        },
        flush: async () => {
          if (!supabase || get().syncing) return;
          set({ syncing: true });
          try {
            while (get().pending.length) {
              const item = get().pending[0]!;
              try {
                const res = await runPending(item);
                const progress = (res as { progress?: ChildProgress } | null)?.progress;
                if (progress && item.childId) {
                  // Reconcile with server truth only when nothing else is queued for this child.
                  const others = get().pending.slice(1).some((p) => p.childId === item.childId);
                  if (!others) patchChild(item.childId, (c) => ({ ...c, progress }));
                }
                set((s) => ({ pending: s.pending.filter((p) => p.id !== item.id) }));
              } catch (e) {
                if (e instanceof HardRejection) {
                  set((s) => ({ pending: s.pending.filter((p) => p.id !== item.id) }));
                  if (item.childId) {
                    const truth = await callFn<{ progress: ChildProgress }>("sync-progress", { child_id: item.childId, today: todayLocal() }).catch(() => null);
                    if (truth?.progress) patchChild(item.childId, (c) => ({ ...c, progress: truth.progress }));
                  }
                } else break; // network: keep queued, retry later
              }
            }
          } finally { set({ syncing: false }); }
        },
      };
    },
    { name: "coach-app", storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ ...s, syncing: false }) },
  ),
);

async function runPending(item: Pending): Promise<unknown> {
  if (!supabase) return null;
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid) throw new Error("no session");
  const b = item.body as Record<string, any>;
  const must = (r: { error: { message: string; code?: string } | null }) => {
    if (r.error) { const code = r.error.code ?? ""; if (/^(23|42|22|PGRST)/.test(code)) throw new HardRejection(400, r.error.message); throw new Error(r.error.message); }
  };
  switch (item.name) {
    case "table:children": {
      must(await supabase.from("children").upsert({ id: b.id, parent_id: uid, nickname: b.nickname, birth_month: b.birth_month, birth_year: b.birth_year, avatar: b.avatar, difficulty_cap: b.difficulty_cap, daily_goal_xp: b.daily_goal_xp }));
      must(await supabase.from("child_sports").delete().eq("child_id", b.id));
      if (b.sports.length) must(await supabase.from("child_sports").insert(b.sports));
      must(await supabase.from("child_equipment").delete().eq("child_id", b.id));
      if (b.equipment.length) must(await supabase.from("child_equipment").insert(b.equipment.map((e: string) => ({ child_id: b.id, equipment_type_id: e, source: "manual" }))));
      must(await supabase.from("availability").upsert(b.availability));
      return null;
    }
    case "table:delete-child": must(await supabase.from("children").delete().eq("id", b.id)); return null;
    case "table:rewards": must(await supabase.from("rewards").upsert({ id: b.id, parent_id: uid, child_id: b.childId, title: b.title, cost_xp: b.costXp, milestone: b.milestoneLevel ? { level: b.milestoneLevel } : null })); return null;
    case "table:delete-reward": must(await supabase.from("rewards").delete().eq("id", b.id)); return null;
    case "table:claims": must(await supabase.from("reward_claims").upsert({ id: b.id, reward_id: b.rewardId, child_id: b.childId, status: b.status, claimed_at: b.claimedAt, resolved_at: b.status === "pending" ? null : new Date().toISOString() })); return null;
    default: return callFn(item.name, item.body);
  }
}
