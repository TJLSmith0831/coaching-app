import { Pressable, Text } from "react-native";
import { cn } from "@/lib/utils";
export function Chip({ label, selected, onPress, className }: { label: string; selected?: boolean; onPress?: () => void; className?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      className={cn("h-12 flex-row items-center rounded-full border-2 px-4", selected ? "border-primary bg-primary/10" : "border-border bg-card", className)}
    >
      <Text className={cn("text-base font-semibold", selected ? "text-primary" : "text-foreground")}>{label}</Text>
    </Pressable>
  );
}
