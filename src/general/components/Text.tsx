import React from "react";
import { StyleProp, Text as RNText, TextStyle } from "react-native";
import { useTheme } from "../theme/theme";

export type TextVariant =
  | "display"
  | "title"
  | "subtitle"
  | "sectionTitle"
  | "cardTitle"
  | "body"
  | "supporting"
  | "label"
  | "caption"
  | "badge"
  | "numeric"
  | "button";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: TextVariant;
  weight?: "regular" | "medium" | "semiBold" | "bold" | "extraBold";
  color?: string;
  numberOfLines?: number;
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
  accessibilityRole?: "header" | "text";
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
};

export default function Text({
  children,
  style,
  variant = "body",
  weight = "regular",
  color,
  numberOfLines,
  allowFontScaling = true,
  maxFontSizeMultiplier = 1.8,
  accessibilityRole,
  ellipsizeMode,
}: Props) {
  const { colors, typography } = useTheme();

  const variantStyle: TextStyle = (() => {
    switch (variant) {
      case "display":
        return typography.role.display;
      case "title":
        return typography.role.screenTitle;
      case "subtitle":
      case "sectionTitle":
        return typography.role.sectionTitle;
      case "cardTitle":
        return typography.role.cardTitle;
      case "supporting":
        return typography.role.supporting;
      case "label":
        return typography.role.label;
      case "caption":
        return typography.role.caption;
      case "badge":
        return typography.role.badge;
      case "numeric":
        return typography.role.numeric;
      case "button":
        return typography.role.button;
      default:
        return typography.role.body;
    }
  })();

  return (
    <RNText
      style={[
        {
          color: color ?? colors.text,
          fontFamily: typography.fontFamily.regular,
          fontWeight: typography.fontWeight[weight] as any,
        },

        variantStyle,
        style,
      ]}
      numberOfLines={numberOfLines}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      accessibilityRole={accessibilityRole}
      ellipsizeMode={ellipsizeMode}
    >
      {children}
    </RNText>
  );
}
