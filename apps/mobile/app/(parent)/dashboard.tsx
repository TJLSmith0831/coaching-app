import { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { seed, playerLevel } from "@coaching/core";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mascot } from "@/components/mascot";
import { useApp } from "@/lib/store";
import { todayLocal } from "@/lib/utils";

export default function Dashboard() {
  const parent = useApp((s) => s.parent);
  const children = useApp((s) => s.children);
  const claims = useApp((s) => s.claims);
  const checkin = useApp((s) => s.parentCheckin);
  const setActive = useApp((s) => s.setActiveChild);
  useEffect(() => { children.forEach((c) => checkin(c.id, "viewed")); }, [children.length]);
  const today = todayLocal();
  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Text variant="title">Hi {parent?.firstName || "there"}</Text>
        <Button variant="outline" size="sm" title="Switch player" onPress={() => router.push("/who")} />
      </View>
      <Mascot pose="idle" line="Opening this page counts as a check-in for the Family Quest." size="sm" />
      {children.length === 0 ? <Button title="Add a child" onPress={() => router.push("/onboarding")} /> : null}
      {children.map((c) => {
        const focus = c.sports.find((s) => s.isFocus)?.sportId ?? c.sports[0]?.sportId;
        const path = focus ? c.progress.paths[focus] : undefined;
        const unit = path?.skeleton.units[path.current.unit];
        const track = seed.tracks.find((t) => t.id === unit?.skillTrackId);
        const weekXp = Object.entries(c.progress.dailyXp).filter(([d]) => Date.parse(d) > Date.now() - 7 * 864e5).reduce((s, [, v]) => s + v, 0);
        const family = c.progress.quests.find((q) => q.kind === "family");
        const pending = claims.filter((k) => k.childId === c.id && k.status === "pending").length;
        const xpToday = c.progress.dailyXp[today] ?? 0;
        return (
          <Card key={c.id} className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text variant="h2">{c.avatar.emoji} {c.nickname}</Text>
              <Text variant="muted">Level {playerLevel(c.progress.totalXp)} · 🔥 {c.progress.streak.current}</Text>
            </View>
            <Text variant="body">{path ? `Unit ${path.current.unit + 1}: ${track?.name} · node ${path.current.level + 1}` : "No path yet"}</Text>
            <Text variant="muted">This week: {weekXp} XP · {c.progress.counters.sessions} sessions total</Text>
            <View className="flex-row justify-between"><Text variant="muted">Today's goal</Text><Text variant="muted">{xpToday}/{c.progress.dailyGoalXp}</Text></View>
            <Progress value={(xpToday / c.progress.dailyGoalXp) * 100} className="h-3" />
            {family ? (<>
              <Text variant="muted">Family quest: {c.nickname} {Math.min(family.progress, family.target)}/{family.target} · you {family.parentProgress ?? 0}/{family.parentTarget ?? 3}</Text>
              <Progress value={((family.parentProgress ?? 0) / (family.parentTarget ?? 3)) * 100} className="h-3" barClassName="bg-secondary" />
            </>) : null}
            <View className="flex-row gap-2 pt-1">
              <Button className="flex-1" size="sm" variant="secondary" title="👏 Cheer" onPress={() => checkin(c.id, "cheered")} />
              {pending ? <Button className="flex-1" size="sm" variant="accent" title={`${pending} to approve`} onPress={() => router.push("/(parent)/rewards")} /> : null}
              <Button className="flex-1" size="sm" variant="outline" title="Play as" onPress={() => { setActive(c.id); router.push(c.onboarded ? "/(kid)/path" : "/kid/onboarding"); }} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
