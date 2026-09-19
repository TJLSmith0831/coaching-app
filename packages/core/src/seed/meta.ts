import type { Badge, QuestTemplate } from "../types";

export const badges: Badge[] = [
  { id: "first_whistle", name: "First Whistle", description: "Finished your first level.", emoji: "🎽", rule: { type: "sessions", n: 1 } },
  { id: "hat_trick", name: "Hat Trick", description: "Three levels done.", emoji: "🎩", rule: { type: "sessions", n: 3 } },
  { id: "week_warrior", name: "Week Warrior", description: "7-day streak.", emoji: "🔥", rule: { type: "streak", n: 7 } },
  { id: "month_strong", name: "Month Strong", description: "30-day streak.", emoji: "💪", rule: { type: "streak", n: 30 } },
  { id: "gold_unit", name: "Gold Unit", description: "Three stars on every level in a unit.", emoji: "🥇", rule: { type: "goldUnit" } },
  { id: "explorer", name: "Explorer", description: "Saved 3 practice spots.", emoji: "🧭", rule: { type: "spots", n: 3 } },
  { id: "gear_head", name: "Gear Head", description: "Scanned your gear.", emoji: "🎒", rule: { type: "gearScan" } },
  { id: "both_feet", name: "Both Feet", description: "10 ball control drills.", emoji: "👟", rule: { type: "trackDrills", sportId: "soccer", skillTrackId: "soccer_control", n: 10 } },
  { id: "sharpshooter", name: "Sharpshooter", description: "10 shooting drills.", emoji: "🎯", rule: { type: "trackDrills", sportId: "basketball", skillTrackId: "basketball_shooting", n: 10 } },
  { id: "route_runner", name: "Route Runner", description: "10 route drills.", emoji: "🏃", rule: { type: "trackDrills", sportId: "football", skillTrackId: "football_routes", n: 10 } },
  { id: "wall_rally", name: "Wall Rally 20", description: "10 forehand drills.", emoji: "🧱", rule: { type: "trackDrills", sportId: "tennis", skillTrackId: "tennis_forehand", n: 10 } },
  { id: "glove_work", name: "Glove Work", description: "10 fielding drills.", emoji: "🧤", rule: { type: "trackDrills", sportId: "baseball", skillTrackId: "baseball_fielding", n: 10 } },
  { id: "family_1", name: "Family Team", description: "Finished a Family Quest together.", emoji: "👨‍👧", rule: { type: "familyQuests", n: 1 } },
  { id: "family_5", name: "Family Legends", description: "Five Family Quests together.", emoji: "🏆", rule: { type: "familyQuests", n: 5 } },
];

export const questTemplates: QuestTemplate[] = [
  { id: "daily_xp_30", kind: "daily", title: "Earn 30 XP", rule: { type: "xp", n: 30 }, xpReward: 10 },
  { id: "daily_xp_60", kind: "daily", title: "Earn 60 XP", rule: { type: "xp", n: 60 }, xpReward: 20 },
  { id: "daily_level_1", kind: "daily", title: "Finish 1 level", rule: { type: "levels", n: 1 }, xpReward: 10 },
  { id: "daily_level_2", kind: "daily", title: "Finish 2 levels", rule: { type: "levels", n: 2 }, xpReward: 25 },
  { id: "daily_scan", kind: "daily", title: "Scan a spot or your gear", rule: { type: "scan" }, xpReward: 15 },
  { id: "daily_drills_5", kind: "daily", title: "Do 5 drills", rule: { type: "drillsInTrack", n: 5 }, xpReward: 15 },
  { id: "family_levels_3", kind: "family", title: "Finish 3 levels this week", rule: { type: "levels", n: 3 }, xpReward: 100 },
  { id: "family_levels_5", kind: "family", title: "Finish 5 levels this week", rule: { type: "levels", n: 5 }, xpReward: 150 },
];
