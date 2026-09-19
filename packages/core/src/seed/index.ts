import type { SeedBundle } from "../types";
import { drills } from "./drills";
import { badges, questTemplates } from "./meta";
import { equipment, positions, sports, tracks } from "./sports";

export const seed: SeedBundle = { sports, tracks, positions, drills, equipment, badges, questTemplates };
