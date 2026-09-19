import { Alert, Share } from "react-native";
import { router } from "expo-router";
import { Camera } from "expo-camera";
import * as Notifications from "expo-notifications";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const parent = useApp((s) => s.parent);
  const setParent = useApp((s) => s.setParent);
  const signOut = useApp((s) => s.signOut);
  const pending = useApp((s) => s.pending.length);
  return (
    <Screen>
      <Text variant="title">Settings</Text>
      <Card className="gap-2">
        <Text variant="h2">Account</Text>
        <Input value={parent?.firstName ?? ""} placeholder="First name" onChangeText={(t) => parent && setParent({ ...parent, firstName: t })} />
        <Text variant="muted">{parent?.email}</Text>
        <Text variant="muted">{supabase ? `Synced with Supabase${pending ? ` · ${pending} pending` : ""}` : "Demo mode: data stays on this device"}</Text>
      </Card>
      <Card className="gap-2">
        <Text variant="h2">Permissions</Text>
        <Button variant="outline" size="sm" title="Camera" onPress={() => Camera.requestCameraPermissionsAsync()} />
        <Button variant="outline" size="sm" title="Notifications" onPress={() => Notifications.requestPermissionsAsync()} />
      </Card>
      <Card className="gap-2">
        <Text variant="h2">Privacy</Text>
        <Text variant="muted">Scan photos are never saved or uploaded in this version. Kids share a nickname only.</Text>
        <Button variant="outline" size="sm" title="Export my data" onPress={() => Share.share({ message: JSON.stringify({ parent, children: useApp.getState().children, rewards: useApp.getState().rewards }, null, 2) })} />
      </Card>
      <Button variant="destructive" title="Sign out" onPress={() => Alert.alert("Sign out?", "Local data on this phone is cleared.", [{ text: "Cancel", style: "cancel" }, { text: "Sign out", style: "destructive", onPress: () => { signOut(); router.replace("/"); } }])} />
    </Screen>
  );
}
