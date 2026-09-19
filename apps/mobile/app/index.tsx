import { Redirect } from "expo-router";
import { useApp } from "@/lib/store";

export default function Index() {
  const parent = useApp((s) => s.parent);
  const children = useApp((s) => s.children);
  const active = useApp((s) => s.activeChildId);
  if (!parent) return <Redirect href="/(auth)/welcome" />;
  if (children.length === 0) return <Redirect href="/onboarding" />;
  if (active) {
    const c = children.find((x) => x.id === active);
    if (c && !c.onboarded) return <Redirect href="/kid/onboarding" />;
    if (c) return <Redirect href="/(kid)/path" />;
  }
  return <Redirect href="/who" />;
}
