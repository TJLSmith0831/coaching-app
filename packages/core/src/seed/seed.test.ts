import { seed } from "./index";

const trackIds = new Set(seed.tracks.map((t) => t.id));
const equipIds = new Set(seed.equipment.map((e) => e.id));

describe("seed invariants", () => {
  it("has 5 sports, each with >= 8 drills", () => {
    expect(seed.sports.map((s) => s.id).sort()).toEqual(["baseball", "basketball", "football", "soccer", "tennis"]);
    for (const s of seed.sports) expect(seed.drills.filter((d) => d.sportId === s.id).length).toBeGreaterThanOrEqual(8);
  });

  it("every track has >= 2 drills and >= 1 shadow drill (no gear, small space)", () => {
    for (const t of seed.tracks) {
      const ds = seed.drills.filter((d) => d.skillTrackId === t.id);
      expect(ds.length, t.id).toBeGreaterThanOrEqual(2);
      expect(ds.some((d) => d.isShadow && d.equipmentRequired.length === 0 && d.minSpace === "small"), t.id).toBe(true);
    }
  });

  it("ids are unique and references resolve", () => {
    const all = [seed.sports, seed.tracks, seed.positions, seed.drills, seed.equipment, seed.badges, seed.questTemplates];
    for (const list of all) expect(new Set(list.map((x) => x.id)).size).toBe(list.length);
    for (const p of seed.positions) for (const t of Object.keys(p.trackWeights)) expect(trackIds.has(t), `${p.id}:${t}`).toBe(true);
    for (const d of seed.drills) {
      expect(trackIds.has(d.skillTrackId), d.id).toBe(true);
      for (const e of [...d.equipmentRequired, ...d.equipmentOptional]) expect(equipIds.has(e), `${d.id}:${e}`).toBe(true);
      expect(d.durationSec).toBeGreaterThanOrEqual(60);
      expect(d.durationSec).toBeLessThanOrEqual(300);
      expect(d.difficulty).toBeGreaterThanOrEqual(1);
      expect(d.difficulty).toBeLessThanOrEqual(5);
    }
    for (const s of seed.sports) for (const e of s.coreEquipment) expect(equipIds.has(e)).toBe(true);
    expect(equipIds.has("wall")).toBe(false);
  });

  it("has 14 badges, >= 6 daily and 2 family quest templates", () => {
    expect(seed.badges.length).toBe(14);
    expect(seed.questTemplates.filter((q) => q.kind === "daily").length).toBeGreaterThanOrEqual(6);
    expect(seed.questTemplates.filter((q) => q.kind === "family").length).toBe(2);
  });
});
