import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { uuid } from "@/lib/utils";

export default function SignIn() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [up, setUp] = useState(mode !== "in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setParent = useApp((s) => s.setParent);

  const submit = async () => {
    setError(null);
    if (!email.includes("@") || password.length < 6) { setError("Use a real email and a password with 6+ characters."); return; }
    setBusy(true);
    try {
      if (!supabase) { setParent({ id: uuid(), email, firstName: "" }); router.replace("/"); return; } // demo mode
      const res = up
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (res.error) { setError(res.error.message); return; }
      if (up && !res.data.session) { setError("Check your email to confirm, then sign in."); setUp(false); return; }
      router.replace("/");
    } finally { setBusy(false); }
  };

  return (
    <Screen className="pt-10">
      <Text variant="title">{up ? "Create your parent account" : "Welcome back"}</Text>
      <Text variant="muted">Kids never need an email. They use a 4-digit PIN you set.</Text>
      <View className="gap-3 pt-4">
        <Input placeholder="Email" autoCapitalize="none" keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} testID="email" />
        <Input placeholder="Password" secureTextEntry autoComplete={up ? "new-password" : "password"} value={password} onChangeText={setPassword} testID="password" />
        {error ? <Text className="text-destructive font-semibold">{error}</Text> : null}
        <Button title={busy ? "…" : up ? "Create account" : "Sign in"} disabled={busy} onPress={submit} testID="submit" />
        <Button variant="ghost" title={up ? "I already have an account" : "I need an account"} onPress={() => setUp(!up)} />
        {!supabase ? <Text variant="muted" className="text-center">Demo mode: no backend configured, everything stays on this device.</Text> : null}
      </View>
    </Screen>
  );
}
