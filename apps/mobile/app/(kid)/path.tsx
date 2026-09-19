import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { seed, mascotLine, type SportId } from "@coaching/core";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PathHeader } from "@/components/path-header";
import { useApp } from "@/lib/store";

export default function Path() {
  const child = useApp((s) => s.child());
  const regenerate = useApp((s) => s.regeneratePaths);
  const ensureQuests = useApp((s) => s.ensureDailyQuests);
  const openChest = useApp((s) => s.openChest);
  const [sportId, setSportId] = useState<SportId | null>(null);
  const [chest, setChest] = useState<{ unit: number; level: number; xp: number | null } | null>(null);

  useEffect(() => { if (child) { ensureQuests(child.id); if (Object.keys(child.progress.paths).length === 0 && child.sports.length) regenerate(child.id); } }, [child?.id]);
  if (!child) return null;
  const focus = child.sports.find((s) => s.isFocus)?.sportId ?? child.sports[0]?.sportId;
  const sid = sportId ?? focus;
  const path = sid ? child.progress.paths[sid] : undefined;

  if (!sid || !path) {
    return (
      <Screen><PathHeader child={child} pose="think" line={mascotLine("emptyPath", 0)} /><Button title="Build my path" onPress={() => regenerate(child.id)} /></Screen>
    );
  }
  const cur = path.current;
  const onOpenChest = (unit: number, level: number) => {
    setChest({ unit, level, xp: null });
    setTimeout(() => setChest({ unit, level, xp: openChest(child.id, sid, unit, level) }), 900);
  };

  return (
    <Screen>
      <PathHeader child={child} />
      {child.sports.length > 1 ? (
        <View className="flex-row gap-2">
          {child.sports.map((cs) => { const sp = seed.sports.find((s) => s.id === cs.sportId)!; return <Chip key={cs.sportId} label={`${sp.emoji} ${sp.name}`} selected={cs.sportId === sid} onPress={() => setSportId(cs.sportId)} />; })}
        </View>
      ) : null}
      {path.skeleton.units.map((unit, u) => {
        const track = seed.tracks.find((t) => t.id === unit.skillTrackId);
        const unitStars = unit.levels.filter((l) => l.kind !== "chest").reduce((s, l) => s + (path.stars[`${u}:${l.sort}`] ?? 0), 0);
        const locked = u > cur.unit;
        return (
          <View key={u} className={`gap-3 rounded-lg p-4 ${locked ? "bg-muted/60" : "bg-card border border-border"}`}>
            <View className="flex-row items-center justify-between">
              <Text variant="h2">{unit.isGoal ? "🎯 " : ""}Unit {u + 1}: {track?.name}</Text>
              <Text variant="muted">⭐ {unitStars}</Text>
            </View>
            <View className="flex-row flex-wrap gap-3">
              {unit.levels.map((lvl) => {
                const key = `${u}:${lvl.sort}`;
                const isCur = u === cur.unit && lvl.sort === cur.level;
                const done = lvl.kind === "chest" ? path.chestsOpened[key] !== undefined : path.stars[key] !== undefined;
                const isLocked = !done && !isCur;
                const label = lvl.kind === "chest" ? (done ? "🎁" : "🎁") : lvl.kind === "review" ? "🏁" : String(lvl.sort + 1);
                const offset = lvl.sort % 4 === 1 || lvl.sort % 4 === 2 ? 24 : 0;
                return (
                  <Pressable key={key} testID={`node-${sid}-${key}`} disabled={isLocked && !done} accessibilityRole="button"
                    accessibilityLabel={`${lvl.kind} ${lvl.sort + 1}${isCur ? ", current" : done ? ", done" : ", locked"}`}
                    onPress={() => (lvl.kind === "chest" ? (isCur ? onOpenChest(u, lvl.sort) : null) : router.push({ pathname: "/kid/session", params: { sportId: sid, unit: String(u), level: String(lvl.sort), replay: done ? "1" : "0" } }))}
                    style={{ marginLeft: offset }}
                    className={`h-20 w-20 items-center justify-center rounded-full border-4 ${isCur ? "border-accent bg-accent/20" : done ? "border-primary bg-primary/15" : "border-border bg-muted"}`}>
                    <Text className={`text-2xl font-black ${isLocked ? "text-muted-foreground" : ""}`}>{label}</Text>
                    {lvl.kind !== "chest" && done ? <Text className="text-xs">{"⭐".repeat(path.stars[key] ?? 0)}</Text> : null}
                    {isCur ? <Text className="text-xs font-bold text-accent">{lvl.kind === "chest" ? "OPEN" : "START"}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
      {chest ? (
        <View className="absolute inset-0 items-center justify-center bg-black/60 p-8" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
          <View className="w-full items-center gap-4 rounded-lg bg-card p-8">
            <Text className="text-7xl">{chest.xp === null ? "🎁" : "🎉"}</Text>
            <Text variant="title">{chest.xp === null ? "Opening…" : `+${chest.xp} XP!`}</Text>
            {chest.xp !== null ? <><Text className="text-center text-lg">{mascotLine("chestOpen", chest.xp)}</Text><Button title="Nice!" onPress={() => setChest(null)} /></> : null}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
