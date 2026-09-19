import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { seed, playerLevel } from "@coaching/core";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { AVATARS } from "@/lib/constants";

export default function Me() {
  const child = useApp((s) => s.child());
  const update = useApp((s) => s.updateChild);
  if (!child) return null;
  const lvl = playerLevel(child.progress.totalXp);
  const nextXp = (lvl + 1) ** 2 * 50;
  const settings = (child.progress as unknown as { settings?: Record<string, boolean> }).settings ?? {};
  return (
    <Screen>
      <View className="items-center gap-2">
        <Text className="text-7xl">{child.avatar.emoji}</Text>
        <Text variant="title">{child.nickname}</Text>
        <Text variant="h2">Level {lvl}</Text>
        <Progress value={(child.progress.totalXp / nextXp) * 100} className="w-2/3" />
        <Text variant="muted">{child.progress.totalXp} / {nextXp} XP · 🔥 {child.progress.streak.current} day streak (best {child.progress.streak.longest})</Text>
      </View>
      <Text variant="h2">Badges</Text>
      <View className="flex-row flex-wrap gap-3">
        {seed.badges.map((b) => { const got = child.progress.badges.includes(b.id); return (
          <Card key={b.id} className={`w-[30%] items-center ${got ? "border-secondary bg-secondary/20" : "opacity-40"}`}><Text className="text-3xl">{got ? b.emoji : "🔒"}</Text><Text className="text-center text-xs font-bold">{b.name}</Text></Card>
        ); })}
      </View>
      <Text variant="h2">Change my look</Text>
      <View className="flex-row flex-wrap gap-3">
        {AVATARS.map((a) => <Pressable key={a.emoji} accessibilityRole="button" onPress={() => update(child.id, { avatar: a })} className={`h-14 w-14 items-center justify-center rounded-full border-4 ${child.avatar.emoji === a.emoji ? "border-primary" : "border-transparent"}`} style={{ backgroundColor: a.color }}><Text className="text-2xl">{a.emoji}</Text></Pressable>)}
      </View>
      <Text variant="h2">Focus sport</Text>
      <View className="flex-row flex-wrap gap-2">
        {child.sports.map((cs) => { const sp = seed.sports.find((s) => s.id === cs.sportId)!; return <Chip key={cs.sportId} label={`${sp.emoji} ${sp.name}`} selected={cs.isFocus} onPress={() => update(child.id, { sports: child.sports.map((s) => ({ ...s, isFocus: s.sportId === cs.sportId })) })} />; })}
      </View>
      <Text variant="h2">Difficulty (max {child.difficultyCap})</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((d) => <Chip key={d} label={String(d)} selected={d === child.difficultyCap} onPress={() => d <= child.difficultyCap && update(child.id, { difficultyCap: d })} className={d > child.difficultyCap ? "opacity-40" : ""} />)}
      </View>
      <Text variant="muted">🔒 Sounds, read-aloud, and your parent's settings live in the Parent area.</Text>
      <Button variant="outline" title="Switch player" onPress={() => router.push("/who")} />
    </Screen>
  );
}
