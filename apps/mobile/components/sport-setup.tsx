import { View } from "react-native";
import { seed, type Level, type SportId } from "@coaching/core";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import type { ChildSport } from "@/lib/store";

const LEVELS: { id: Level; label: string }[] = [{ id: "beginner", label: "Brand new" }, { id: "some", label: "Played some" }, { id: "team", label: "On a team" }];

/** Parent-facing sports + positions + level editor. */
export function SportSetup({ value, onChange, age }: { value: ChildSport[]; onChange: (v: ChildSport[]) => void; age: number }) {
  const toggleSport = (id: SportId) => {
    if (value.some((s) => s.sportId === id)) return onChange(value.filter((s) => s.sportId !== id));
    if (value.length >= 3) return;
    onChange([...value, { sportId: id, level: "beginner", positionIds: [], goalTrackIds: [], isFocus: value.length === 0 }]);
  };
  const patch = (id: SportId, p: Partial<ChildSport>) => onChange(value.map((s) => (s.sportId === id ? { ...s, ...p } : s)));
  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap gap-2">
        {seed.sports.map((sp) => <Chip key={sp.id} label={`${sp.emoji} ${sp.name}`} selected={value.some((s) => s.sportId === sp.id)} onPress={() => toggleSport(sp.id)} />)}
      </View>
      {value.map((cs) => {
        const sport = seed.sports.find((s) => s.id === cs.sportId)!;
        const positions = seed.positions.filter((p) => p.sportId === cs.sportId && age >= p.ageMin && age <= p.ageMax);
        return (
          <Card key={cs.sportId} className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text variant="h2">{sport.emoji} {sport.name}</Text>
              <Chip label={cs.isFocus ? "★ Focus" : "Make focus"} selected={cs.isFocus} onPress={() => onChange(value.map((s) => ({ ...s, isFocus: s.sportId === cs.sportId })))} />
            </View>
            <Text variant="muted">Experience</Text>
            <View className="flex-row flex-wrap gap-2">
              {LEVELS.map((l) => <Chip key={l.id} label={l.label} selected={cs.level === l.id} onPress={() => patch(cs.sportId, { level: l.id })} />)}
            </View>
            <Text variant="muted">{cs.sportId === "tennis" ? "Play style" : "Position(s)"}{age <= 10 ? " · kids 8–10 can try them all" : ""}</Text>
            <View className="flex-row flex-wrap gap-2">
              {positions.map((p) => (
                <Chip key={p.id} label={p.name} selected={cs.positionIds.includes(p.id)}
                  onPress={() => patch(cs.sportId, { positionIds: cs.positionIds.includes(p.id) ? cs.positionIds.filter((x) => x !== p.id) : [...cs.positionIds, p.id] })} />
              ))}
            </View>
          </Card>
        );
      })}
    </View>
  );
}
