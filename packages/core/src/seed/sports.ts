import type { EquipmentType, PositionContent, SkillTrack, Sport } from "../types";

export const sports: Sport[] = [
  { id: "soccer", name: "Soccer", emoji: "⚽", coreEquipment: ["soccer_ball"], sort: 0 },
  { id: "basketball", name: "Basketball", emoji: "🏀", coreEquipment: ["basketball"], sort: 1 },
  { id: "football", name: "Flag Football", emoji: "🏈", coreEquipment: ["football"], sort: 2 },
  { id: "tennis", name: "Tennis", emoji: "🎾", coreEquipment: ["racket", "tennis_ball"], sort: 3 },
  { id: "baseball", name: "Baseball", emoji: "⚾", coreEquipment: ["glove", "soft_ball"], sort: 4 },
];

export const equipment: EquipmentType[] = [
  { id: "soccer_ball", name: "Soccer ball", emoji: "⚽", sportIds: ["soccer"] },
  { id: "basketball", name: "Basketball", emoji: "🏀", sportIds: ["basketball"] },
  { id: "football", name: "Football", emoji: "🏈", sportIds: ["football"] },
  { id: "tennis_ball", name: "Tennis ball", emoji: "🎾", sportIds: ["tennis", "baseball"] },
  { id: "racket", name: "Racket", emoji: "🎾", sportIds: ["tennis"] },
  { id: "glove", name: "Glove", emoji: "🧤", sportIds: ["baseball"] },
  { id: "soft_ball", name: "Soft baseball", emoji: "⚾", sportIds: ["baseball"] },
  { id: "bat", name: "Bat", emoji: "🏏", sportIds: ["baseball"] },
  { id: "tee", name: "Batting tee", emoji: "🔺", sportIds: ["baseball"] },
  { id: "cones", name: "Cones", emoji: "🔶", sportIds: ["soccer", "basketball", "football", "tennis", "baseball"] },
  { id: "hoop", name: "Hoop", emoji: "🏀", sportIds: ["basketball"] },
  { id: "goal", name: "Goal", emoji: "🥅", sportIds: ["soccer"] },
  { id: "net", name: "Net", emoji: "🥅", sportIds: ["tennis"] },
];

const t = (sportId: Sport["id"], ids: [string, string][]): SkillTrack[] =>
  ids.map(([id, name], i) => ({ id: `${sportId}_${id}`, sportId, name, sort: i }));

export const tracks: SkillTrack[] = [
  ...t("soccer", [["control", "Ball Control"], ["passing", "Passing"], ["dribbling", "Dribbling"], ["shooting", "Shooting"], ["position", "Position Skills"]]),
  ...t("basketball", [["handles", "Handles"], ["passing", "Passing"], ["shooting", "Shooting Form"], ["finishing", "Finishing"], ["defense", "Defense"]]),
  ...t("football", [["security", "Ball Security"], ["throwing", "Throwing"], ["routes", "Routes"], ["catching", "Catching"], ["defense", "Flag Defense"]]),
  ...t("tennis", [["feel", "Racket Feel"], ["forehand", "Forehand"], ["backhand", "Backhand"], ["serve", "Serve"], ["footwork", "Footwork"]]),
  ...t("baseball", [["throwing", "Throwing"], ["fielding", "Fielding"], ["hitting", "Hitting"], ["running", "Base Running"], ["position", "Position Skills"]]),
];

const p = (sportId: Sport["id"], id: string, name: string, blurb: string, w: Record<string, number>, age: [number, number] = [8, 13], sort = 0): PositionContent => ({
  id: `${sportId}_${id}`, sportId, name, blurb, sort, ageMin: age[0], ageMax: age[1],
  trackWeights: Object.fromEntries(Object.entries(w).map(([k, v]) => [`${sportId}_${k}`, v])),
});

export const positions: PositionContent[] = [
  p("soccer", "gk", "Goalkeeper", "Last line of defense. Quick hands, brave dives.", { position: 3, control: 1 }, [8, 13], 0),
  p("soccer", "defender", "Defender", "Stop attacks and start plays.", { passing: 3, control: 2, position: 1 }, [8, 13], 1),
  p("soccer", "midfielder", "Midfielder", "Run the game from the middle.", { passing: 3, control: 2, dribbling: 2 }, [8, 13], 2),
  p("soccer", "forward", "Forward", "Score goals. Lots of them.", { shooting: 3, dribbling: 2 }, [8, 13], 3),
  p("basketball", "guard", "Guard", "Handle the ball and set up plays.", { handles: 3, passing: 2 }, [8, 13], 0),
  p("basketball", "wing", "Wing", "Shoot, cut, and finish fast.", { shooting: 3, finishing: 2 }, [8, 13], 1),
  p("basketball", "big", "Big", "Own the paint. Rebound and finish.", { finishing: 3, defense: 2 }, [8, 13], 2),
  p("football", "qb", "Quarterback", "Throw the ball and lead the team.", { throwing: 3, security: 1 }, [8, 13], 0),
  p("football", "receiver", "Receiver", "Run routes and catch everything.", { routes: 3, catching: 3 }, [8, 13], 1),
  p("football", "rb", "Running Back", "Take the ball and go.", { security: 3, routes: 1 }, [8, 13], 2),
  p("football", "defender", "Defender", "Pull flags and stop the play.", { defense: 3, catching: 1 }, [8, 13], 3),
  p("tennis", "baseliner", "Baseliner", "Hit big from the back of the court.", { forehand: 3, backhand: 2, footwork: 1 }, [8, 13], 0),
  p("tennis", "net", "Net Player", "Get close and finish points fast.", { footwork: 3, feel: 2 }, [8, 13], 1),
  p("tennis", "allcourt", "All-Court", "A little bit of everything, everywhere.", { forehand: 2, backhand: 2, serve: 2, footwork: 2 }, [11, 13], 2),
  p("baseball", "pitcher", "Pitcher", "Throw strikes. Stay cool.", { throwing: 3, position: 2 }, [8, 13], 0),
  p("baseball", "catcher", "Catcher", "Catch every pitch and lead the field.", { position: 3, throwing: 1 }, [8, 13], 1),
  p("baseball", "infield", "Infield", "Quick feet, quick hands, quick throws.", { fielding: 3, throwing: 2 }, [8, 13], 2),
  p("baseball", "outfield", "Outfield", "Track fly balls and throw far.", { fielding: 2, throwing: 2, running: 1 }, [8, 13], 3),
];
