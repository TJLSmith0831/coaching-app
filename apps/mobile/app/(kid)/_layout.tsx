import { Tabs } from "expo-router";
import { Compass, Camera, Trophy, User } from "lucide-react-native";

export default function KidTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#2E9E6A", tabBarLabelStyle: { fontSize: 13, fontWeight: "700" }, tabBarStyle: { height: 84, paddingTop: 8 } }}>
      <Tabs.Screen name="path" options={{ title: "Path", tabBarIcon: ({ color }) => <Compass color={color} size={28} /> }} />
      <Tabs.Screen name="scan" options={{ title: "Scan", tabBarIcon: ({ color }) => <Camera color={color} size={28} /> }} />
      <Tabs.Screen name="quests" options={{ title: "Quests", tabBarIcon: ({ color }) => <Trophy color={color} size={28} /> }} />
      <Tabs.Screen name="me" options={{ title: "Me", tabBarIcon: ({ color }) => <User color={color} size={28} /> }} />
    </Tabs>
  );
}
