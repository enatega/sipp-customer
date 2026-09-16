import React from "react";
import { StyleSheet } from "react-native";
import Icon from "../../../../general/components/Icon";
import PlatformGlassSurface from "../../../../general/components/PlatformGlassSurface";
import PressableScale from "../../../../general/components/PressableScale";
import { useTheme } from "../../../../general/theme/theme";

type Props = {
  accessibilityLabel: string;
  iconName: string;
  iconType?: "Ionicons" | "Feather" | "MaterialIcons";
  onPress: () => void;
};

export default function ProductMediaActionButton({
  accessibilityLabel,
  iconName,
  iconType = "Ionicons",
  onPress,
}: Props) {
  const { colors, layout, shape } = useTheme();

  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={[styles.pressable, { borderRadius: shape.radius.pill }]}
    >
      <PlatformGlassSurface
        effectStyle="clear"
        style={[
          styles.surface,
          {
            borderRadius: shape.radius.pill,
            height: layout.touchTarget.minimum,
            width: layout.touchTarget.minimum,
          },
        ]}
      >
        <Icon color={colors.textStrong} name={iconName} size={22} type={iconType} />
      </PlatformGlassSurface>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pressable: {
    overflow: "hidden",
  },
  surface: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
