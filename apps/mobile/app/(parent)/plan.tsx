import { View } from "react-native";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { AvailabilityGrid } from "@/components/availability-grid";
import { useApp } from "@/lib/store";

const TIMES = ["16:00", "17:00", "17:30", "18:00", "19:00"];

export default function Plan() {
  const children = useApp((s) => s.children);
  const update = useApp((s) => s.updateChild);
  const regenerate = useApp((s) => s.regeneratePaths);
  return (
    <Screen>
      <Text variant="title">Weekly plan</Text>
      <Text variant="muted">Tap a day to cycle minutes. Reminders are local notifications on this phone.</Text>
      {children.map((c) => (
        <Card key={c.id} className="gap-3">
          <Text variant="h2">{c.avatar.emoji} {c.nickname}</Text>
          <AvailabilityGrid value={c.availability.minutesByDow} onChange={(minutesByDow) => update(c.id, { availability: { ...c.availability, minutesByDow } })} />
          <Text variant="muted">Reminder time</Text>
          <View className="flex-row flex-wrap gap-2">{TIMES.map((t) => <Chip key={t} label={t} selected={c.availability.reminderTime === t} onPress={() => update(c.id, { availability: { ...c.availability, reminderTime: t } })} />)}</View>
          <Button variant="outline" size="sm" title="Regenerate path (keeps completed levels)" onPress={() => regenerate(c.id)} />
        </Card>
      ))}
    </Screen>
  );
}
