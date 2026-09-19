import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { useApp } from "@/lib/store";

export default function Who() {
  const children = useApp((s) => s.children);
  const setActive = useApp((s) => s.setActiveChild);
  return (
    <Screen className="pt-10">
      <Text variant="title">Who's playing?</Text>
      <View className="flex-row flex-wrap gap-4 pt-4">
        {children.map((c) => (
          <Pressable key={c.id} testID={`who-${c.id}`} accessibilityRole="button" accessibilityLabel={`Play as ${c.nickname}`}
            onPress={() => router.push({ pathname: "/pin/[childId]", params: { childId: c.id } })}
            className="h-40 w-[47%] items-center justify-center gap-2 rounded-lg border-2 border-border bg-card active:opacity-80" style={{ backgroundColor: c.avatar.color }}>
            <Text className="text-6xl">{c.avatar.emoji}</Text>
            <Text variant="h2">{c.nickname}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" accessibilityLabel="Parent area" onPress={() => { setActive(null); router.push("/(parent)/dashboard"); }}
          className="h-40 w-[47%] items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted active:opacity-80">
          <Text className="text-5xl">👤</Text>
          <Text variant="h2">Parent</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
