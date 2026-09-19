import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { playerLevel, mascotLine } from "@coaching/core";
import { Text } from "@/components/ui/text";
import { Progress } from "@/components/ui/progress";
import { Mascot } from "@/components/mascot";
import { todayLocal } from "@/lib/utils";
import type { Child } from "@/lib/store";

export function PathHeader({ child, pose = "idle", line }: { child: Child; pose?: "idle" | "cheer" | "nudge" | "think"; line?: string }) {
  const today = todayLocal();
  const xpToday = child.progress.dailyXp[today] ?? 0;
  const atRisk = new Date().getHours() >= 18 && xpToday < child.progress.dailyGoalXp;
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Pressable onLongPress={() => router.push("/who")} accessibilityLabel="Hold to switch player" className="flex-row items-center gap-2">
          <Text className="text-3xl">{child.avatar.emoji}</Text>
          <Text variant="h2">{child.nickname}</Text>
        </Pressable>
        <View className="flex-row items-center gap-3">
          <Text className="text-lg font-bold">🔥 {child.progress.streak.current}</Text>
          <Text className="text-lg font-bold">⭐ L{playerLevel(child.progress.totalXp)}</Text>
        </View>
      </View>
      <Mascot pose={atRisk ? "nudge" : pose} line={line ?? (atRisk ? mascotLine("nudge", xpToday) : undefined)} size="sm" />
      <View className="gap-1">
        <View className="flex-row justify-between"><Text variant="muted">Today</Text><Text variant="muted">{xpToday} / {child.progress.dailyGoalXp} XP</Text></View>
        <Progress value={(xpToday / child.progress.dailyGoalXp) * 100} barClassName={xpToday >= child.progress.dailyGoalXp ? "bg-secondary" : undefined} />
      </View>
    </View>
  );
}
