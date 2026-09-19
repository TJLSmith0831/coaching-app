import { useRef, useState } from "react";
import { Linking, View } from "react-native";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { seed, mascotLine, type Space } from "@coaching/core";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import { Mascot } from "@/components/mascot";
import { GearPicker } from "@/components/gear-picker";
import { useApp } from "@/lib/store";
import { classifyGear, classifySpot } from "@/lib/scan";
import { decodeSmall } from "@/lib/decode";

type Mode = "spot" | "gear";
const SURFACES = ["grass", "concrete", "court", "indoor"] as const;
const SPACES: Space[] = ["small", "medium", "large"];
const FIXTURES = ["wall", "hoop", "goal", "fence"];
const LABELS: Record<string, string> = { grass: "Backyard", concrete: "Driveway", court: "Court", indoor: "Indoors", unknown: "My spot" };

export default function Scan() {
  const child = useApp((s) => s.child());
  const record = useApp((s) => s.recordScan);
  const [perm, requestPerm] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const [mode, setMode] = useState<Mode>("spot");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<null | { surface: string; space: Space; fixtures: string[]; confidence: number; gear: string[]; note?: string }>(null);
  if (!child) return null;
  const sportIds = child.sports.map((s) => s.sportId);

  const capture = async () => {
    setBusy(true);
    try {
      const photo = await cam.current?.takePictureAsync({ quality: 0.5, skipProcessing: true });
      if (!photo?.uri) throw new Error("no photo");
      const { px, width, height } = await decodeSmall(photo.uri);
      if (mode === "spot") { const g = classifySpot(px, width, height); setConfirm({ ...g, gear: [], note: g.confidence < 0.5 ? "Couldn't tell for sure. Tap what's here." : undefined }); }
      else { const g = classifyGear(px, sportIds); setConfirm({ surface: "unknown", space: "small", fixtures: [], confidence: g.confidence, gear: g.ids, note: g.ids.length ? undefined : "Couldn't spot gear. Tap what you have." }); }
    } catch {
      setConfirm({ surface: "unknown", space: "medium", fixtures: [], confidence: 0, gear: [], note: "Camera hiccup. Tap what's here instead." });
    } finally { setBusy(false); }
  };
  const manual = () => setConfirm({ surface: "unknown", space: "medium", fixtures: [], confidence: 0, gear: [] });

  const save = (startLevel: boolean) => {
    if (!confirm) return;
    if (mode === "spot") {
      const spot = record(child.id, "spot", { spot: { label: LABELS[confirm.surface] ?? "My spot", surface: confirm.surface, space: confirm.space, fixtures: confirm.fixtures, confidence: confirm.confidence } });
      setConfirm(null);
      if (startLevel && spot) {
        const sid = child.sports.find((s) => s.isFocus)?.sportId ?? child.sports[0]?.sportId;
        const path = sid ? child.progress.paths[sid] : undefined;
        if (sid && path) router.push({ pathname: "/kid/session", params: { sportId: sid, unit: String(path.current.unit), level: String(path.current.level), replay: "0" } });
      }
    } else { record(child.id, "gear", { equipment: confirm.gear }); setConfirm(null); }
  };

  if (confirm) {
    return (
      <Screen footer={<View className="gap-2"><Button size="kid" title={mode === "spot" ? "Save spot ⭐" : "Save gear"} onPress={() => save(false)} testID="save-scan" />{mode === "spot" ? <Button variant="outline" title="Start a level here" onPress={() => save(true)} /> : null}<Button variant="ghost" title="Cancel" onPress={() => setConfirm(null)} /></View>}>
        <Mascot pose={confirm.note ? "think" : "cheer"} line={confirm.note ?? (mode === "spot" ? `Looks like ${LABELS[confirm.surface]}, ${confirm.space} space${confirm.fixtures.includes("wall") ? ", wall ✓" : ""}` : `Found ${confirm.gear.length} thing${confirm.gear.length === 1 ? "" : "s"}. Missing any?`)} />
        {mode === "spot" ? (<>
          <Text variant="h2">Ground</Text>
          <View className="flex-row flex-wrap gap-2">{SURFACES.map((s) => <Chip key={s} label={LABELS[s]!} selected={confirm.surface === s} onPress={() => setConfirm({ ...confirm, surface: s })} />)}</View>
          <Text variant="h2">Space</Text>
          <View className="flex-row gap-2">{SPACES.map((s) => <Chip key={s} label={s} selected={confirm.space === s} onPress={() => setConfirm({ ...confirm, space: s })} />)}</View>
          <Text variant="h2">What's around</Text>
          <View className="flex-row flex-wrap gap-2">{FIXTURES.map((f) => <Chip key={f} label={f} selected={confirm.fixtures.includes(f)} onPress={() => setConfirm({ ...confirm, fixtures: confirm.fixtures.includes(f) ? confirm.fixtures.filter((x) => x !== f) : [...confirm.fixtures, f] })} />)}</View>
          <Text variant="h2">Drills that fit here</Text>
          {seed.drills.filter((d) => sportIds.includes(d.sportId) && !d.isShadow && (!d.needsWall || confirm.fixtures.includes("wall")) && (!d.needsGoalOrHoop || confirm.fixtures.some((f) => f === "goal" || f === "hoop")) && SPACES.indexOf(d.minSpace) <= SPACES.indexOf(confirm.space)).slice(0, 3).map((d) => (
            <Card key={d.id}><Text className="font-bold">{d.name}</Text><Text variant="muted">{d.instructions}</Text></Card>
          ))}
        </>) : (<>
          <Text variant="h2">Your gear</Text>
          <GearPicker sportIds={sportIds} value={confirm.gear} onChange={(gear) => setConfirm({ ...confirm, gear })} />
        </>)}
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <View className="flex-row gap-2">
        <Chip label="📍 Spot" selected={mode === "spot"} onPress={() => setMode("spot")} />
        <Chip label="⚽ Gear" selected={mode === "gear"} onPress={() => setMode("gear")} />
      </View>
      <Text variant="body" className="font-semibold">{mode === "spot" ? "Point at where you'll practice. Step back so I see the ground." : "Put your gear on the ground and fit it all in."}</Text>
      {!perm ? null : !perm.granted ? (
        <View className="flex-1 items-center justify-center gap-4">
          <Mascot pose="think" line="I look at the space, the photo stays on your phone." />
          {perm.canAskAgain ? <Button title="Turn on camera" onPress={() => requestPerm()} /> : <Button title="Open Settings" onPress={() => Linking.openSettings()} />}
          <Button variant="outline" title="Pick manually instead" onPress={manual} />
        </View>
      ) : (
        <View className="flex-1 gap-3">
          <View className="flex-1 overflow-hidden rounded-lg border-4 border-border">
            <CameraView ref={cam} style={{ flex: 1 }} facing="back" />
          </View>
          {busy ? <Mascot pose="think" line={mascotLine("analyzing", 1)} size="sm" /> : null}
          <Button size="kid" title={busy ? "Looking…" : "📸 Scan"} disabled={busy} onPress={capture} testID="shutter" />
          <Button variant="ghost" title="Pick manually" onPress={manual} />
        </View>
      )}
    </Screen>
  );
}
