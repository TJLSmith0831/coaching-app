import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { seed } from "@coaching/core";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp, ageOf } from "@/lib/store";

export default function Children() {
  const children = useApp((s) => s.children);
  return (
    <Screen>
      <Text variant="title">Children</Text>
      {children.map((c) => (
        <Pressable key={c.id} accessibilityRole="button" onPress={() => router.push({ pathname: "/parent/child/[id]", params: { id: c.id } })}>
          <Card className="flex-row items-center gap-3">
            <Text className="text-4xl">{c.avatar.emoji}</Text>
            <View className="flex-1">
              <Text variant="h2">{c.nickname} · {ageOf(c)}</Text>
              <Text variant="muted">{c.sports.map((s) => seed.sports.find((x) => x.id === s.sportId)?.name).join(", ") || "No sports yet"}</Text>
            </View>
            <Text variant="muted">›</Text>
          </Card>
        </Pressable>
      ))}
      <Button variant="outline" title="+ Add a child" onPress={() => router.push("/onboarding")} />
    </Screen>
  );
}
