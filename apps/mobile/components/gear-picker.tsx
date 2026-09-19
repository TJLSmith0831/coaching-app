import { View } from "react-native";
import { seed, type SportId } from "@coaching/core";
import { Chip } from "@/components/ui/chip";

export function GearPicker({ sportIds, value, onChange }: { sportIds: SportId[]; value: string[]; onChange: (v: string[]) => void }) {
  const items = seed.equipment.filter((e) => e.sportIds.some((s) => sportIds.includes(s)));
  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map((e) => (
        <Chip key={e.id} label={`${e.emoji} ${e.name}`} selected={value.includes(e.id)}
          onPress={() => onChange(value.includes(e.id) ? value.filter((x) => x !== e.id) : [...value, e.id])} />
      ))}
    </View>
  );
}
