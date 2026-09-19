import { mascotLine, MASCOT_MOMENTS } from "./mascot";

describe("mascotLine", () => {
  it("has 3 distinct variants per moment, each <= 12 words", () => {
    for (const m of MASCOT_MOMENTS) {
      const v = new Set([0, 1, 2].map((i) => mascotLine(m, i)));
      expect(v.size, m).toBe(3);
      for (const line of v) expect(line.split(/\s+/).length, line).toBeLessThanOrEqual(12);
    }
  });
  it("wraps seed numbers", () => {
    expect(mascotLine("hello", 3)).toBe(mascotLine("hello", 0));
  });
});
