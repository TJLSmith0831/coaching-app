import * as React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";
export function Screen({ children, className, scroll = true, footer }: { children: React.ReactNode; className?: string; scroll?: boolean; footer?: React.ReactNode }) {
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <Body className="flex-1" contentContainerClassName={scroll ? cn("gap-4 p-5 pb-8", className) : undefined} {...(!scroll ? { style: { flex: 1 } } : {})}>
        {scroll ? children : <View className={cn("flex-1 gap-4 p-5", className)}>{children}</View>}
      </Body>
      {footer ? <View className="border-t border-border bg-background p-5 pb-8">{footer}</View> : null}
    </SafeAreaView>
  );
}
