import * as React from "react";
import { TextInput } from "react-native";
import { cn } from "@/lib/utils";
export function Input({ className, ...props }: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      className={cn("h-14 rounded-lg border-2 border-input bg-card px-4 text-lg text-foreground", className)}
      placeholderTextColor="#94a3b8"
      {...props}
    />
  );
}
