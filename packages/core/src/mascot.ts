export type MascotPose = "idle" | "cheer" | "think" | "sleep" | "nudge" | "stretch";
export const MASCOT_MOMENTS = ["hello", "analyzing", "praise", "nudge", "chestOpen", "unitComplete", "emptyPath", "error"] as const;
export type MascotMoment = (typeof MASCOT_MOMENTS)[number];

// Coach: dachshund, short legs, big whistle, bad at jumping. Encouraging only.
const LINES: Record<MascotMoment, [string, string, string]> = {
  hello: ["Hi! I'm Coach. Let's find your first level!", "Short legs, big heart. Ready to practice?", "I tried this drill first. You'll do better!"],
  analyzing: ["Sniffing out the best drills...", "Let me look. My nose knows.", "Checking the space. Hold on!"],
  praise: ["Wow! You did that better than I can jump.", "That's a wag-worthy session!", "Big legs or not, you crushed it!"],
  nudge: ["Quick practice today? Even 5 minutes counts!", "I saved a spot for you. Ready?", "Your streak is waiting. Let's go!"],
  chestOpen: ["Ooh, what's inside? Open it!", "I dug this up for you!", "Treasure! Tap to see."],
  unitComplete: ["Whole unit done! Zoomies time!", "You finished the unit. I'm so proud!", "New unit unlocked. Let's fetch it!"],
  emptyPath: ["Pick a sport and I'll build your path.", "No path yet. Let's make one!", "Where do we start? You choose."],
  error: ["Hmm, that didn't stick. Try once more?", "My paws slipped. One more try!", "Oops. Let's give it another go."],
};

export const mascotLine = (moment: MascotMoment, seed: number): string => LINES[moment][Math.abs(seed) % 3]!;
