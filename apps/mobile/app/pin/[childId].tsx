import { useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { Mascot } from "@/components/mascot";

export default function Pin() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const child = useApp((s) => s.children.find((c) => c.id === childId));
  const setActive = useApp((s) => s.setActiveChild);
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  if (!child) return null;

  const press = (d: string) => {
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      if (!child.pin || next === child.pin) { setActive(child.id); router.replace(child.onboarded ? "/(kid)/path" : "/kid/onboarding"); }
      else { setShake(true); setTimeout(() => { setPin(""); setShake(false); }, 500); }
    }
  };
  return (
    <Screen scroll={false} className="items-center justify-center gap-6">
      <Mascot pose={shake ? "think" : "idle"} line={shake ? "Not quite. Try again!" : `Hi ${child.nickname}! Tap your PIN.`} />
      <View className="flex-row gap-4">
        {[0, 1, 2, 3].map((i) => <View key={i} className={`h-6 w-6 rounded-full ${i < pin.length ? (shake ? "bg-destructive" : "bg-primary") : "bg-muted"}`} />)}
      </View>
      <View className="w-72 flex-row flex-wrap justify-center gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) => (
          <Pressable key={i} disabled={!k} testID={`key-${k}`} accessibilityRole="button" accessibilityLabel={k === "⌫" ? "Delete" : k}
            onPress={() => (k === "⌫" ? setPin(pin.slice(0, -1)) : press(k))}
            className={`h-20 w-20 items-center justify-center rounded-full ${k ? "bg-card border-2 border-border active:bg-muted" : ""}`}>
            <Text className="text-3xl font-bold">{k}</Text>
          </Pressable>
        ))}
      </View>
      <Button variant="ghost" title="Back" onPress={() => router.back()} />
    </Screen>
  );
}
