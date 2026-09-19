import * as React from "react";
import { Pressable, Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/utils";

const button = cva("flex-row items-center justify-center gap-2 rounded-lg active:opacity-80 disabled:opacity-40", {
  variants: {
    variant: {
      default: "bg-primary",
      secondary: "bg-secondary",
      accent: "bg-accent",
      outline: "border-2 border-border bg-card",
      ghost: "",
      destructive: "bg-destructive",
    },
    size: { default: "h-14 px-6", sm: "h-11 px-4", kid: "h-16 px-8", icon: "h-14 w-14" },
  },
  defaultVariants: { variant: "default", size: "default" },
});
const label = cva("font-bold", {
  variants: {
    variant: {
      default: "text-primary-foreground text-lg",
      secondary: "text-secondary-foreground text-lg",
      accent: "text-accent-foreground text-lg",
      outline: "text-foreground text-lg",
      ghost: "text-primary text-base",
      destructive: "text-destructive-foreground text-lg",
    },
    size: { default: "", sm: "text-base", kid: "text-2xl", icon: "" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export type ButtonProps = React.ComponentProps<typeof Pressable> & VariantProps<typeof button> & { title?: string; textClassName?: string };

export function Button({ className, variant, size, title, children, onPress, textClassName, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(button({ variant, size }), className)}
      onPress={(e) => { Haptics.selectionAsync().catch(() => {}); onPress?.(e); }}
      {...props}
    >
      {title ? <Text className={cn(label({ variant, size }), textClassName)}>{title}</Text> : children}
    </Pressable>
  );
}
