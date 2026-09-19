import { useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { SportSetup } from "@/components/sport-setup";
import { GearPicker } from "@/components/gear-picker";
import { useApp, ageOf } from "@/lib/store";
import { GOALS } from "@/lib/constants";

export default function ChildDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const child = useApp((s) => s.children.find((c) => c.id === id));
  const update = useApp((s) => s.updateChild);
  const remove = useApp((s) => s.removeChild);
  const [pin, setPin] = useState("");
  if (!child) return null;
  return (
    <Screen>
      <View className="flex-row items-center gap-2"><Button variant="ghost" size="sm" title="‹ Back" onPress={() => router.back()} /><Text variant="title">{child.avatar.emoji} {child.nickname}</Text></View>
      <Text variant="h2">Nickname</Text>
      <Input value={child.nickname} onChangeText={(t) => update(child.id, { nickname: t })} />
      <Text variant="h2">Sports & positions</Text>
      <SportSetup value={child.sports} onChange={(sports) => update(child.id, { sports })} age={ageOf(child)} />
      <Text variant="h2">Gear at home</Text>
      <GearPicker sportIds={child.sports.map((s) => s.sportId)} value={child.equipment} onChange={(equipment) => update(child.id, { equipment })} />
      <Text variant="h2">Daily goal</Text>
      <View className="flex-row gap-2">{GOALS.map((g) => <Chip key={g.xp} label={`${g.label} ${g.xp}`} selected={child.dailyGoalXp === g.xp} onPress={() => update(child.id, { dailyGoalXp: g.xp, progress: { ...child.progress, dailyGoalXp: g.xp } })} />)}</View>
      <Text variant="h2">Difficulty cap</Text>
      <View className="flex-row gap-2">{[1, 2, 3, 4, 5].map((d) => <Chip key={d} label={String(d)} selected={child.difficultyCap === d} onPress={() => update(child.id, { difficultyCap: d })} />)}</View>
      <Text variant="h2">Reset PIN</Text>
      <View className="flex-row gap-2">
        <Input className="flex-1" placeholder="New 4-digit PIN" keyboardType="number-pad" maxLength={4} value={pin} onChangeText={(t) => setPin(t.replace(/\D/g, ""))} />
        <Button title="Save" disabled={pin.length !== 4} onPress={() => { update(child.id, { pin }); setPin(""); }} />
      </View>
      <Button variant="destructive" title="Delete child and all their data" onPress={() => Alert.alert("Delete " + child.nickname + "?", "This removes their progress everywhere.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { remove(child.id); router.back(); } }])} />
    </Screen>
  );
}
