import { useEffect } from "react";
import { View } from "react-native";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/mascot";
import { useApp } from "@/lib/store";

export default function Quests() {
  const child = useApp((s) => s.child());
  const ensure = useApp((s) => s.ensureDailyQuests);
  const rewards = useApp((s) => s.rewards);
  const claims = useApp((s) => s.claims);
  const claim = useApp((s) => s.claimReward);
  useEffect(() => { if (child) ensure(child.id); }, [child?.id]);
  if (!child) return null;
  const daily = child.progress.quests.filter((q) => q.kind === "daily");
  const family = child.progress.quests.find((q) => q.kind === "family");
  const myRewards = rewards.filter((r) => !r.childId || r.childId === child.id);
  return (
    <Screen>
      <Text variant="title">Quests</Text>
      <Text variant="h2">Today</Text>
      {daily.map((q) => (
        <Card key={q.id} className={q.completedAt ? "bg-primary/10 border-primary" : ""}>
          <View className="flex-row justify-between"><Text className="text-lg font-bold">{q.completedAt ? "✅ " : ""}{q.title}</Text><Text variant="muted">+{q.xpReward} XP</Text></View>
          <Progress value={(q.progress / q.target) * 100} className="mt-2 h-3" />
        </Card>
      ))}
      {family ? (
        <>
          <Text variant="h2">Family quest (this week)</Text>
          <Card className={family.completedAt ? "bg-secondary/30 border-secondary" : ""}>
            <Text className="text-lg font-bold">{family.completedAt ? "🏆 " : "👨‍👩‍👧 "}{family.title}</Text>
            <Text variant="muted">You: {Math.min(family.progress, family.target)}/{family.target}</Text>
            <Progress value={(family.progress / family.target) * 100} className="mt-1 h-3" />
            <Text variant="muted" className="mt-2">Parent check-ins: {family.parentProgress ?? 0}/{family.parentTarget ?? 3}</Text>
            <Progress value={((family.parentProgress ?? 0) / (family.parentTarget ?? 3)) * 100} className="mt-1 h-3" barClassName="bg-secondary" />
          </Card>
        </>
      ) : null}
      <Text variant="h2">Rewards</Text>
      {myRewards.length === 0 ? <Mascot pose="sleep" line="No rewards yet. Ask a parent to add some!" /> : null}
      {myRewards.map((r) => {
        const pending = claims.find((c) => c.rewardId === r.id && c.childId === child.id && c.status === "pending");
        const approved = claims.find((c) => c.rewardId === r.id && c.childId === child.id && c.status === "approved");
        const can = r.costXp ? child.progress.totalXp >= r.costXp : true;
        return (
          <Card key={r.id} className="flex-row items-center justify-between">
            <View className="flex-1"><Text className="text-lg font-bold">🎁 {r.title}</Text><Text variant="muted">{r.costXp ? `${r.costXp} XP` : `Level ${r.milestoneLevel}`}</Text></View>
            {approved ? <Text className="font-bold text-primary">Approved!</Text> : pending ? <Text variant="muted">Waiting…</Text> : <Button size="sm" title="Claim" disabled={!can} onPress={() => claim(r.id, child.id)} />}
          </Card>
        );
      })}
    </Screen>
  );
}
