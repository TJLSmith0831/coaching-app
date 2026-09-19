import type { Space } from "@coaching/core";

export interface Rgb { r: number; g: number; b: number }
export interface SpotGuess { surface: "grass" | "concrete" | "court" | "indoor" | "unknown"; space: Space; fixtures: string[]; confidence: number }
export interface GearGuess { ids: string[]; confidence: number }

/** Decoded pixels → coarse color buckets. Pure so it can be unit tested. */
export function buckets(px: Rgb[]) {
  const c = { green: 0, gray: 0, orange: 0, brown: 0, yellowGreen: 0, white: 0, dark: 0, blue: 0, total: px.length };
  for (const { r, g, b } of px) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b), sat = max === 0 ? 0 : (max - min) / max;
    if (max < 60) c.dark++;
    else if (sat < 0.15 && max > 200) c.white++;
    else if (sat < 0.2) c.gray++;
    else if (b > r * 1.1 && b >= g) c.blue++;
    else if (g > r * 1.15 && g > b * 1.15 && r > 120) c.yellowGreen++;
    else if (g > r && g > b) c.green++;
    else if (r > 180 && g > 80 && g < 170 && b < 90) c.orange++;
    else if (r > g && g > b && r < 200) c.brown++;
    else c.gray++;
  }
  return c;
}

/** Bottom half = ground, top edges/contrast = wall-ish. */
export function classifySpot(px: Rgb[], width: number, height: number): SpotGuess {
  const ground = px.filter((_, i) => Math.floor(i / width) >= height / 2);
  const b = buckets(ground);
  const f = (n: number) => n / Math.max(1, b.total);
  let surface: SpotGuess["surface"] = "unknown", conf = 0.3;
  if (f(b.green) > 0.45) { surface = "grass"; conf = Math.min(0.95, f(b.green)); }
  else if (f(b.gray) + f(b.white) > 0.5) { surface = "concrete"; conf = Math.min(0.9, f(b.gray) + f(b.white)); }
  else if (f(b.orange) + f(b.brown) > 0.35) { surface = f(b.orange) > f(b.brown) ? "court" : "indoor"; conf = 0.6; }
  // ponytail: space from top-half uniformity; a real depth model would replace this
  const top = px.filter((_, i) => Math.floor(i / width) < height / 2);
  const tb = buckets(top);
  const uniform = Math.max(tb.gray, tb.white, tb.green, tb.brown, tb.blue) / Math.max(1, tb.total);
  const fixtures: string[] = [];
  if (uniform > 0.6 && tb.gray + tb.white + tb.brown > tb.green + tb.blue) fixtures.push("wall");
  const space: Space = fixtures.includes("wall") ? "small" : uniform > 0.7 ? "large" : "medium";
  return { surface, space, fixtures, confidence: conf };
}

export function classifyGear(px: Rgb[], sportIds: string[]): GearGuess {
  const b = buckets(px);
  const f = (n: number) => n / Math.max(1, b.total);
  const ids = new Set<string>();
  if (f(b.orange) > 0.08) ids.add("basketball");
  if (f(b.yellowGreen) > 0.05) ids.add("tennis_ball");
  if (f(b.white) > 0.12 && f(b.dark) > 0.04 && sportIds.includes("soccer")) ids.add("soccer_ball");
  if (f(b.brown) > 0.1) { if (sportIds.includes("football")) ids.add("football"); if (sportIds.includes("baseball")) ids.add("glove"); }
  const confidence = ids.size ? Math.min(0.85, 0.4 + ids.size * 0.15) : 0.2;
  return { ids: [...ids], confidence };
}
