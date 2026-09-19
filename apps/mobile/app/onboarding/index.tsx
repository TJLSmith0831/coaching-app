import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Camera } from "expo-camera";
import * as Notifications from "expo-notifications";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Progress } from "@/components/ui/progress";
import { Mascot } from "@/components/mascot";
import { SportSetup } from "@/components/sport-setup";
import { GearPicker } from "@/components/gear-picker";
import { useApp, type ChildSport } from "@/lib/store";
import { AVATARS } from "@/lib/constants";
import { BirthDatePicker, ageFromDate } from "@/components/birth-date-picker";
import { seed } from "@coaching/core";

const STEPS = ["profile", "child", "sports", "gear", "pin", "done"] as const;
type Step = (typeof STEPS)[number];

export default function ParentOnboarding() {
  const parent = useApp((s) => s.parent);
  const setParent = useApp((s) => s.setParent);
  const addChild = useApp((s) => s.addChild);
  const updateChild = useApp((s) => s.updateChild);
  const regenerate = useApp((s) => s.regeneratePaths);

  const [step, setStep] = useState<Step>(parent?.firstName ? "child" : "profile");
  const [firstName, setFirstName] = useState(parent?.firstName ?? "");
  const [consent, setConsent] = useState(false);
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 10); return d; });
  const [avatar, setAvatar] = useState(AVATARS[0]!);
  const [sports, setSports] = useState<ChildSport[]>([]);
  const [gear, setGear] = useState<string[]>([]);
  const minutes = [0, 10, 0, 10, 0, 0, 10];
  const [pin, setPin] = useState("");
  const [childId, setChildId] = useState<string | null>(null);
  const age = Math.min(13, Math.max(8, ageFromDate(birthDate)));
  const birthMonth = birthDate.getMonth() + 1, birthYear = birthDate.getFullYear();
  const i = STEPS.indexOf(step);
  const go = (s: Step) => setStep(s);

  const saveChild = () => {
    const base = { nickname: nickname.trim(), birthMonth, birthYear, avatar, sports, equipment: gear, availability: { minutesByDow: minutes, reminderTime: "17:30" }, pin };
    if (childId) updateChild(childId, base);
    else { const c = addChild(base); setChildId(c.id); }
  };

  const body: Record<Step, React.ReactNode> = {
    profile: (
      <>
        <Mascot pose="cheer" line="Hi! I'm Coach. This takes about 3 minutes." />
        <Text variant="title">What should we call you?</Text>
        <Input placeholder="Your first name" value={firstName} onChangeText={setFirstName} testID="first-name" autoFocus />
        <Chip label={`${consent ? "✓ " : ""}I'm the parent or guardian and agree to the Terms & Privacy Policy`} selected={consent} onPress={() => setConsent(!consent)} className="h-auto py-3" />
        <Text variant="muted">Kids only share a nickname and birthday. No chat, no public leaderboards. Scan photos stay on this phone.</Text>
        <Button title="Next" disabled={!firstName.trim() || !consent} onPress={() => { setParent({ ...parent!, firstName: firstName.trim() }); go("child"); }} />
      </>
    ),
    child: (
      <>
        <Text variant="title">Add a child</Text>
        <Input placeholder="Nickname (what they like to be called)" value={nickname} onChangeText={setNickname} testID="nickname" />
        <Text variant="muted">Birthday</Text>
        <BirthDatePicker value={birthDate} onChange={setBirthDate} />
        <Text variant="muted">Pick an avatar</Text>
        <View className="flex-row flex-wrap gap-3">
          {AVATARS.map((a) => (
            <Pressable key={a.emoji} accessibilityRole="button" accessibilityLabel={`avatar ${a.emoji}`} onPress={() => setAvatar(a)}
              className={`h-16 w-16 items-center justify-center rounded-full border-4 ${avatar.emoji === a.emoji ? "border-primary" : "border-transparent"}`} style={{ backgroundColor: a.color }}>
              <Text className="text-3xl">{a.emoji}</Text>
            </Pressable>
          ))}
        </View>
        <Button title="Next" disabled={!nickname.trim()} onPress={() => go("sports")} />
      </>
    ),
    sports: (
      <>
        <Text variant="title">{nickname}'s sports</Text>
        <Text variant="muted">Pick up to 3. Positions and experience are optional, Coach starts everyone at the basics.</Text>
        <SportSetup value={sports} onChange={setSports} age={age} />
        <Button title="Next" disabled={sports.length === 0} onPress={() => { setGear(Array.from(new Set(sports.flatMap((s) => seed.sports.find((x) => x.id === s.sportId)!.coreEquipment)))); go("gear"); }} />
      </>
    ),
    gear: (
      <>
        <Text variant="title">What gear is at home?</Text>
        <Text variant="muted">Levels only use drills that fit the gear you have. {nickname} can also scan the pile with the camera later.</Text>
        <GearPicker sportIds={sports.map((s) => s.sportId)} value={gear} onChange={setGear} />
        <Button title="Next" onPress={() => go("pin")} />
      </>
    ),
    pin: (
      <>
        <Text variant="title">Set {nickname}'s PIN</Text>
        <Text variant="muted">4 digits so {nickname} can switch to their own profile. Optional.</Text>
        <Input placeholder="1234" keyboardType="number-pad" maxLength={4} value={pin} onChangeText={(t) => setPin(t.replace(/\D/g, ""))} testID="pin" className="text-center text-3xl tracking-widest" />
        <Button title="Save child" disabled={pin.length !== 4} onPress={() => { saveChild(); if (childId) regenerate(childId); go("done"); }} />
        <Button variant="ghost" title="Skip PIN for now" onPress={() => { setPin(""); saveChild(); go("done"); }} />
      </>
    ),
    done: (
      <>
        <Mascot pose="cheer" line={`${nickname}'s first path is ready!`} />
        <Text variant="title">All set</Text>
        <Text variant="body">Practice days default to Mon, Wed, Sat for 10 minutes. Change anytime in Plan.</Text>
        <View className="flex-row gap-2">
          <Button className="flex-1" variant="outline" size="sm" title="Allow camera" onPress={() => Camera.requestCameraPermissionsAsync()} />
          <Button className="flex-1" variant="outline" size="sm" title="Allow reminders" onPress={() => Notifications.requestPermissionsAsync()} />
        </View>
        <Button title={`Hand to ${nickname}`} size="kid" onPress={() => { if (childId) regenerate(childId); useApp.getState().setActiveChild(childId); router.replace("/kid/onboarding"); }} />
        <Button title="Add another child" variant="outline" onPress={() => { setChildId(null); setNickname(""); setSports([]); setGear([]); setPin(""); go("child"); }} />
        <Button title="Go to parent dashboard" variant="ghost" onPress={() => router.replace("/(parent)/dashboard")} />
      </>
    ),
  };

  return (
    <Screen>
      <View className="flex-row items-center gap-3">
        {i > 0 && step !== "done" ? <Button variant="ghost" size="sm" title="Back" onPress={() => go(STEPS[i - 1]!)} /> : null}
        <Progress value={((i + 1) / STEPS.length) * 100} className="flex-1" />
      </View>
      {body[step]}
    </Screen>
  );
}
