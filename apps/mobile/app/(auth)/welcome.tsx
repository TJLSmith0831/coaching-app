import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/mascot";

export default function Welcome() {
  return (
    <Screen scroll={false} className="justify-between">
      <View className="items-center gap-6 pt-16">
        <Mascot pose="cheer" size="lg" />
        <Text variant="title" className="text-center">Coach</Text>
        <Text variant="body" className="text-center text-lg text-muted-foreground">10-minute practice levels for kids 8 to 13.{"\n"}Parents set it up in 5 minutes.</Text>
      </View>
      <View className="gap-3">
        <Button title="I'm a parent — get started" size="kid" onPress={() => router.push({ pathname: "/(auth)/sign-in", params: { mode: "up" } })} />
        <Button title="I already have an account" variant="outline" onPress={() => router.push({ pathname: "/(auth)/sign-in", params: { mode: "in" } })} />
      </View>
    </Screen>
  );
}
