import { useState } from "react";
import { View } from "react-native";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { useApp } from "@/lib/store";

const SUGGESTED = ["Pick Friday dinner", "30 min extra screen time", "Stay up 30 min late"];

export default function Rewards() {
  const children = useApp((s) => s.children);
  const rewards = useApp((s) => s.rewards);
  const claims = useApp((s) => s.claims);
  const add = useApp((s) => s.addReward);
  const remove = useApp((s) => s.removeReward);
  const resolve = useApp((s) => s.resolveClaim);
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState(200);
  const pending = claims.filter((c) => c.status === "pending");
  return (
    <Screen>
      <Text variant="title">Rewards</Text>
      {pending.length ? <Text variant="h2">To approve</Text> : null}
      {pending.map((c) => {
        const r = rewards.find((x) => x.id === c.rewardId); const kid = children.find((x) => x.id === c.childId);
        return (
          <Card key={c.id} className="gap-2 border-accent">
            <Text className="text-lg font-bold">{kid?.avatar.emoji} {kid?.nickname} wants: {r?.title}</Text>
            <View className="flex-row gap-2"><Button className="flex-1" size="sm" title="Approve" onPress={() => resolve(c.id, "approved")} /><Button className="flex-1" size="sm" variant="outline" title="Not now" onPress={() => resolve(c.id, "denied")} /></View>
          </Card>
        );
      })}
      <Text variant="h2">Add a reward</Text>
      <View className="flex-row flex-wrap gap-2">{SUGGESTED.map((s) => <Chip key={s} label={s} selected={title === s} onPress={() => setTitle(s)} />)}</View>
      <Input placeholder="Or type your own" value={title} onChangeText={setTitle} />
      <View className="flex-row flex-wrap gap-2">{[100, 200, 400, 800].map((x) => <Chip key={x} label={`${x} XP`} selected={cost === x} onPress={() => setCost(x)} />)}</View>
      <Button title="Add reward" disabled={!title.trim()} onPress={() => { add({ childId: null, title: title.trim(), costXp: cost, milestoneLevel: null }); setTitle(""); }} />
      <Text variant="h2">Active</Text>
      {rewards.map((r) => (
        <Card key={r.id} className="flex-row items-center justify-between">
          <View><Text className="text-lg font-bold">🎁 {r.title}</Text><Text variant="muted">{r.costXp} XP · all kids</Text></View>
          <Button size="sm" variant="ghost" title="Remove" onPress={() => remove(r.id)} />
        </Card>
      ))}
    </Screen>
  );
}
