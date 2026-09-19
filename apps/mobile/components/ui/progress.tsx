import { View } from "react-native";
import { cn } from "@/lib/utils";
export function Progress({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View className={cn("h-4 w-full overflow-hidden rounded-full bg-muted", className)} accessibilityRole="progressbar" accessibilityValue={{ now: pct, min: 0, max: 100 }}>
      <View className={cn("h-full rounded-full bg-primary", barClassName)} style={{ width: `${pct}%` }} />
    </View>
  );
}
