import { classifyGear, classifySpot, type Rgb } from "./scan";

const fill = (n: number, c: Rgb) => Array.from({ length: n }, () => c);
const W = 8, H = 8;

test("grass field → grass, no wall", () => {
  const px = [...fill(32, { r: 120, g: 160, b: 200 }), ...fill(32, { r: 40, g: 150, b: 50 })];
  const g = classifySpot(px, W, H);
  expect(g.surface).toBe("grass");
  expect(g.fixtures).not.toContain("wall");
  expect(g.confidence).toBeGreaterThan(0.5);
});

test("gray driveway with gray wall above → concrete + wall + small", () => {
  const px = [...fill(32, { r: 150, g: 150, b: 150 }), ...fill(32, { r: 120, g: 120, b: 125 })];
  const g = classifySpot(px, W, H);
  expect(g.surface).toBe("concrete");
  expect(g.fixtures).toContain("wall");
  expect(g.space).toBe("small");
});

test("orange blob → basketball; yellow-green → tennis ball", () => {
  const px = [...fill(20, { r: 220, g: 120, b: 40 }), ...fill(10, { r: 200, g: 240, b: 60 }), ...fill(34, { r: 150, g: 150, b: 150 })];
  const g = classifyGear(px, ["basketball", "tennis"]);
  expect(g.ids).toEqual(expect.arrayContaining(["basketball", "tennis_ball"]));
});

test("nothing recognizable → low confidence, empty", () => {
  expect(classifyGear(fill(64, { r: 150, g: 150, b: 150 }), ["soccer"])).toEqual({ ids: [], confidence: 0.2 });
});
