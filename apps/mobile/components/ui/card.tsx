import * as React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";
export function Card({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn("rounded-lg border border-border bg-card p-4", className)} {...props} />;
}
