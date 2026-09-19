import * as React from "react";
import { Text as RNText } from "react-native";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof RNText> & { variant?: "title" | "h2" | "body" | "muted" | "big" };
const styles = {
  title: "text-3xl font-extrabold text-foreground",
  h2: "text-xl font-bold text-foreground",
  body: "text-base text-foreground",
  muted: "text-sm text-muted-foreground",
  big: "text-5xl font-black text-foreground",
};
export function Text({ className, variant = "body", ...props }: Props) {
  return <RNText className={cn(styles[variant], className)} {...props} />;
}
