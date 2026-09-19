import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type MascotPose = "idle" | "cheer" | "think" | "sleep" | "nudge" | "stretch";
const FACE: Record<MascotPose, string> = { idle: "🐕", cheer: "🐕🎉", think: "🐕💭", sleep: "🐕💤", nudge: "🐕👋", stretch: "🐕🦴" };

// ponytail: emoji placeholder; swap for SVG poses when dachshund art lands
export function Mascot({ pose = "idle", line, size = "md", className }: { pose?: MascotPose; line?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const emoji = size === "lg" ? "text-7xl" : size === "sm" ? "text-3xl" : "text-5xl";
  return (
    <View className={cn("flex-row items-center gap-3", className)} accessibilityLabel={`Coach the dachshund ${pose}${line ? `: ${line}` : ""}`}>
      <Text className={emoji}>{FACE[pose]}</Text>
      {line ? (
        <View className="flex-1 rounded-lg bg-card p-3 border border-border">
          <Text variant="body" className="font-semibold">{line}</Text>
        </View>
      ) : null}
    </View>
  );
}
