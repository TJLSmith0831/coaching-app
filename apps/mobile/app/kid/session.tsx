import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { seed, fillSession, playerLevel, mascotLine, type DrillResult, type Feedback, type SessionSummary, type SportId } from "@coaching/core";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mascot } from "@/components/mascot";
import { useApp, ageOf } from "@/lib/store";
import { TIME_OPTIONS } from "@/lib/constants";
import { todayLocal, uuid } from "@/lib/utils";
import { callFn } from "@/lib/supabase";

type Phase = "setup" | "play" | "summary";

export default function Session() {
  const p = useLocalSearchParams<{ sportId: SportId; unit: string; level: string; replay?: string }>();
  const child = useApp((s) => s.child());
  const complete = useApp((s) => s.completeSession);
  const unit = Number(p.unit), level = Number(p.level), replay = p.replay === "1";
  const [phase, setPhase] = useState<Phase>("setup");
  const [minutes, setMinutes] = useState(10);
  const [spotId, setSpotId] = useState<string | null>(child?.spots[0]?.id ?? null);
  const [drillIds, setDrillIds] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<DrillResult[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [sessionId] = useState(uuid());

  const node = child?.progress.paths[p.sportId]?.skeleton.units[unit]?.levels[level];
  const track = child?.progress.paths[p.sportId]?.skeleton.units[unit]?.skillTrackId ?? null;
  const cs = child?.sports.find((s) => s.sportId === p.sportId);
  const spot = child?.spots.find((s) => s.id === spotId) ?? null;

  const plan = useMemo(() => {
    if (!child || !node) return [];
    const reviewTracks = child.progress.paths[p.sportId]!.skeleton.units.slice(0, unit + 1).map((u) => u.skillTrackId);
    return fillSession({
      drills: seed.drills, sportId: p.sportId, skillTrackId: node.kind === "review" ? null : track, reviewTrackIds: reviewTracks,
      targetDifficulty: node.targetDifficulty, timeBudgetSec: minutes * 60, age: ageOf(child), positionIds: cs?.positionIds ?? [],
      equipment: child.equipment, spot: spot ? { space: spot.space, fixtures: spot.fixtures } : null, recentDrillIds: child.progress.recentDrillIds,
    });
  }, [child, node, minutes, spotId]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [running]);

  if (!child || !node) return null;
  const drill = seed.drills.find((d) => d.id === drillIds[idx]);

  const start = () => {
    setDrillIds(plan); setIdx(0); setLeft(seed.drills.find((d) => d.id === plan[0])!.durationSec); setRunning(true); setPhase("play");
    void callFn("start-session", { session_id: sessionId, child_id: child.id, sport_id: p.sportId, unit, level, time_budget_sec: minutes * 60, spot_id: spotId, planned_drill_ids: plan }).catch(() => {});
  };
  const answer = (status: DrillResult["status"], feedback?: Feedback) => {
    const next = [...results, { drillId: drillIds[idx]!, status, feedback }];
    Speech.stop();
    if (idx + 1 < drillIds.length) { setResults(next); setIdx(idx + 1); setLeft(seed.drills.find((d) => d.id === drillIds[idx + 1])!.durationSec); }
    else {
      setRunning(false);
      const s = complete(child.id, sessionId, { sportId: p.sportId, unit, level, results: next, replay, today: todayLocal(), positionIds: cs?.positionIds });
      setSummary(s); setPhase("summary");
    }
  };

  if (phase === "setup") {
    return (
      <Screen footer={<Button size="kid" title={`Start ${plan.length} drills`} disabled={!plan.length} onPress={start} testID="start" />}>
        <Text variant="title">{node.kind === "review" ? "Unit review" : `Level ${level + 1}`}</Text>
        <Text variant="h2">How long do you have?</Text>
        <View className="flex-row gap-2">{TIME_OPTIONS.map((m) => <Chip key={m} label={`${m} min`} selected={minutes === m} onPress={() => setMinutes(m)} />)}</View>
        {child.spots.length ? (<>
          <Text variant="h2">Where are you?</Text>
          <View className="flex-row flex-wrap gap-2">
            {child.spots.map((s) => <Chip key={s.id} label={`📍 ${s.label}`} selected={spotId === s.id} onPress={() => setSpotId(s.id)} />)}
            <Chip label="Somewhere else" selected={spotId === null} onPress={() => setSpotId(null)} />
          </View>
        </>) : null}
        <Text variant="h2">Your drills</Text>
        {plan.map((id) => { const d = seed.drills.find((x) => x.id === id)!; return <Card key={id}><Text className="text-lg font-bold">{d.name}</Text><Text variant="muted">{Math.round(d.durationSec / 60)} min · {d.isShadow ? "no gear" : d.equipmentRequired.join(", ") || "no gear"}</Text></Card>; })}
        {!plan.length ? <Mascot pose="think" line="Hmm, I need at least one drill. Try more time." /> : null}
      </Screen>
    );
  }

  if (phase === "play" && drill) {
    const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
    return (
      <Screen scroll={false}>
        <Progress value={(idx / drillIds.length) * 100} />
        <Text variant="muted">Drill {idx + 1} of {drillIds.length}</Text>
        <Text variant="title">{drill.name}</Text>
        <Text className="text-xl leading-8">{drill.instructions}</Text>
        <Button variant="outline" size="sm" title="🔊 Read it to me" onPress={() => Speech.speak(`${drill.name}. ${drill.instructions}`, { rate: 0.95 })} />
        <View className="flex-1 items-center justify-center">
          <Text variant="big" className={left === 0 ? "text-primary" : ""}>{mm}:{ss}</Text>
          <Button variant="ghost" title={running ? "Pause" : "Resume"} onPress={() => setRunning(!running)} />
        </View>
        <View className="gap-3">
          <Button size="kid" title="Did it! ✅" onPress={() => answer("done", "ok")} testID="did-it" />
          <View className="flex-row gap-3">
            <Button className="flex-1" variant="outline" title="Too easy" onPress={() => answer("done", "too_easy")} />
            <Button className="flex-1" variant="outline" title="Too hard" onPress={() => answer("done", "too_hard")} />
            <Button className="flex-1" variant="ghost" title="Skip" onPress={() => answer("skipped")} />
          </View>
        </View>
      </Screen>
    );
  }

  if (phase === "summary" && summary) {
    return (
      <Screen footer={<Button size="kid" title="Back to path" onPress={() => router.replace("/(kid)/path")} testID="back-to-path" />}>
        <View className="items-center gap-4 pt-8">
          <Mascot pose="cheer" size="lg" />
          <Text variant="title">{mascotLine("praise", summary.xpEarned)}</Text>
          <Text className="text-6xl">{"⭐".repeat(summary.stars)}{"☆".repeat(3 - summary.stars)}</Text>
          <Text variant="big" className="text-primary">+{summary.xpEarned} XP</Text>
          <Text variant="h2">🔥 Streak {summary.streak.current}</Text>
          {summary.levelAfter > summary.levelBefore ? <Card className="bg-secondary/30 w-full items-center"><Text variant="h2">Level up! You're level {summary.levelAfter}</Text></Card> : null}
          {summary.badgesEarned.map((b) => { const badge = seed.badges.find((x) => x.id === b); return <Card key={b} className="w-full items-center"><Text variant="h2">{badge?.emoji} {badge?.name}</Text><Text variant="muted">{badge?.description}</Text></Card>; })}
          {summary.questsCompleted.length ? <Card className="w-full items-center"><Text variant="h2">Quest complete! 🏆</Text></Card> : null}
          {summary.unitCompleted ? <Text variant="h2">{mascotLine("unitComplete", 0)}</Text> : null}
          {summary.nextIsChest ? <Text variant="h2">🎁 A chest is waiting on your path!</Text> : null}
          <Text variant="muted">Level {playerLevel(child.progress.totalXp)} · {child.progress.totalXp} XP total</Text>
        </View>
      </Screen>
    );
  }
  return null;
}
