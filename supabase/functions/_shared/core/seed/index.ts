import type { SeedBundle } from "../types.ts";
import { drills } from "./drills.ts";
import { badges, questTemplates } from "./meta.ts";
import { equipment, positions, sports, tracks } from "./sports.ts";

export const seed: SeedBundle = { sports, tracks, positions, drills, equipment, badges, questTemplates };
