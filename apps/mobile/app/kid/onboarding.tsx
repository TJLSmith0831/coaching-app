import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { seed, mascotLine, type SportId } from "@coaching/core";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Mascot } from "@/components/mascot";
import { useApp, ageOf } from "@/lib/store";
import { AVATARS, GOALS } from "@/lib/constants";

const ALL_STEPS = ["hello", "avatar", "positions", "goals", "dailyGoal"] as const;

export default function KidOnboarding() {
  const child = useApp((s) => s.child());
  const updateChild = useApp((s) => s.updateChild);
  const [i, setI] = useState(0);
  const [avatar, setAvatar] = useState(child?.avatar ?? AVATARS[0]!);
  const [sports, setSports] = useState(child?.sports ?? []);
  const [goalXp, setGoalXp] = useState(child?.dailyGoalXp ?? 40);
  if (!child) return null;
  const age = ageOf(child);
  const STEPS = ALL_STEPS.filter((s) => s !== "positions" || sports.some((cs) => cs.positionIds.length === 0));
  const step = STEPS[Math.min(i, STEPS.length - 1)]!;
  const next = () => setI(i + 1);
  const patchSport = (sportId: SportId, p: Partial<(typeof sports)[number]>) => setSports(sports.map((s) => (s.sportId === sportId ? { ...s, ...p } : s)));

  const finish = () => {
    updateChild(child.id, { avatar, sports, dailyGoalXp: goalXp, onboarded: true, progress: { ...child.progress, dailyGoalXp: goalXp } });
    router.replace("/(kid)/path");
  };

  return (
    <Screen footer={step === "dailyGoal" ? <Button size="kid" title="Let's go!" onPress={finish} /> : step === "hello" ? <Button size="kid" title="Hi Coach!" onPress={next} /> : <View className="gap-2"><Button size="kid" title="Next" onPress={next} /><Button variant="ghost" title="Skip" onPress={next} /></View>}>
      {step === "hello" && (
        <View className="items-center gap-6 pt-16">
          <Mascot pose="cheer" size="lg" />
          <Text variant="title" className="text-center">Hi {child.nickname}!</Text>
          <Text className="text-center text-xl">{mascotLine("hello", 0)}</Text>
        </View>
      )}
      {step === "avatar" && (
        <>
          <Text variant="title">Pick your look</Text>
          <View className="flex-row flex-wrap gap-4">
            {AVATARS.map((a) => (
              <Pressable key={a.emoji} accessibilityRole="button" accessibilityLabel={`avatar ${a.emoji}`} onPress={() => setAvatar(a)}
                className={`h-20 w-20 items-center justify-center rounded-full border-4 ${avatar.emoji === a.emoji ? "border-primary" : "border-transparent"}`} style={{ backgroundColor: a.color }}>
                <Text className="text-4xl">{a.emoji}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      {step === "positions" && (
        <>
          <Text variant="title">Where do you play?</Text>
          {sports.map((cs) => {
            const sport = seed.sports.find((s) => s.id === cs.sportId)!;
            const positions = seed.positions.filter((p) => p.sportId === cs.sportId && age >= p.ageMin && age <= p.ageMax);
            return (
              <View key={cs.sportId} className="gap-2">
                <Text variant="h2">{sport.emoji} {sport.name}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {positions.map((p) => (
                    <Pressable key={p.id} accessibilityRole="button" onPress={() => patchSport(cs.sportId, { positionIds: cs.positionIds.includes(p.id) ? cs.positionIds.filter((x) => x !== p.id) : [...cs.positionIds, p.id] })}
                      className={`w-[47%] rounded-lg border-2 p-3 ${cs.positionIds.includes(p.id) ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                      <Text className="text-lg font-bold">{p.name}</Text>
                      <Text variant="muted">{p.blurb}</Text>
                    </Pressable>
                  ))}
                  {age <= 10 ? <Chip label="Try them all!" selected={cs.positionIds.length === positions.length} onPress={() => patchSport(cs.sportId, { positionIds: positions.map((p) => p.id) })} /> : null}
                </View>
              </View>
            );
          })}
        </>
      )}
      {step === "goals" && (
        <>
          <Text variant="title">What do you want to get better at?</Text>
          <Text variant="muted">Pick 1 or 2 per sport. Those get extra levels.</Text>
          {sports.map((cs) => (
            <View key={cs.sportId} className="gap-2">
              <Text variant="h2">{seed.sports.find((s) => s.id === cs.sportId)!.emoji} {seed.sports.find((s) => s.id === cs.sportId)!.name}</Text>
              <View className="flex-row flex-wrap gap-2">
                {seed.tracks.filter((t) => t.sportId === cs.sportId).map((t) => (
                  <Chip key={t.id} label={t.name} selected={cs.goalTrackIds.includes(t.id)}
                    onPress={() => patchSport(cs.sportId, { goalTrackIds: cs.goalTrackIds.includes(t.id) ? cs.goalTrackIds.filter((x) => x !== t.id) : [...cs.goalTrackIds, t.id].slice(-2) })} />
                ))}
              </View>
            </View>
          ))}
        </>
      )}
      {step === "dailyGoal" && (
        <>
          <Text variant="title">Daily goal</Text>
          <Text variant="muted">One level a day hits Regular.</Text>
          <View className="gap-3">
            {GOALS.map((g) => (
              <Pressable key={g.xp} accessibilityRole="button" onPress={() => setGoalXp(g.xp)} className={`flex-row items-center justify-between rounded-lg border-2 p-5 ${goalXp === g.xp ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                <Text className="text-2xl font-bold">{g.label}</Text>
                <Text variant="h2">{g.xp} XP</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
