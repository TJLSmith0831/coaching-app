import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { DAYS, MINUTE_OPTIONS } from "@/lib/constants";

export function AvailabilityGrid({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const cycle = (i: number) => {
    const idx = MINUTE_OPTIONS.indexOf(value[i] ?? 0);
    const next = [...value]; next[i] = MINUTE_OPTIONS[(idx + 1) % MINUTE_OPTIONS.length]!;
    onChange(next);
  };
  return (
    <View className="flex-row justify-between">
      {DAYS.map((d, i) => (
        <Pressable key={d} accessibilityRole="button" accessibilityLabel={`${d}: ${value[i] ?? 0} minutes, tap to change`} onPress={() => cycle(i)}
          className={`h-20 w-11 items-center justify-center rounded-lg border-2 ${value[i] ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
          <Text variant="muted">{d}</Text>
          <Text className="text-lg font-bold">{value[i] || "–"}</Text>
        </Pressable>
      ))}
    </View>
  );
}
