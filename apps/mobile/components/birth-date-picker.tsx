import { useState } from "react";
import { Platform, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export function ageFromDate(d: Date, now = new Date()) {
  let a = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) a--;
  return a;
}

/** Standard birth-date entry: native spinner on iOS, dialog on Android. Any date allowed. */
export function BirthDatePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const [open, setOpen] = useState(false);
  const age = ageFromDate(value);
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text variant="h2">{value.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</Text>
        <Text variant="muted">{age} years old</Text>
      </View>
      {Platform.OS === "ios" ? (
        <DateTimePicker value={value} mode="date" display="spinner" maximumDate={new Date()} onChange={(_, d) => d && onChange(d)} style={{ height: 180 }} />
      ) : (
        <>
          <Button variant="outline" title="Change date" onPress={() => setOpen(true)} />
          {open ? <DateTimePicker value={value} mode="date" display="default" maximumDate={new Date()} onChange={(_, d) => { setOpen(false); if (d) onChange(d); }} /> : null}
        </>
      )}
    </View>
  );
}
