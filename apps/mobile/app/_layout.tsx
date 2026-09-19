import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/lib/store";

export default function RootLayout() {
  const setParent = useApp((s) => s.setParent);
  const flush = useApp((s) => s.flush);
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      if (u) { setParent({ id: u.id, email: u.email ?? "", firstName: (u.user_metadata?.first_name as string) ?? useApp.getState().parent?.firstName ?? "" }); void flush(); }
    });
    return () => data.subscription.unsubscribe();
  }, [setParent, flush]);
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FBFAF7" } }} />
      <PortalHost />
    </>
  );
}
