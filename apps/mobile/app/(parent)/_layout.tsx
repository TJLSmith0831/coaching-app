import { Tabs } from "expo-router";
import { LayoutDashboard, Users, CalendarDays, Gift, Settings } from "lucide-react-native";

export default function ParentTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#2E9E6A" }}>
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} /> }} />
      <Tabs.Screen name="children" options={{ title: "Children", tabBarIcon: ({ color }) => <Users color={color} size={24} /> }} />
      <Tabs.Screen name="plan" options={{ title: "Plan", tabBarIcon: ({ color }) => <CalendarDays color={color} size={24} /> }} />
      <Tabs.Screen name="rewards" options={{ title: "Rewards", tabBarIcon: ({ color }) => <Gift color={color} size={24} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }) => <Settings color={color} size={24} /> }} />
    </Tabs>
  );
}
